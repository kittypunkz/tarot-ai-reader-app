# Ask The Tarot

AI-powered tarot reading web application using OpenRouter API

## 📚 Documentation

**All documentation is now organized in `docs/` folder:**

| What you need | Where to find |
|--------------|---------------|
| 🎭 **User Stories & Features** | [docs/USER-STORIES.md](./docs/USER-STORIES.md) |
| 🚀 **Setup Instructions** | [docs/guides/setup.md](./docs/guides/setup.md) |
| 🗄️ **Database Setup** | [docs/guides/database-local.md](./docs/guides/database-local.md) |
| 🚀 **Deployment Guide** | [docs/guides/deployment.md](./docs/guides/deployment.md) |
| 📖 **All Documentation** | [docs/INDEX.md](./docs/INDEX.md) |

## Project Structure

```
├── frontend/          # Next.js 16 frontend
├── backend/           # FastAPI Python backend
├── docs/              # 📚 Documentation (organized!)
│   ├── user-stories/  # Feature specifications
│   ├── guides/        # How-to guides
│   ├── architecture/  # System design
│   └── technical/     # API & schema specs
└── scripts/           # Setup & utility scripts
```

## Quick Start

### Option 1: Full Setup with Local Database (Recommended)

```powershell
# One-command setup (Windows)
.\scripts\setup-local.bat

# Or using Make (Mac/Linux)
make setup

# Or manual setup
docker-compose up -d postgres
cd backend && alembic upgrade head && python scripts/seed_data.py
```

Then start development servers:
```powershell
# Terminal 1: Backend
.\start-backend.ps1

# Terminal 2: Frontend
.\start-frontend.ps1
```

### Option 2: Quick Setup with SQLite (No Docker)

1. **Get OpenRouter API Key**
   ```
   https://openrouter.ai/ → Sign up → Create API key
   ```

2. **Backend Setup**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\pip install -r requirements.txt
   copy .env.example .env
   # Edit .env: Use SQLite (default) and add OPENROUTER_API_KEY
   .\start-backend.ps1
   ```

3. **Frontend Setup**
   ```powershell
   cd frontend
   npm install
   .\start-frontend.ps1
   ```

### Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database GUI (if using Docker): http://localhost:5050

## Database Options

### Local PostgreSQL (Docker) ⭐ Recommended
- **Pros**: Matches production (Supabase), full SQL features, PGAdmin GUI
- **Setup**: `docker-compose up -d postgres`
- **Guide**: See [LOCAL_DATABASE_GUIDE.md](./LOCAL_DATABASE_GUIDE.md)

### SQLite (Fallback)
- **Pros**: No setup, zero config, portable
- **Cons**: Limited concurrency, no advanced features
- **Use for**: Quick prototyping, testing

### Supabase (Production)
- See [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) for cloud setup

## User Stories (US)

### US-001: AI Gatekeeper - Content Filtering ✅
- Input screen with question validation
- AI-powered content filtering via OpenRouter
- Rate limiting (5 req/min)
- Thai and English support

### US-002: Intelligent Spread Selection ✅
- AI analyzes question type
- Auto-select 1-card or 3-card spread
- Infinity carousel animation
- 3D card flip animations
- 22 Major Arcana cards with Thai/English meanings
- Cryptographically secure random card drawing
- Card meanings for upright and reversed orientations

### US-003: Engagement Loop (Next)
- Follow-up questions
- Session history
- Context-aware readings

### US-004: Scalability & Monetization (Future)
- Tiered pricing
- Usage limits
- Payment integration

### US-005: Final Output Value (Future)
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
