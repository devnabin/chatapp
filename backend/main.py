from fastapi import (
    FastAPI,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, EmailStr, ValidationError

#  for .envs file
from config import settings 

from loadFileData import smallDB, UsersLoggedIn
from webconnection import manager

from routes.ai_chat import router as ai_router

app = FastAPI()
app.include_router(ai_router)

# 2. Add the CORS middleware to your FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins = [settings.CORS_ORIGIN],            # Allows requests from your specific origins but * means any origin
    allow_credentials = False,           # Allows cookies/authentication headers
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],              # Allows all HTTP methods (POST, GET, OPTIONS, etc.)
    allow_headers =["Content-Type", "Authorization"],              # Allows all headers
)


# @app.post("/login", status_code = status.HTTP_200_OK)  
# async def login(user:loginUser):
#     if not smallDB.userLoggin(user):
#         raise HTTPException(
#                     status_code = status.HTTP_404_NOT_FOUND,
#                     detail = "User not found"
#                 )

#     return {"success" : user}


from fastapi import WebSocket, WebSocketDisconnect


@app.websocket("/ws/{username}")
async def websocket_endpoint(
    websocket: WebSocket,
    username: str,
) -> None:
    await manager.connect(websocket, username)

    # print(manager.show_all_active_user)

    try:
        while True:
            data = await websocket.receive_json()

            event_type = data.get("type")

            if event_type == "ping":
                await websocket.send_json({
                    "type": "pong",
                })

            elif event_type == "private_message":
                await manager.send_private_message(
                    sender=username,
                    recipient=data.get("recipient"),
                    message=data.get("message"),
                    message_type = event_type
                )

            elif event_type == "group_message":
                await manager.broadcast(
                    sender=username,
                    # group_id=data.get("group_id"),
                    message=data.get("message"),
                    message_type = event_type
                )

            if event_type == "active_users":
                await manager.send_all_active_user()

    except WebSocketDisconnect:
        print(f"{username} disconnected")


    finally:
        manager.disconnect(websocket, username)
        await manager.send_all_active_user()
        await manager.broadcast('user diconnected', 'group_message')

# @app.websocket("/ws/{username}")
# async def websocket_endpoint(websocket: WebSocket, username: str):
#     await manager.connect(websocket, username)
#     print(manager.show_all_active_user)
#     try:
#         while True:
#             # Keep waiting for events from the dashboard
#             data = await websocket.receive_json()

#             event_type = data.get("type")

#             # Reply to a ping so the frontend knows the server is available
#             if event_type == "ping":
#                 await websocket.send_json({
#                     "type": "pong",
#                 })

#             # data = await websocket.receive_text()
#             # print(manager.getActiveUser())
#             # # await manager.send_personal_message(f"You wrote: {data}", websocket)
#             # message = {"time":current_time,"clientId":username,"message":data}
#             # await manager.broadcast(json.dumps(message))
            
#     except WebSocketDisconnect:
#         manager.disconnect(websocket, username)
#         # message = {"time":current_time,"clientId":username,"message":"offline"}
#         # await manager.broadcast(json.dumps(message))




# @app.get("/active")
# async def get_active_users():
#     return {
#         "activeUsers": manager.show_all_active_user
#     }



class Users(BaseModel):
    fullName:str
    email:str
    password:str
    username:str
    confirmPassword: str


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




