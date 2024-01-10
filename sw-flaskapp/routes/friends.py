from flask import Response, request as req, Blueprint, current_app
import json
from .helpers.cosmos import session_container
from .helpers.userattr import UserData, details_list, details
from .helpers.error import bad_request, internal_server
from azure.cosmos.exceptions import CosmosHttpResponseError
from .helpers.auth import token_decode, UNAUTHORIZEDACCESS

class FriendNotFound(Exception):
    pass
    
def friend_decorator(friend_func) -> Response:
    "A decorator that authorizes the account and passes the token and additional arguments"

    def friend_wrapper(*args, **kwargs) -> Response:
        token = token_decode(req)
        if not token:
            return UNAUTHORIZEDACCESS
        try:
            return friend_func(token)
        except CosmosHttpResponseError:
            return bad_request("Unable to retrieve accounts")
        
        except FriendNotFound:
            return bad_request("Friend not found")
        
    return friend_wrapper
    

def get_sessions(users_email: list[str]) -> dict:
    ret = {}
    sessions = {}
    
    container = session_container()

    # Have to join all the db_sessions together first
    for db_sessions in container.read_all_items(max_item_count=3):
        sessions.update(db_sessions['sessions'])

    for email in users_email:
        if (email in sessions): ret[email] = sessions[email]

    return ret

def friends_details(user: UserData) -> dict[str, list[dict[str, dict[str, str]]]]:
    "Gets user's friends, friends in, and friends out, public details"

    #Get all friends' sessions too
    sessions = get_sessions(user.friends.keys())

    return {
        'friends': details_list(user.friends),
        'friends_in': details_list(user.friends_in),
        'friends_out': details_list(user.friends_out),
        'sessions': sessions
    }

bp = Blueprint('friends', __name__, url_prefix='/api')

@bp.route(rule="/me/friends", methods=['GET'], endpoint='get_friends')
@friend_decorator
def get_friends(token: dict) -> Response:
    "Gets all the friends of a user sorted by email"
    user = UserData(token=token)
    return json.dumps(friends_details(user)), 200


@bp.route(rule='/me/friends/<email>', methods=['GET'], endpoint='get_friend')
@friend_decorator
def get_friend(token: dict) -> Response:
    "Gets a friend"
    user = UserData(token=token)
    target = req.args.get('email')
    if not target or not target in user.friends:
        raise FriendNotFound

    return json.dumps(details(target, user.friends[target])), 200


@bp.route(rule="/me/friends", methods=['POST'], endpoint='add_friend')
@friend_decorator
def add_friend(token) -> Response:
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

    return json.dumps(friends_details(sender)), 200
    

@bp.route(rule="/me/friends/<email>", methods=['DELETE'], endpoint='del_friend')
@friend_decorator
def del_friend(token) -> Response:
    "Cancels a sent friend request, rejects a friend invite, or deletes a friend."
    user = UserData(token=token)

    del_email = req.args.get('email')
    if not del_email or not del_email in user.friends:
        raise FriendNotFound

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

    return json.dumps(friends_details(user)), 200

        

