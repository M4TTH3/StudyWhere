from routes.session import submit_session, get_queue
from dotenv import load_dotenv
from pathlib import Path
import time

def read_queue() -> None:
    while True:
        queue = get_queue()
        messages = queue.receive_messages()

        for msg in messages:
            try:
                print('running')
                submit_session(msg)
                queue.delete_message(msg)
            except:
                print('failed')
                continue 
        
        time.sleep(5)

if __name__ == "__main__":
    if (Path('.env')):
        load_dotenv(str(Path('.env').absolute()))
    read_queue()
