import azure.functions as func 
import json
from .helpers.userattr import UserData, details_list, details
from .helpers.error import bad_request, internal_server
from azure.cosmos.exceptions import CosmosHttpResponseError
from .helpers.auth import token_decode, UNAUTHORIZEDACCESS

class FriendNotFound(Exception):
    pass
    
def friend_decorator(friend_func) -> func.HttpResponse:
    "A decorator that authorizes the account and passes the token and additional arguments"

    def friend_wrapper_ret(req: func.HttpResponse) -> func.HttpResponse:
        token = token_decode(req)
        if not token:
            return UNAUTHORIZEDACCESS
        try:
            return friend_func(req, token)
        
        except CosmosHttpResponseError:
            return bad_request("Unable to retrieve accounts")
        
        except FriendNotFound:
            return bad_request("Friend not found")
    
    def friend_wrapper(req: func.HttpRequest) -> func.HttpResponse:
        return friend_wrapper_ret(req)
        
    return friend_wrapper
    

def friends_details(user: UserData) -> dict[str, list[dict[str, dict[str, str]]]]:
    "Gets user's friends, friends in, and friends out, public details"
    return {
        'friends': details_list(user.friends),
        'friends_in': details_list(user.friends_in),
        'friends_out': details_list(user.friends_out)
    }

bp = func.Blueprint()

@bp.function_name(name="get_friends")
@bp.route(route="me/friends", methods=['GET'], trigger_arg_name='req')
@friend_decorator
def get_friends(req: func.HttpRequest, token) -> func.HttpResponse:
    "Gets all the friends of a user sorted by email"
    user = UserData(token=token)
    return func.HttpResponse(body=json.dumps(friends_details(user)))

@bp.function_name(name='get_friend')
@bp.route(route='me/friends/{email:length(3,320)}', methods=['GET'])
@friend_decorator
def get_friend(req: func.HttpRequest, token: dict) -> func.HttpResponse:
    "Gets a friend"
    user = UserData(token=token)
    target = req.route_params.get('email')
    if not target or not target in user.friends:
        raise FriendNotFound

    return func.HttpResponse(body=json.dumps(details(target, user.friends[target])))


@bp.function_name(name="add_friend")
@bp.route(route="me/friends", methods=['POST'])
@friend_decorator
def add_friend(req: func.HttpRequest, token) -> func.HttpResponse:
    "This function adds a friend"

    # The account sending
    sender = UserData(token=token)
    s_id = sender.id

    # The account being added
    receiver_email: str = req.get_json()['to_email']
    receiver = UserData(email=receiver_email)
    r_id = receiver.id

    if r_id == s_id:
        return bad_request("Unable to add self")

    if r_id in sender.friends:
        return bad_request('Already friends')
    
    elif r_id in sender.friends_out:
        return bad_request("Already sent")

    # Accepting an email request
    elif r_id in sender.friends_in:
        sender.friends[r_id] = sender.friends_in[r_id]
        del sender.friends_in[r_id]

        receiver.friends[s_id] = receiver.friends_out[s_id]
        del receiver.friends_out[s_id]

    # Not friends yet
    else:
        sender.friends_out[r_id] = {'oid': receiver.oid, 'photo': receiver.photo}
        receiver.friends_in[s_id] = {'oid': sender.oid, 'photo': sender.photo}

    sender.upload_db()
    receiver.upload_db()

    return func.HttpResponse(json.dumps(friends_details(sender)))
    

@bp.function_name(name="cancel_friend_req")
@bp.route(route="me/friends/{email:length(3,320)}", methods=['DELETE'])
@friend_decorator
def del_friend(req: func.HttpRequest, token) -> func.HttpResponse:
    "Cancels a sent friend request, rejects a friend invite, or deletes a friend."
    user = UserData(token=token)

    del_email = req.route_params['email']
    del_user = UserData(email=del_email)

    # Delete from friends list
    if del_email in user.friends:
        del user.friends[del_email]
        del del_user.friends[user.id]
    
    # Reject a friend invite
    elif del_email in user.friends_in:
        del user.friends_in[del_email]
        del del_user.friends_out[user.id]

    # Cancel a friend invite
    elif del_email in user.friends_out:
        del user.friends_out[del_email]
        del del_user.friends_in[user.id]

    else:
        raise FriendNotFound
    
    # Upload the new contents
    user.upload_db() 
    del_user.upload_db()

    return func.HttpResponse(body=json.dumps(friends_details(user)))

        

