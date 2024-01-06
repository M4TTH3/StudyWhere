import logging 
import azure.functions as func 
from .helpers.auth import token_decode

bp = func.Blueprint()

@bp.route(route="setusersw/{email}", methods=['POST'])
@bp.cosmos_db_output(arg_name="doc", database_name="studywheredb", create_if_not_exists=False,
                      container_name="users", connection="CosmosDbConnectionString")
@bp.cosmos_db_input(arg_name="user", database_name="studywheredb",
                      container_name="users", connection="CosmosDbConnectionString", 
                      partition_key='user', sql_query="SELECT * FROM c WHERE c.id = {email}")
def setusersw(req: func.HttpRequest, doc: func.Out[func.Document], user: func.DocumentList) -> func.HttpResponse:
    if len(user.data) != 0:
        return func.HttpResponse(f"{doc.get()}")

    googleuser = token_decode(req)

    if googleuser and googleuser['email'] == req.route_params.get('email'):
        upload = {
            'id': googleuser['email'],
            'swid': 'sdsdsdsd',
            'pfp': googleuser['picture']
        }

        doc.set(func.Document.from_dict(upload))
        
        return func.HttpResponse("SUCCESS")

    return func.HttpResponse("FAIL")