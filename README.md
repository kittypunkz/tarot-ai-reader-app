# Ask The Tarot

AI-powered tarot reading web application using OpenRouter API

## Project Structure

```
├── frontend/          # Next.js 15 frontend
├── backend/           # FastAPI Python backend
└── docs/             # Documentation
```

## Quick Start

### 1. Get OpenRouter API Key

1. Go to https://openrouter.ai/
2. Sign up and create an API key
3. Copy your API key

### 2. Backend Setup

```powershell
# Install dependencies
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Start backend
.\start-backend.ps1
```

### 3. Frontend Setup

```powershell
# Install dependencies (already done during project creation)
cd frontend
npm install

# Start frontend
.\start-frontend.ps1
# Or: npm run dev
```

### 4. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## User Stories (US)

### US-001: AI Gatekeeper - Content Filtering ✅
- Input screen with question validation
- AI-powered content filtering via OpenRouter
- Rate limiting (5 req/min)
- Thai and English support

### US-002: Intelligent Spread Selection (Pending)
- AI analyzes question type
- Auto-select 1-card or 3-card spread
- Infinity carousel animation

### US-003: Engagement Loop (Pending)
- Follow-up questions
- Session history
- Context-aware readings

### US-004: Scalability & Monetization (Pending)
- Tiered pricing
- Usage limits
- Payment integration

### US-005: Final Output Value (Pending)
- Session summary
- Shareable images
- Export functionality

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, SQLAlchemy
- **AI**: OpenRouter API (supports multiple models)
- **Database**: SQLite (dev), PostgreSQL (prod)

## Environment Variables

### Backend (.env)
```env
# Required: OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Model selection (default is free model)
OPENROUTER_MODEL=google/gemma-2-9b-it:free
# Other free options:
# - meta-llama/llama-3.2-3b-instruct:free
# Paid options:
# - openai/gpt-4o-mini
# - anthropic/claude-3-haiku

# App URL for OpenRouter referrer
APP_URL=http://localhost:3000

# Database
DATABASE_URL=sqlite:///./tarot.db

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=5
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## OpenRouter Models

Free models available:
- `google/gemma-2-9b-it:free` - Fast, good for filtering
- `meta-llama/llama-3.2-3b-instruct:free` - Efficient

Paid models (better quality):
- `openai/gpt-4o-mini` - Best accuracy
- `anthropic/claude-3-haiku` - Good balance

## Running Tests

```powershell
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\python -m pytest tests/ -v
```
