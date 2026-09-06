from fastapi import status, APIRouter
from pydantic import BaseModel
from openai import AsyncOpenAI
from config import settings

router = APIRouter(
    # prefix = "/ai",
    tags=["AI"]
)


client = AsyncOpenAI(
    base_url= settings.END_POINT,
    api_key= settings.API_KEY
)

class Msg(BaseModel):
    message : str

@router.post("/chat", status_code = status.HTTP_200_OK)
async def aichat(message:Msg):
    print(f'(ai_chat_TEST): user_msg:{message.message}')
    completion = await client.chat.completions.create(
        model=settings.DEPLOYMENT_NAME,
        messages=[
            {
                "role" : "system",
                "content" : "give answer in plain paragraph donot use markdown structure or any type of structure"
            },
            {
                "role": "user",
                "content": message.message,
            }
        ],
    )
    print(f'(ai_chat_TEST): model_response:{completion.choices[0].message.content}')
    
    return {'reply' : completion.choices[0].message.content}









