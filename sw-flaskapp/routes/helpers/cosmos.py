from azure.cosmos import CosmosClient
import azure.functions as func
from .auth import token_decode
import os

# Example container query
# items = container.query_items(query=f'SELECT * FROM c WHERE c.id = "{email}"', partition_key=f'{domain}')

def get_container(container_name):
    DB_NAME = 'studywheredb'
    CONTAINER_NAME = container_name
    client = CosmosClient.from_connection_string(os.getenv('CosmosDbConnectionString'))
    db = client.get_database_client(DB_NAME)
    container = db.get_container_client(CONTAINER_NAME)

    return container


def user_container():
    return get_container('users')

def session_container():
    return get_container('sessions')

