import logging 
import azure.functions as func 
import json
from .helpers.auth import token_decode

bp = func.Blueprint()

@bp.function_name(name="getusersw")
@bp.route(route="getusersw/{email}", methods=['GET'])
@bp.cosmos_db_input(arg_name="user", database_name="studywheredb",
                      container_name="users", connection="CosmosDbConnectionString", 
                      partition_key='user', sql_query="SELECT * FROM c WHERE c.id = {email}")
def getusersw(req: func.HttpRequest, user: func.DocumentList) -> func.HttpResponse:
    try:
        googleuser = token_decode(req)
        route_email = req.route_params.get('email')
        if not googleuser or not f"{route_email}" == googleuser['email']:
            return func.HttpResponse("Failure")
    finally:
        return func.HttpResponse(json.dumps({"parameter": f'{type(user)} and {user.data}'}))