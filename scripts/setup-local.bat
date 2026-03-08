@echo off
chcp 65001 >nul
echo 🚀 Setting up local development environment...
echo.

echo 📦 Step 1/5: Installing backend dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)
cd ..

echo 📦 Step 2/5: Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)
cd ..

echo 🐳 Step 3/5: Starting local database...
docker-compose up -d postgres
if errorlevel 1 (
    echo ❌ Failed to start database. Make sure Docker Desktop is running.
    exit /b 1
)
echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo 🔄 Step 4/5: Running database migrations...
cd backend
call alembic upgrade head
if errorlevel 1 (
    echo ⚠️  Migration failed. Database might already be up to date.
)
cd ..

echo 🌱 Step 5/5: Seeding database...
cd backend
python scripts/seed_data.py
if errorlevel 1 (
    echo ⚠️  Seeding failed or already seeded.
)
cd ..

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo    1. Copy backend\.env.example to backend\.env
echo    2. Add your OPENROUTER_API_KEY to backend\.env
echo    3. Run: start-backend.ps1 (in one terminal)
echo    4. Run: start-frontend.ps1 (in another terminal)
echo.
echo 🌐 Database connection:
echo    Host: localhost:5432
echo    User: tarot
echo    Password: tarot123
echo    Database: tarot_dev
echo.
pause
