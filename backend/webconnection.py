from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionError(Exception):
    pass

class ConnectionManager:
    def __init__(self) -> None:
        self.activeConnection: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username:str)-> None:
        await websocket.accept()
        if username not in self.activeConnection:
            self.activeConnection[username] = websocket

        # raise ConnectionError('user already there but trying to connect again')



    def disconnect(self, websocket: WebSocket, username: str):
        if username not in self.activeConnection:
            raise ConnectionError('no user in active connection')

        del self.activeConnection[username]
        

    async def send_private_message(self, sender:str, recipient:str, message:str, message_type:str):
        send_details = {
                        'sender': sender,
                        'recipient': recipient,
                        'type': message_type,
                        'message': message
                        }
        
        print(send_details)
        
        if sender in self.activeConnection and recipient in self.activeConnection:
            for user in [sender, recipient]:
                await self.activeConnection[user].send_json(send_details)


    async def broadcast(self, sender:str, message: str, message_type:str):

        if any(self.show_all_active_user):

            for WebSocket_connection in self.activeConnection.values():
                await WebSocket_connection.send_json({'type': message_type, 'sender':sender  ,'message': message})

    @property
    def show_all_active_user(self):
       return [activeUser for activeUser in self.activeConnection.keys()]

    async def send_all_active_user(self):
        if any(self.show_all_active_user):
            for WebSocket_connection in self.activeConnection.values():
                await WebSocket_connection.send_json({'type': 'active_users', 'message': self.show_all_active_user})


    def __str__(self)->None:
        print(f'This manager class object store socket object. Currently {len(self.activeConnection)} active connection')


manager = ConnectionManager()



