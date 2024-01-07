# A set of functions for error handling
from flask import Response
import json

def errorRequest(error: str, code: int) -> Response:
    return Response(
        response=json.dumps({
            'code': code,
            'message': error
        }),
        status=code
    )

def bad_request(error: str) -> Response:
    return errorRequest(error, 400)

def internal_server(error: str) -> Response:
    return errorRequest(error=error, code=500)