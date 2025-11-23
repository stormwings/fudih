# Fudih

FastAPI chat API with OpenAI integration, image generation (DALL-E 3), and image analysis.

## Setup

```bash
pip install -r requirements.txt
```

Create a `.env` file:
```
OPENAI_API_KEY=your_api_key
```

## Run

```bash
uvicorn app.main:app --reload
```

## Endpoints

- `GET /` - Health check
- `POST /chat` - Chat with streaming SSE response

### Chat Request

```json
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}
```

With image:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's in this image?",
      "image_data": ["base64_encoded_image"]
    }
  ]
}
```
