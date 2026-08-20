from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self) -> None:
        self.activeConnection: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, username:str)-> None:
        await websocket.accept()
        self.activeConnection.append({"websocket": websocket, "username": username})

    def disconnect(self, websocket: WebSocket, username: str):
        self.activeConnection.remove({"websocket": websocket, "username": username})

    async def send_personal_message(self, message:str, websocket:WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.activeConnection:
            await connection["websocket"].send_text(message)

    def getActiveUser(self):
        try:
            a = [person["username"] for person in self.activeConnection]
        except Exception as e:                
            print('Error type', e )
        else:
            return a

       
    @classmethod
    def __str__(self)->None:
        print("hello wolrd")


manager = ConnectionManager()



