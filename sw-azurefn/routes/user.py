import azure.functions as func 
from azure.cosmos.exceptions import CosmosHttpResponseError
from .helpers.auth import token_decode, UNAUTHORIZEDACCESS
from .helpers.userattr import UserData, get_email_domain
from .helpers.error import bad_request, internal_server
import json

bp = func.Blueprint()

@bp.function_name('newuser')
@bp.route(route='newuser', methods=['POST'])
def newuser(req: func.HttpRequest) -> func.HttpResponse:
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

        return func.HttpResponse(body=json.dumps({
            'message': 'Successfully added'
        }))
    
    except Exception:
        return internal_server('Error occurred adding')

    
