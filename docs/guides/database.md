# Database Platform Guide

## 🎯 Recommendation: Supabase

For your tarot app, **Supabase** is the best choice because:
- ✅ PostgreSQL (full SQLAlchemy compatibility)
- ✅ Free tier: 500MB + 2GB bandwidth
- ✅ **Singapore region** - Low latency for Thai users
- ✅ Built-in REST API + Realtime
- ✅ Easy CI/CD with GitHub Actions

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose **Singapore (Southeast Asia)** region
4. Save your database password

### 2. Get Connection String

Go to **Project Settings → Database → Connection String**

**For SQLAlchemy:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Update Backend

```bash
# Add to requirements.txt
psycopg2-binary>=2.9.0
alembic>=1.12.0
```

```python
# backend/src/database/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.models import Base

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
```

### 4. Setup Alembic (Database Migrations)

```bash
cd backend
pip install alembic
alembic init alembic
```

Edit `alembic.ini`:
```ini
sqlalchemy.url = ${DATABASE_URL}
```

Edit `alembic/env.py`:
```python
from src.database.models import Base
target_metadata = Base.metadata
```

Create first migration:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

## Environment Variables

Add to GitHub Secrets (**Settings → Secrets → Actions**):

```bash
SUPABASE_DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

---

## Using Supabase Features

### Auto-generated REST API
Access your data via REST without writing backend code:

```bash
# Get all readings
curl 'https://[PROJECT-REF].supabase.co/rest/v1/readings' \
  -H "apikey: [ANON-KEY]" \
  -H "Authorization: Bearer [ANON-KEY]"

# Get readings with filter
curl 'https://[PROJECT-REF].supabase.co/rest/v1/readings?session_id=eq.abc123' \
  -H "apikey: [ANON-KEY]"
```

### Real-time Subscriptions
Listen to database changes in real-time:

```javascript
// Frontend real-time updates
const supabase = createClient(url, key)

supabase
  .channel('readings')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'readings' }, payload => {
    console.log('New reading!', payload.new)
  })
  .subscribe()
```

---

## Alternative: PlanetScale (for Git-like workflow)

If you want **database versioning** like Git:

```bash
# Install CLI
brew install planetscale/tap/pscale

# Login
pscale auth login

# Create database
pscale database create tarot-db --region aws-ap-southeast-1

# Create branch for feature
pscale branch create tarot-db feature-user-accounts

# Connect to branch
pscale connect tarot-db feature-user-accounts

# Deploy to production
pscale deploy-request create tarot-db feature-user-accounts
pscale deploy-request deploy tarot-db 1
```

**CI/CD Integration:**
```yaml
- name: Deploy Schema Changes
  run: |
    pscale deploy-request create tarot-db ${{ github.ref_name }} \
      --deploy-to main \
      --service-token ${{ secrets.PLANETSCALE_SERVICE_TOKEN }}
```

---

## Cost Comparison (Monthly)

| Platform | Free Tier | Paid (Start) | Notes |
|----------|-----------|--------------|-------|
| **Supabase** | 500MB + 2GB | $25 | Unlimited API calls |
| **PlanetScale** | 5GB + 1B reads | $39 | Deploy requests included |
| **Neon** | 3GB + 3 compute hours | $19 | Serverless |
| **Railway** | $5 credit | $5+ | Pay as you use |
| **Cloudflare D1** | 5M rows/day | $5 | Edge locations |
| **Google Cloud SQL** | $300 credit | $7+ | Enterprise features |

---

## Migration from SQLite

```python
# migrate_to_postgres.py
import sqlite3
import psycopg2
from urllib.parse import urlparse

# Connect to SQLite
sqlite_conn = sqlite3.connect('tarot.db')
sqlite_cur = sqlite_conn.cursor()

# Connect to PostgreSQL
pg_url = os.getenv('DATABASE_URL')
pg_conn = psycopg2.connect(pg_url)
pg_cur = pg_conn.cursor()

# Copy data table by table
tables = ['question_validations', 'rate_limits', 'sessions', 'spreads', 'readings', 'card_draws']

for table in tables:
    sqlite_cur.execute(f"SELECT * FROM {table}")
    rows = sqlite_cur.fetchall()
    
    if rows:
        # Get column count
        col_count = len(rows[0])
        placeholders = ','.join(['%s'] * col_count)
        
        pg_cur.executemany(
            f"INSERT INTO {table} VALUES ({placeholders})",
            rows
        )

pg_conn.commit()
print("✅ Migration complete!")
```

Run: `python migrate_to_postgres.py`
