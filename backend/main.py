from fastapi import FastAPI, status, HTTPException

from pydantic import BaseModel, EmailStr, ValidationError

from fastapi.middleware.cors import CORSMiddleware

import json

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



class Users(BaseModel):
    fullName:str
    email:str
    password:str
    username:str
    confirmPassword: str



# database
# databaseName = 
activeUsers = []

try:
    fs = open(settings.DATABASE, 'rt')
    activeUsers = fs.read()
    if activeUsers:
        activeUsers = json.loads(activeUsers)
    else:
        fs = open(settings.DATABASE, 'wt')
        fs.write('[]')
        fs.close()
except:
    print('somthing went wrong')
else:
    print('active users from file', activeUsers)
    # print(activeUsers)
    # print(type(activeUsers))

finally:
    fs.close()


@app.post('/register', status_code=status.HTTP_201_CREATED)
async def create_user(user:Users):
    print("dumppuing*****")
    user = user.model_dump()
    print('users', user)
    print('activeUsers', activeUsers)
    print(user['username'])
    is_present = any(user['username'] in list['username'] for list in activeUsers)
    if is_present:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "Username is already taken"
        )
    activeUsers.append(user)
    with open(settings.DATABASE, 'wt') as fs:
        fs.write(json.dumps(activeUsers))
    return {"message":"user created sucessrully", "data": user}

@app.get("/active", status_code = status.HTTP_200_OK)
def getActiveUsers():
    tempUser = ''
    with open("database.txt", 'rt') as fs:
        tempUser = json.loads(fs.read())
    return {"activeUsers": tempUser } 


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None, r:str | None = None):
    return {"item_id": item_id, "q": q, "r": r}




