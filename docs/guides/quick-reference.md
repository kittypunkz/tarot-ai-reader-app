# 🚀 Quick Reference Card

## Everyday Development Commands

### Start Development Environment

```powershell
# Windows - Quick start
.\scripts\setup-local.bat        # First time only
.\scripts\manage-db.bat start    # Start database
.\start-backend.ps1              # Terminal 1
.\start-frontend.ps1             # Terminal 2

# Mac/Linux - Quick start
make setup          # First time only
make db-up          # Start database
make dev-backend    # Terminal 1
make dev-frontend   # Terminal 2
```

### Database Management

```powershell
# Windows
.\scripts\manage-db.bat start    # Start PostgreSQL
.\scripts\manage-db.bat stop     # Stop PostgreSQL
.\scripts\manage-db.bat reset    # Delete all data
.\scripts\manage-db.bat migrate  # Run migrations
.\scripts\manage-db.bat seed     # Add sample data

# Mac/Linux (Make)
make db-up          # Start PostgreSQL
make db-down        # Stop PostgreSQL
make db-reset       # Delete all data
make migrate        # Run migrations
make db-seed        # Add sample data
```

### Common Tasks

```bash
# Create new database migration
cd backend
alembic revision --autogenerate -m "Description of changes"

# Backup local database
docker exec tarot-db-local pg_dump -U tarot tarot_dev > backup.sql

# View database in browser
# http://localhost:5050 (PGAdmin)
# Email: admin@tarot.local / Password: admin123

# Open PostgreSQL shell
make db-shell
# OR
docker exec -it tarot-db-local psql -U tarot -d tarot_dev
```

---

## Environment Variables

### Local Development (.env)
```env
# Local PostgreSQL (Docker)
DATABASE_URL=postgresql://tarot:tarot123@localhost:5432/tarot_dev
OPENROUTER_API_KEY=your_key_here
APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

### Production (.env)
```env
# Supabase
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
OPENROUTER_API_KEY=your_key_here
APP_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## Project Structure

```
alin-tarot/
├── frontend/           # Next.js 16 frontend
│   ├── app/           # App router pages
│   ├── src/           # Components & hooks
│   └── package.json   # Dependencies
├── backend/           # FastAPI Python backend
│   ├── src/          # Source code
│   ├── alembic/      # Database migrations
│   ├── scripts/      # Utility scripts
│   └── requirements.txt
├── scripts/          # Windows batch files
├── docker-compose.yml # Local database
├── Makefile          # Mac/Linux commands
└── *.md             # Documentation
```

---

## URLs

| Service | Local URL | Production |
|---------|-----------|------------|
| Frontend | http://localhost:3000 | Vercel |
| Backend API | http://localhost:8000 | Render/GCP |
| API Docs | http://localhost:8000/docs | Same + `/docs` |
| Database GUI | http://localhost:5050 | Supabase Dashboard |

---

## Troubleshooting

### "Database connection failed"
```bash
# Start database
docker-compose up -d postgres

# Check if running
docker ps
```

### "Migration failed"
```bash
cd backend
alembic downgrade base  # Reset
alembic upgrade head     # Re-run
```

### "Port already in use"
```bash
# Find process on port 5432
# Windows: netstat -ano | findstr 5432
# Mac: lsof -i :5432

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

---

## Documentation Index

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Main project overview |
| [LOCAL_DATABASE_GUIDE.md](./LOCAL_DATABASE_GUIDE.md) | Local PostgreSQL setup |
| [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) | Cloud database comparison |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to production |
| [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) | Complete architecture |
| [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) | GCP deployment |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | This file |

---

## Need Help?

1. Check the specific guide above
2. Run `make help` (Mac/Linux) for command list
3. Check Docker logs: `docker-compose logs postgres`
4. Review environment variables in `backend/.env`
