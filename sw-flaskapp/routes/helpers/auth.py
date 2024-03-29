from flask import Request, Response, current_app
from .error import errorRequest, bad_request
from azure_ad_verify_token import verify_jwt
from azure.cosmos.exceptions import CosmosHttpResponseError
import requests

import os

UNAUTHORIZEDACCESS = errorRequest('Unauthorized Access to StudyWhere', 401)

def token_decode(req: Request) -> dict:
    "Verifies the token received including expiry date etc. and returns the content"
    auth_content: str = req.headers.get('Authorization')
    if not auth_content:
        return None

    try:
        contents = auth_content.split(' ')
        bearer = contents[0]
        token = contents[1]

        if not bearer == 'Bearer':
            raise ValueError

        # Verifying that it's not expired
        client_id = 'c35c7db8-2fd9-44f1-9497-f1116584e1fd'
        aad_issuer = os.getenv('AAD_ISSUER')
        aad_uri = os.getenv('AAD_URI')

        payload = verify_jwt(
                    token=token,
                    valid_audiences=[client_id],
                    issuer=aad_issuer,
                    jwks_uri=aad_uri,
                    verify=True
                )

        return payload

    except Exception:
        return None


def auth_decorator(req: Request):
    "A decorator for an inner function that authorizes the account and passes the auth jwt token"
    def decorator(my_func):
        def wrapper() -> Response:
            token = token_decode(req)
            if not token:
                return UNAUTHORIZEDACCESS
            try:
                return my_func(token)
            
            except CosmosHttpResponseError:
                return bad_request("Unable to retrieve accounts")
            
        return wrapper
        
    return decorator
