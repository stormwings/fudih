# Fudih

A modern AI-powered chat application with image analysis and generation capabilities. Features a FastAPI backend and Next.js frontend with real-time streaming responses.

## Features

- **Real-time Chat** - Streaming text responses from GPT-4o mini
- **Image Analysis** - Upload and analyze images with AI vision capabilities
- **Image Generation** - Generate images using DALL-E 3
- **Dark Mode** - Automatic theme detection based on system preferences
- **Markdown Support** - Rich text formatting in assistant responses

## Tech Stack

### Backend (fudih-api)
- **FastAPI** - Python web framework
- **OpenAI API** - GPT-4o mini for chat, DALL-E 3 for image generation
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Frontend (fudih-client)
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Markdown** - Message rendering

## Project Structure

```
fudih/
├── fudih-api/          # Python FastAPI backend
│   ├── app/
│   │   └── main.py     # API endpoints and chat logic
│   ├── requirements.txt
│   └── .env            # OpenAI API key
│
└── fudih-client/       # Next.js frontend
    ├── src/
    │   ├── app/        # Pages and layouts
    │   ├── components/ # React components
    │   ├── lib/        # API client
    │   └── types/      # TypeScript types
    ├── package.json
    └── .env.local      # API URL config
```

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- Or: Python 3.10+ and Node.js 18+
- OpenAI API key

## Quick Start with Docker

### 1. Clone and Configure

```bash
git clone <repository-url>
cd fudih

# Create environment file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Run with Docker

**Production:**
```bash
docker compose up --build
```

**Development (with hot-reload):**
```bash
docker compose -f docker-compose.dev.yml up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### 3. Stop the Application

```bash
docker compose down
# Or for development:
docker compose -f docker-compose.dev.yml down
```

## Manual Setup (without Docker)

### Backend Setup

```bash
cd fudih-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env  # Or create .env with your OPENAI_API_KEY

# Run server
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

```bash
cd fudih-client

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/chat` | Send message and receive streaming response |

### Chat Request Example

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Image Analysis Example

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What is in this image?",
        "image_data": ["base64_encoded_image_data"]
      }
    ]
  }'
```

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_api_key_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Development

### With Docker (Recommended)

Development mode includes hot-reload for both frontend and backend:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Changes to source files will automatically reload:
- Backend: `fudih-api/app/` directory
- Frontend: `fudih-client/src/` and `fudih-client/public/` directories

### Without Docker

**Backend:**
```bash
cd fudih-api
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd fudih-client
npm run dev      # Development
npm run build    # Production build
npm run lint     # Run linter
```

## Docker Commands Reference

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start production containers |
| `docker compose up -d` | Start in detached mode (background) |
| `docker compose down` | Stop and remove containers |
| `docker compose logs -f` | Follow container logs |
| `docker compose -f docker-compose.dev.yml up --build` | Start development environment |
| `docker compose -f docker-compose.dev.yml down` | Stop development environment |

## License

MIT
