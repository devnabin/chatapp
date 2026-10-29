import asyncio

from config import settings
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url= settings.END_POINT,
    api_key= settings.API_KEY
)


history = {
}


async def aichat(message, username):

    print(message)

    if username in history:
        history[username].append({
                "role": "user",
                "content": message,
            })
    else:
        history[username] = [{
                        "role" : "system",
                        "content" : f"""
                        Your name is Bin AI name by Nabin Bhandari
                        You are the good friends, who talk politely and very helpful.
                        You don't talk too much you are straight fordward person.
                        You give response short and sweet.
                        
                        While answering keep remember these things:
                        1. Always response on plain words.
                        2. You can simmply back fire the question after your responselike a friend
                        
                        Do nots:
                        1. donot use markdown structure while answring
                        2. do not include any type of symbols or emojis while answring
                        3. Do not answer or question like a robot 
                        4. Do not answer or question like a AI 
                        """
                    },
                    {
                "role": "user",
                "content": message,
            }]

    completion = await client.chat.completions.create(
        model=settings.DEPLOYMENT_NAME,
        messages= history[username],
    )


    assistant_reply = completion.choices[0].message.content


    history[username].append({
                "role": "assistant",
                "content": assistant_reply,
            })

    print(f'(ai_chat_TEST): model_response:{assistant_reply}')
    
    return {'reply' : assistant_reply}


