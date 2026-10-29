from config import settings
from fastapi import APIRouter, status
from openai import AsyncOpenAI
from pydantic import BaseModel

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

history = [
            {
                "role" : "system",
                "content" : "give answer in plain text donot use markdown structure or any type of symbol while answring"
            },
        ]

@router.post("/chat", status_code = status.HTTP_200_OK)
async def aichat(message:Msg):
    print(Msg)
    print(message)
    user_msg = message.message

    print(user_msg)

    history.append({
                "role": "user",
                "content": user_msg,
            })
    

    print(history)

    completion = await client.chat.completions.create(
        model=settings.DEPLOYMENT_NAME,
        messages= history,
    )


    assistant_reply = completion.choices[0].message.content


    history.append({
                "role": "assistant",
                "content": assistant_reply,
            })

    print(f'(ai_chat_TEST): model_response:{assistant_reply}')
    
    return {'reply' : assistant_reply}






