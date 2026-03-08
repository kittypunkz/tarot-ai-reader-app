# Complete Infrastructure Setup

## 🎯 Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   GitHub Repo   │────▶│  GitHub Actions  │────▶│   Vercel        │
│                 │     │                  │     │  (Frontend)     │
└─────────────────┘     │  ┌────────────┐  │     └─────────────────┘
         │              │  │ CI Tests   │  │              │
         │              │  └────────────┘  │              ▼
         │              │  ┌────────────┐  │     ┌─────────────────┐
         │              │  │ DB Migrate │  │     │  Next.js 16     │
         │              │  └────────────┘  │     │  Tarot UI       │
         │              │  ┌────────────┐  │     └─────────────────┘
         │              │  │ Deploy     │  │
         │              │  └────────────┘  │     ┌─────────────────┐
         │              └──────────────────┘────▶│   Render.com    │
         │                                        │  (Backend)      │
         │                                        └─────────────────┘
         │                                               │
         │                                               ▼
         │                                      ┌─────────────────┐
         │                                      │   FastAPI       │
         │                                      │   Python        │
         │                                      └─────────────────┘
         │                                               │
         │                                               ▼
         │                                      ┌─────────────────┐
         └─────────────────────────────────────▶│   Supabase      │
                                                │  PostgreSQL     │
                                                │  Singapore      │
                                                └─────────────────┘
```

---

## 📋 Step-by-Step Setup

### Phase 1: Database (Supabase)

1. **Create Supabase Account**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Choose Region: Singapore (Southeast Asia)
   ```

2. **Get Connection Details**
   ```
   Project Settings → Database → Connection String
   
   Format:
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. **Setup Local Environment**
   ```bash
   cd backend
   
   # Update .env file
   echo "DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres" >> .env
   
   # Install PostgreSQL driver
   pip install psycopg2-binary
   
   # Create initial migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Run migration
   alembic upgrade head
   ```

4. **Migrate Existing Data (Optional)**
   ```bash
   # If you have SQLite data to migrate
   export DATABASE_URL="postgresql://..."
   python scripts/migrate_sqlite_to_postgres.py
   ```

### Phase 2: Backend (Render.com)

1. **Update Render Config**
   Edit `render.yaml` with your actual values

2. **Deploy via Blueprint**
   ```bash
   # In Render Dashboard:
   # 1. Go to "Blueprints"
   # 2. Click "New Blueprint Instance"
   # 3. Connect your GitHub repo
   # 4. Set OPENROUTER_API_KEY
   ```

### Phase 3: Frontend (Vercel)

1. **Deploy to Vercel**
   ```bash
   # In Vercel Dashboard:
   # 1. Import GitHub repository
   # 2. Root Directory: frontend
   # 3. Set environment variable:
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

### Phase 4: GitHub Secrets

Add these in **Settings → Secrets → Actions**:

```bash
# Backend
RENDER_SERVICE_ID=svc_xxxxxxxx
RENDER_API_KEY=rnd_xxxxxxxx

# Frontend
VERCEL_TOKEN=xxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxx

# Database
SUPABASE_DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

---

## 🔄 CI/CD Workflows

### 1. On Pull Request
```
Push to PR branch
    ↓
GitHub Actions:
  ├─ Run backend tests (pytest)
  ├─ Run backend lint (ruff)
  ├─ Run frontend build (next build)
  └─ Run frontend lint (eslint)
    ↓
Status Check Required
```

### 2. On Merge to Main
```
Merge to main
    ↓
GitHub Actions (Parallel):
  ├─ Backend Changes?
  │   └─ Deploy to Render
  │      └─ Auto-migrate DB
  │
  └─ Frontend Changes?
      └─ Deploy to Vercel
```

### 3. Database Changes
```
Push changes to backend/src/database/**
    ↓
GitHub Actions:
  ├─ Generate migration (alembic)
  ├─ Run migration on Supabase
  └─ Verify connection
```

---

## 📊 Cost Breakdown (Monthly Estimates)

| Service | Free Tier | Expected Cost | Notes |
|---------|-----------|---------------|-------|
| **Supabase** | 500MB + 2GB | **$0** | Sufficient for launch |
| **Render** | 750 hrs | **$0** | Web service free tier |
| **Vercel** | 100GB | **$0** | Hobby plan |
| **GitHub** | 2,000 min | **$0** | Actions free tier |
| **Total** | - | **$0/mo** | Until you scale |

**When to upgrade:**
- Supabase: When you hit 500MB or need more bandwidth
- Render: When you need custom domains or more resources
- Vercel: When you exceed 100GB bandwidth

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing locally
- [ ] Migrations created (`alembic revision --autogenerate`)
- [ ] Environment variables documented
- [ ] README updated with live URLs

### Deployment
- [ ] Create Supabase project (Singapore region)
- [ ] Run initial migration on production DB
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Configure GitHub secrets
- [ ] Test live site

### Post-deployment
- [ ] Set up monitoring (Render logs, Vercel Analytics)
- [ ] Configure custom domain (optional)
- [ ] Set up error tracking (Sentry - optional)
- [ ] Create backup schedule (Supabase)

---

## 🔧 Useful Commands

### Database
```bash
# Create migration
cd backend
alembic revision --autogenerate -m "Description"

# Run migration
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View history
alembic history --verbose

# Connect to Supabase via psql
psql "postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"
```

### Backend
```bash
cd backend

# Local development
uvicorn src.main:app --reload

# Run tests
pytest tests/ -v

# Check linting
ruff check src/
```

### Frontend
```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
python -c "
from sqlalchemy import create_engine
engine = create_engine('postgresql://...')
with engine.connect() as conn:
    result = conn.execute('SELECT 1')
    print('✅ Connected!')
"
```

### Migration Failures
```bash
# Reset to specific version
alembic downgrade <revision>

# Mark current as applied (without running)
alembic stamp head

# Recreate all tables (DELETES DATA!)
alembic downgrade base
alembic upgrade head
```

### CORS Errors
Check `ALLOWED_ORIGINS` in backend environment:
```bash
# Should include your frontend URL:
ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-domain.com
```

---

## 🌍 Regional Optimization

For **Thailand users**, all services support Singapore region:
- ✅ Supabase: Choose "Southeast Asia (Singapore)"
- ✅ Render: Automatic (US-based but fast)
- ✅ Vercel: Edge network (global CDN)

Expected latency from Bangkok:
- Supabase DB: ~25-35ms
- Render Backend: ~150-200ms
- Vercel Frontend: ~20-50ms (cached)

---

## 📚 Next Steps

1. **Monitoring**: Add Sentry for error tracking
2. **Analytics**: Add Google Analytics or Plausible
3. **Backups**: Configure Supabase daily backups
4. **Scaling**: When ready, upgrade to paid tiers

**Questions?** Check:
- `DEPLOYMENT.md` - Detailed deployment guide
- `DATABASE_GUIDE.md` - Database-specific info
- GitHub Issues for troubleshooting
