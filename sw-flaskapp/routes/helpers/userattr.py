from .cosmos import user_container
import requests as req
import os

# A module for user attributes


def get_email_domain(email: str) -> str:
    at_index = email.index('@')
    period_index = email.index('.', at_index)
    return email[at_index + 1: period_index]

class UserData:

    def __init__(self, **kwargs) -> None:
        """
        kwargs options: email: str, token: str

        id: str,
        domain: str,
        oid: str,
        photo: str
        friends: dict[str, dict[str, str]]
        friends_in: dict[str, dict[str, str]]
        friends_out: dict[str, dict[str, str]]
        """

        email: str = kwargs.get('email')
        token: dict[str, any] = kwargs.get('token')

        id: str
        domain: str

        if email:
            id = email
            domain = get_email_domain(email)
        elif token:
            id = token.get('emails')[0]
            domain = get_email_domain(id)
        
        # Defaults if no readable content
        else:
            self.id = ''
            self.oid = ''
            self.domain = '',
            self.photo = ''
            self.friends = {}
            self.friends_in = {}
            self.friends_out = {}
            return

        container = user_container()
        data = container.read_item(id, domain)

        self.id = data['id']
        self.domain = data['domain']
        self.oid = data['oid']
        self.photo = data['photo']
        self.friends = data['friends']
        self.friends_in = data['friends_in']
        self.friends_out = data['friends_out']


    def upload_db(self) -> None:
        "Uploads the contents of the user to the database"
        container = user_container()
        contents = {
            'id': self.id,
            'domain': self.domain,
            'oid': self.oid,
            'photo': self.photo,
            'friends': self.friends,
            'friends_in': self.friends_in,
            'friends_out': self.friends_out
        }

        container.upsert_item(contents)


def details(email: str, contents: dict[str, str], level='basic') -> dict[str, str]:
    """
    Gets a friends public details
    email: str
    contents = 
    {
        ...,
        oid: str,
        photo: str
    }
    """
    return {
        'displayName': get_graph_name(contents.get('oid')),
        'email': email,
        'photo': contents.get('photo')
    }


def details_list(users: dict[str, dict[str, str]], level='basic') -> list[dict[str, str]]:
    """
    Returns a list of friends and their public details.
    level: 'basic' | 'full', determines the level of details
    """
    ret: list[dict[str, str]] = []

    for email, contents in users.items():
        ret.append(details(email, contents))
    
    # Sort the contents
    ret.sort(key=(lambda x: x.get('email')))
    return ret


def get_graph_name(oid: str) -> str:
    "Get the name of the user"
    if oid:
        contents = get_graph_data(oid=oid)
        if contents:
            name = contents.get('displayName')
            return name if name else 'Error'
    
    return 'Error'


def get_graph_data(oid: str) -> dict[str, any]:
    "Gets the graph data of an object id"
    token_url = os.getenv('GRAPH_TOKEN_URL')
    post = req.post(
        url=token_url,
        data={
            'client_id': os.getenv('GRAPH_CLIENT_ID'),
            'scope': 'https://graph.microsoft.com/.default',
            'client_secret': os.getenv('GRAPH_CLIENT_SECRET'),
            'grant_type': 'client_credentials'
        },
    )

    payload = post.json()

    bearer = 'Bearer ' + payload['access_token']
    graph_url = f'https://graph.microsoft.com/v1.0/users/{oid}'
    user_data = req.get(
        url=graph_url,
        headers={
            'content-type': 'application/json',
            'Authorization': bearer
        }
    )

    if user_data.status_code == 200:
        return user_data.json()
