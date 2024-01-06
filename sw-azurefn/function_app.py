import azure.functions as func

from routes.user import bp as user
from routes.friends import bp as friends
from routes.session import bp as session

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# app.register_functions(getuser)
# app.register_functions(setuser)

app.register_functions(friends)
app.register_functions(user)
app.register_functions(session)
