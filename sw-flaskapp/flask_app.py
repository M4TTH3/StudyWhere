from flask import Flask

from routes.user import bp as user
from routes.friends import bp as friends
from routes.session import bp as session

app = Flask(__name__)
app.config['APPLICATION_ROOT'] = '/api'

app.register_blueprint(friends)
app.register_blueprint(user)
app.register_blueprint(session)
