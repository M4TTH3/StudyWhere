import azure.functions as func 
import logging
from .helpers.error import bad_request
from .helpers.auth import auth_decorator
from .helpers.cosmos import session_container
import json

bp = func.Blueprint()

""" 
Sessions will follow this format in the db

JSON format:

str :param email: The user that is posting 
list :param times: The times in epoch
str :param title: The title of the session
str :param buildingName: The name of the building
str :param roomName: The name of the room in the building
float :param latitude: the latitude
float :param longitude: the longitude  
list :param tasks: The tasks being completed in the session
int (1-10) :param capacity: How full a location is currently 

"""

SESSION_KEYS = {'times', 'title', 'buildingName', 'roomName', 'latitude', 'longitude', 'tasks', 'capacity'}
DB_LOCATIONS = (('session1', 'waterloo'), ('session2', 'waterloo'), ('session3', 'waterloo'))

@bp.function_name('add_session')
@bp.route(route='me/session', methods=['POST'])
@bp.queue_output(arg_name='queueOut', queue_name='sessions', connection='AzureWebJobsStorage')
def add_session(req: func.HttpRequest, queueOut: func.Out[str]) -> func.HttpResponse:
    "Adds a session from any user to the queue to be added into the database"

    @auth_decorator(req=req)
    def upload_queue(token) -> func.HttpRequest:
        body: dict = req.get_json()

        # Ensure we have all the keys
        comparison_set = SESSION_KEYS.union(body.keys())
        if not comparison_set == SESSION_KEYS:
            return bad_request('Bad format')

        email = token['emails'][0]
        add_to_queue = body | {'action': 'ADD', 'email': email}

        queueOut.set(json.dumps(add_to_queue))

        return func.HttpResponse(json.dumps({
            'code': 200,
            'message': f'Successfully added session'
        }))
    
    return upload_queue()


@bp.function_name('update_session')
@bp.route('me/session', methods=['PATCH'])
@bp.queue_output(arg_name='queueOut', queue_name='sessions', connection='AzureWebJobsStorage')
def update_session(req: func.HttpRequest, queueOut: func.Out[str]) -> func.HttpResponse:
    logging.info('Updating session')

    @auth_decorator(req)
    def update(token):
        body: dict = req.get_json()

        if not set(body.keys()).issubset(SESSION_KEYS):
            return bad_request('Bad format')
        
        email = token['emails'][0]
        queueOut.set(json.dumps(body | {'email': email, 'action': 'PATCH'}))

        return func.HttpResponse(json.dumps({
            'code': 200,
            'message': f'Updating the session'
        }))
    
    return update()


@bp.function_name('delete_session')
@bp.route('me/session', methods=['DELETE'])
@bp.queue_output(arg_name='queueOut', queue_name='sessions', connection='AzureWebJobsStorage')
def delete_session(req: func.HttpRequest, queueOut: func.Out[str]) -> func.HttpResponse:
    logging.info('Deleting user session')
    
    @auth_decorator(req=req)
    def delete(token):
        email = token['emails'][0]
        queueOut.set(json.dumps({'action': 'DELETE', 'email': email}))

        return func.HttpResponse(json.dumps({
                'code': 200,
                'message': 'Deleting the session'
        }))

    return delete()



@bp.function_name('submit_session')
@bp.queue_trigger(arg_name='msg', queue_name='sessions', connection='AzureWebJobsStorage')
def submit_session(msg: func.QueueMessage) -> None:
    "Takes the session actions from the queue and adjusts the database one at a time."
    logging.info('Uploading session to DB')
    container = session_container()

    msg_dict: dict = msg.get_json()
    action = msg_dict.pop('action')
    email = msg_dict.get('email')

    def db_generator():
        for location_id, partition_key in DB_LOCATIONS:
            item: dict[str, any] = container.read_item(item=location_id, partition_key=partition_key)
            yield item

    def add():
        for item in db_generator():
            item: dict[str, any]
            sessions: dict[str, any] = item['sessions']

            # Max size for a session db
            if len(sessions) >= 500:
                continue
            
            email = msg.get_json()['email']
            sessions[email] = msg_dict
            container.upsert_item(item)
            return
    
    def delete():
        for item in db_generator():
            item: dict[str, any]
            sessions: dict[str, any] = item['sessions']

            session = sessions.get(email)
            if session:
                del sessions[email]
                container.upsert_item(item)
                return

    def patch():
        for item in db_generator():
            item: dict[str, any]
            sessions: dict[str, any] = item['sessions']

            session: dict = sessions.get(email)
            if session:
                session.update(msg_dict)
                container.upsert_item(item)
                return

    foos = {'ADD': add, 'DELETE': delete, 'PATCH': patch}
    if action in foos:
        foos[action]()


# @bp.function_name('clear_sessions')
# @bp.timer_trigger(arg_name='req', schedule="0 */5 * * * *", run_on_startup=True)
# def clear_sessions(mytimer: func.TimerRequest) -> None:
#     pass