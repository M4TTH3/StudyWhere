from flask import Flask
from dotenv import load_dotenv
from pathlib import Path

from routes.user import bp as user
from routes.friends import bp as friends
from routes.session import bp as session

app = Flask(__name__)

app.register_blueprint(friends)
app.register_blueprint(user)
app.register_blueprint(session)

if __name__ == "__main__":
    if (Path('.env')):
        load_dotenv(str(Path('.env').absolute()))
    app.run('0.0.0.0', 5000, debug=True)
