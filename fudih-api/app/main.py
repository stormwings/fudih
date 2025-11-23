import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class Message(BaseModel):
    role: str
    content: str
    image_data: list[str] | None = None


class ChatRequest(BaseModel):
    messages: list[Message]


def generate_image(prompt: str, quality: str = "standard") -> str:
    """
    Generate an image using OpenAI's DALL-E 3 model.
    """
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            quality=quality,
            n=1,
        )

        print("Image generated successfully")
        return response.data[0].url

    except Exception as e:
        print(f"Image generation failed: {str(e)}")
        raise


@app.get("/")
def read_root():
    return {"message": "API - FastAPI"}


@app.post("/chat")
async def chat(chat_request: ChatRequest):
    try:
        formatted_messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant. You can generate images with DALL-E 3 and analyze images that the user sends you."
            }
        ]

        for message in chat_request.messages:
            if message.image_data:
                content_parts = [{"type": "text", "text": message.content}]

                for image_data_base64 in message.image_data:
                    content_parts.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_data_base64}"
                        }
                    })

                formatted_messages.append({
                    "role": message.role,
                    "content": content_parts,
                })
            else:
                formatted_messages.append({
                    "role": message.role,
                    "content": message.content,
                })

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "generate_image",
                    "description": "When the user requests it, generate an image",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string",
                                "description": "The prompt that will generate the image"
                            },
                            "quality": {
                                "type": "string",
                                "description": "Image quality. Can be 'hd' or 'standard'"
                            }
                        }
                    }
                }
            }
        ]

        async def generate():
            accumulated_args = ""
            response = None
            current_tool_call_id = None
            messages_copy = formatted_messages.copy()

            while True:
                if response is None:
                    response = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages_copy,
                        stream=True,
                        tools=tools
                    )

                for chunk in response:
                    if chunk.choices[0].delta.content:
                        yield f"data: {json.dumps({'content': chunk.choices[0].delta.content, 'status': 'streaming'})}\n\n"

                    if chunk.choices[0].finish_reason == "stop":
                        yield f"data: {json.dumps({'status': 'done'})}\n\n"
                        return

                    if chunk.choices[0].delta.tool_calls:
                        tool_call = chunk.choices[0].delta.tool_calls[0]

                        if tool_call.id and tool_call.function.name:
                            current_tool_call_id = tool_call.id

                        if hasattr(tool_call.function, 'arguments') and tool_call.function.arguments:
                            accumulated_args += tool_call.function.arguments
                            print(f"Generated arguments: {tool_call.function.arguments}")

                        if accumulated_args.strip().endswith('}'):
                            try:
                                print("Starting the function call")
                                function_args = json.loads(accumulated_args)

                                if 'prompt' in function_args:
                                    yield f"data: {json.dumps({'status': 'generating_image'})}\n\n"

                                    quality = function_args.get("quality", "standard")
                                    image_url = generate_image(
                                        prompt=function_args["prompt"],
                                        quality=quality
                                    )

                                    messages_copy.append({
                                        "role": "assistant",
                                        "content": None,
                                        "tool_calls": [{
                                            "id": current_tool_call_id,
                                            "function": {
                                                "name": "generate_image",
                                                "arguments": accumulated_args
                                            },
                                            "type": "function"
                                        }]
                                    })

                                    messages_copy.append({
                                        "role": "tool",
                                        "tool_call_id": current_tool_call_id,
                                        "content": image_url
                                    })

                                    response = None
                                    accumulated_args = ""
                                    break
                            except json.JSONDecodeError:
                                pass
                else:
                    return

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

    except Exception as e:
        print(f"Chat request failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
