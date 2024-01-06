# A set of functions for error handling

import azure.functions as func
import json

def errorRequest(error: str, code: int) -> func.HttpResponse:
    return func.HttpResponse(
        body=json.dumps({
            'code': code,
            'message': error
        }),
        status_code=code
    )

def bad_request(error: str) -> func.HttpResponse:
    return errorRequest(error, 400)

def internal_server(error: str) -> func.HttpResponse:
    return errorRequest(error=error, code=500)