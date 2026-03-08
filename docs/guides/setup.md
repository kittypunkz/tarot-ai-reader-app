# ✅ Setup Complete!

Your development environment is ready!

## 🎉 What's Been Set Up

| Component | Status | Details |
|-----------|--------|---------|
| Python Dependencies | ✅ | FastAPI, SQLAlchemy, Alembic, etc. |
| Frontend Dependencies | ✅ | Next.js 16, React 19, Tailwind CSS |
| Database | ✅ | SQLite (tarot.db file) |
| Seed Data | ✅ | 4 tarot spreads loaded |
| Environment | ✅ | .env configured with your API key |

---

## 🚀 Start Development

### Option 1: Using PowerShell Scripts (Recommended)

Open **two separate terminals**:

```powershell
# Terminal 1: Backend
.\start-backend.ps1

# Terminal 2: Frontend
.\start-frontend.ps1
```

### Option 2: Manual Commands

```powershell
# Terminal 1: Backend
cd backend
python -m uvicorn src.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🌐 Access Your App

Once started, open your browser:

| Service | URL |
|---------|-----|
| **Frontend (Tarot App)** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs |
| **Health Check** | http://localhost:8000/health |

---

## 📊 Your Database

**Current Setup:** SQLite (file-based)
- File: `backend/tarot.db`
- Tables: spreads, readings, sessions, etc.
- Pre-loaded with: 4 tarot spread types

### Switch to PostgreSQL Later (Optional)

When you want to use PostgreSQL with Docker:

1. **Install Docker Desktop**: https://docker.com/products/docker-desktop
2. **Start PostgreSQL**:
   ```powershell
   docker-compose up -d postgres
   ```
3. **Update .env**:
   ```env
   DATABASE_URL=postgresql://tarot:tarot123@localhost:5432/tarot_dev
   ```

---

## 🔧 Common Commands

### Database
```powershell
# No commands needed for SQLite!
# Database is just a file: backend/tarot.db

# To reset (delete all data):
Remove-Item backend/tarot.db
python -c "from src.database.database import init_db; init_db()"
python backend/scripts/seed_data.py
```

### Development
```powershell
# Run backend tests
cd backend
$env:PYTHONPATH="."; pytest tests/ -v

# Lint backend
cd backend
ruff check src/

# Lint frontend
cd frontend
npm run lint
```

---

## 📝 Your Environment Variables

Located in: `backend/.env`

```env
# Already configured ✅
OPENROUTER_API_KEY=sk-or-v1-...    # Your API key
DATABASE_URL=sqlite:///./tarot.db   # SQLite for local dev
APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

**No changes needed!** Everything is ready to go.

---

## 🎯 Next Steps

1. **Start the servers** (see above)
2. **Visit http://localhost:3000**
3. **Try asking a tarot question**
4. **Read the documentation**:
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Command cheat sheet
   - [README.md](README.md) - Project overview
   - [LOCAL_DATABASE_GUIDE.md](LOCAL_DATABASE_GUIDE.md) - Database options

---

## ❓ Troubleshooting

### "Module not found" errors
```powershell
# Reinstall backend dependencies
cd backend
pip install -r requirements.txt
```

### "Port already in use"
```powershell
# Find and kill process on port 3000 or 8000
# Or change ports in the .env file
```

### Database issues
```powershell
# Reset database
cd backend
Remove-Item tarot.db
python -c "from src.database.database import init_db; init_db()"
python scripts/seed_data.py
```

---

## 🎉 You're Ready!

Run these commands in two terminals and start coding:

```powershell
# Terminal 1
.\start-backend.ps1

# Terminal 2
.\start-frontend.ps1
```

Happy coding! 🚀
