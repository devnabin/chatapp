from fastapi import (
    FastAPI,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)

from pydantic import BaseModel, EmailStr, ValidationError

from fastapi.middleware.cors import CORSMiddleware

import json

from loadFileData import smallDB, UsersLoggedIn
from webconnection import manager

from datetime import datetime

#  for .envs file
from config import settings 

app = FastAPI()

# 2. Add the CORS middleware to your FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # Allows requests from your specific origins
    allow_credentials=True,           # Allows cookies/authentication headers
    allow_methods=["*"],              # Allows all HTTP methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],              # Allows all headers
)



@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            # Keep waiting for events from the dashboard
            data = await websocket.receive_json()

            event_type = data.get("type")

            # Reply to a ping so the frontend knows the server is available
            if event_type == "ping":
                await websocket.send_json({
                    "type": "pong",
                })

            # data = await websocket.receive_text()
            # print(manager.getActiveUser())
            # # await manager.send_personal_message(f"You wrote: {data}", websocket)
            # message = {"time":current_time,"clientId":username,"message":data}
            # await manager.broadcast(json.dumps(message))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, username)
        # message = {"time":current_time,"clientId":username,"message":"offline"}
        # await manager.broadcast(json.dumps(message))




@app.get("/active")
async def get_active_users():
    return {
        "activeUsers": manager.getActiveUser()
    }



class Users(BaseModel):
    fullName:str
    email:str
    password:str
    username:str
    confirmPassword: str





# # database
# # databaseName = 
# activeUsers = []

# try:
#     fs = open(settings.DATABASE, 'rt')
#     activeUsers = fs.read()
#     if activeUsers:
#         activeUsers = json.loads(activeUsers)
#     else:
#         fs = open(settings.DATABASE, 'wt')
#         fs.write('[]')
#         fs.close()
# except:
#     print('somthing went wrong')
# else:
#     print('active users from file', activeUsers)
#     # print(activeUsers)
#     # print(type(activeUsers))

# finally:
#     fs.close()


@app.post('/register', status_code=status.HTTP_201_CREATED)
async def create_user(user:Users):

    def generateError(details, code = status.HTTP_400_BAD_REQUEST):
        raise HTTPException(
            status_code = code,
            detail = details
        )
    
    if user.password != user.confirmPassword: 
        generateError("Password doesn't matched!")

    if smallDB.checkDetails(user.username, 'username'):
        generateError("UserName is already taken!")

    if smallDB.checkDetails(user.email, 'email'):
            generateError("Email is already taken!")

    if smallDB.createUser(user):
        return {"message":"user created sucessrully", "data": user}
    else:
        generateError("Something Went Wrong!")

class loginUser(BaseModel):
    username:str
    password:str


@app.post("/login", status_code = status.HTTP_200_OK)  
async def login(user:loginUser):
    if not smallDB.userLoggin(user):
        raise HTTPException(
                    status_code = status.HTTP_404_NOT_FOUND,
                    detail = "User not found"
                )

    return {"success" : user}




@app.get("/")
async def read_root():
    return {"Hello": "World"}


# @app.get("/items/{item_id}")
# async def read_item(item_id: int, q: str | None = None, r:str | None = None):
#     return {"item_id": item_id, "q": q, "r": r}




