# Local Database Setup Guide

This guide helps you run PostgreSQL locally for development.

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed
- Docker Compose (included with Docker Desktop)

### Step 1: Start Database

```bash
# Using Make (recommended)
make db-up

# Or using Docker directly
docker-compose up -d postgres
```

**Default credentials:**
- Host: `localhost:5432`
- User: `tarot`
- Password: `tarot123`
- Database: `tarot_dev`

### Step 2: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://tarot:tarot123@localhost:5432/tarot_dev
OPENROUTER_API_KEY=your_key_here
```

### Step 3: Run Migrations

```bash
# Using Make
make migrate

# Or manually
cd backend
alembic upgrade head
```

### Step 4: Seed Data (Optional)

```bash
# Using Make
make db-seed

# Or manually
cd backend
python scripts/seed_data.py
```

### Step 5: Start Backend

```bash
# Using Make
make dev-backend

# Or manually
cd backend
uvicorn src.main:app --reload
```

✅ **Your local database is ready!**

---

## 🎨 Using PGAdmin (Database GUI)

```bash
# Start with GUI
make db-up-gui

# Or
docker-compose --profile gui up -d
```

Access PGAdmin: http://localhost:5050
- Email: `admin@tarot.local`
- Password: `admin123`

**Add your database:**
1. Right-click "Servers" → "Register" → "Server"
2. General tab: Name = "Tarot Local"
3. Connection tab:
   - Host: `postgres` (container name)
   - Port: `5432`
   - Username: `tarot`
   - Password: `tarot123`
   - Database: `tarot_dev`

---

## 🛠️ Common Commands

```bash
# View all available commands
make help

# Database management
make db-up          # Start database
make db-down        # Stop database
make db-reset       # Delete all data (WARNING!)
make db-logs        # View database logs
make db-shell       # Open PostgreSQL shell

# Migrations
make migrate        # Run migrations
make migrate-down   # Rollback one migration
make migrate-create # Create new migration
make migrate-history# View migration history

# Development
make dev-backend    # Start backend server
make dev-frontend   # Start frontend server
make setup          # Complete project setup
```

---

## 🔄 Alternative: Native PostgreSQL Install

If you prefer not to use Docker:

### Windows (WSL2)

```bash
# In WSL2 terminal
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create database and user
sudo -u postgres psql -c "CREATE USER tarot WITH PASSWORD 'tarot123';"
sudo -u postgres psql -c "CREATE DATABASE tarot_dev OWNER tarot;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tarot_dev TO tarot;"
```

### macOS (Homebrew)

```bash
# Install
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database and user
createuser -P tarot  # Set password: tarot123
createdb -O tarot tarot_dev
```

### Linux (Ubuntu/Debian)

```bash
# Install
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database and user
sudo -u postgres createuser -P tarot  # Set password: tarot123
sudo -u postgres createdb -O tarot tarot_dev
```

---

## 📊 Database Switching

### Switch between local and production:

**Local (Docker):**
```env
DATABASE_URL=postgresql://tarot:tarot123@localhost:5432/tarot_dev
```

**Production (Supabase):**
```env
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

**SQLite (Fallback):**
```env
DATABASE_URL=sqlite:///./tarot.db
```

Just change the `.env` file and restart the backend!

---

## 🔍 Troubleshooting

### Port 5432 already in use

```bash
# Find what's using port 5432
sudo lsof -i :5432

# Stop it or change Docker port in docker-compose.yml:
ports:
  - "5433:5432"  # Use 5433 instead
```

Then update your `.env`:
```env
DATABASE_URL=postgresql://tarot:tarot123@localhost:5433/tarot_dev
```

### Connection refused

```bash
# Check if container is running
docker ps

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Permission denied

```bash
# Reset database completely
make db-reset

# Or manually
docker-compose down -v
docker volume rm tarot_postgres_data
make db-up
```

### Migrations fail

```bash
# Reset to base and re-run
cd backend
alembic downgrade base
alembic upgrade head
```

---

## 💾 Backup & Restore

### Backup local database

```bash
# Using Docker
docker exec tarot-db-local pg_dump -U tarot tarot_dev > backup.sql

# Using local PostgreSQL
pg_dump -U tarot -h localhost tarot_dev > backup.sql
```

### Restore from backup

```bash
# Using Docker
docker exec -i tarot-db-local psql -U tarot tarot_dev < backup.sql

# Using local PostgreSQL
psql -U tarot -h localhost tarot_dev < backup.sql
```

---

## 🌏 Thailand-Specific Notes

### Using Thai Locale

Your local PostgreSQL already supports Thai. Test it:

```bash
make db-shell

# In PostgreSQL shell
SELECT 'สวัสดีชาวโลก' as greeting;
SHOW lc_collate;  -- Should show locale
```

### Slow Docker on Windows?

Enable WSL2 backend in Docker Desktop settings for better performance.

---

## 🎯 One-Command Setup

For new developers:

```bash
# Complete setup in one command
make setup
```

This will:
1. Install backend dependencies
2. Install frontend dependencies
3. Start local database
4. Run migrations
5. Seed initial data

Then just run:
```bash
# Terminal 1
make dev-backend

# Terminal 2
make dev-frontend
```

---

## 📚 Next Steps

- [Connect to PGAdmin for visual database management](#-using-pgadmin-database-gui)
- [Learn about database migrations](./DATABASE_GUIDE.md)
- [Deploy to production](./DEPLOYMENT.md)
