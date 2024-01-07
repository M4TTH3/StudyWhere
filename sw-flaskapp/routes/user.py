from flask import Blueprint, request as req, Response
from azure.cosmos.exceptions import CosmosHttpResponseError
from .helpers.auth import token_decode, UNAUTHORIZEDACCESS
from .helpers.userattr import UserData, get_email_domain
from .helpers.error import bad_request, internal_server
import json

bp = Blueprint('user')

@bp.route(route='newuser/', methods=['POST'])
def newuser():
    token = token_decode(req)
    if not token:
        return UNAUTHORIZEDACCESS
    
    user: UserData

    try:
        user = UserData(token=token)
        return bad_request("Already created")
    
    except CosmosHttpResponseError:
        user = UserData()
        user.id = token['emails'][0]
        user.domain = get_email_domain(user.id)
        user.oid = token['oid']
        user.photo = 'https://studywherea189.blob.core.windows.net/studywhere-photos/profile.png'

        user.upload_db()

        return json.dumps({'message': 'Successfully added'}), 200
    
    except Exception:
        return internal_server('Error occurred adding')

    
