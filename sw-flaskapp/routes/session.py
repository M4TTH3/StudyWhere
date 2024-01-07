from flask import Blueprint, Response, Request, request as req
import logging
from .helpers.error import bad_request
from .helpers.auth import auth_decorator
from .helpers.cosmos import session_container
import json
from azure.storage.queue import QueueClient, QueueMessage
import os

bp = Blueprint('session', __name__, url_prefix='/api')

def get_queue() -> QueueClient:
    return QueueClient.from_connection_string(os.getenv('AzureWebJobsStorage'), 'sessions')

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

@bp.route(rule='/me/session', methods=['POST'])
def add_session() -> Response:
    "Adds a session from any user to the queue to be added into the database"

    @auth_decorator(req=req)
    def upload_queue(token) -> Request:
        body: dict = req.get_json()
        queue = get_queue()

        # Ensure we have all the keys
        comparison_set = SESSION_KEYS.union(body.keys())
        if not comparison_set == SESSION_KEYS:
            return bad_request('Bad format')

        email = token['emails'][0]
        add_to_queue = body | {'action': 'ADD', 'email': email}

        queue.send_message(json.dumps(add_to_queue))

        return Response(json.dumps({
            'code': 200,
            'message': f'Successfully added session'
        }))
    
    return upload_queue()


@bp.route('/me/session', methods=['PATCH'])
def update_session() -> Response:
    logging.info('Updating session')

    @auth_decorator(req)
    def update(token):
        body: dict = req.get_json()
        queue = get_queue()

        if not set(body.keys()).issubset(SESSION_KEYS):
            return bad_request('Bad format')
        
        email = token['emails'][0]
        queue.send_message(json.dumps(body | {'email': email, 'action': 'PATCH'}))
        return Response(json.dumps({
            'code': 200,
            'message': f'Updating the session'
        }))
    
    return update()


@bp.route('/me/session', methods=['DELETE'])
def delete_session() -> Response:
    logging.info('Deleting user session')
    
    @auth_decorator(req=req)
    def delete(token):
        queue = get_queue()

        email = token['emails'][0]
        queue.send_message(json.dumps({'action': 'DELETE', 'email': email}))

        return Response(json.dumps({
                'code': 200,
                'message': 'Deleting the session'
        }))

    return delete()


def submit_session(queue_msg: 'QueueMessage') -> None:
    "Takes the session actions from the queue and adjusts the database one at a time."
    container = session_container()
    msg_dict: dict = json.loads(queue_msg.content)

    action = msg_dict.pop('action')
    email = msg_dict.get('email')

    logging.info(msg=json.dumps(msg_dict))

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
            
            email = msg_dict['email']
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

    return