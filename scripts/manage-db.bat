@echo off
chcp 65001 >nul
echo 🔧 Database Management Tool
echo.

if "%1"=="" goto menu
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="reset" goto reset
if "%1"=="logs" goto logs
if "%1"=="shell" goto shell
if "%1"=="migrate" goto migrate
if "%1"=="seed" goto seed
goto menu

:menu
echo Available commands:
echo   start   - Start local database
echo   stop    - Stop local database
echo   reset   - Delete all data (WARNING!)
echo   logs    - View database logs
echo   shell   - Open PostgreSQL shell
echo   migrate - Run database migrations
echo   seed    - Seed database with initial data
echo.
echo Usage: manage-db.bat [command]
echo.
goto end

:start
echo 🚀 Starting database...
docker-compose up -d postgres
echo ⏳ Waiting for database to be ready...
timeout /t 3 /nobreak >nul
echo ✅ Database started!
echo    Host: localhost:5432
echo    User: tarot / Password: tarot123
goto end

:stop
echo 🛑 Stopping database...
docker-compose down
echo ✅ Database stopped
goto end

:reset
echo ⚠️  WARNING: This will delete all local database data!
set /p confirm="Are you sure? [y/N]: "
if /i "%confirm%"=="y" (
    docker-compose down -v
    docker volume rm tarot_postgres_data 2>nul
    echo ✅ Database reset complete
) else (
    echo ❌ Cancelled
)
goto end

:logs
echo 📋 Showing database logs (Ctrl+C to exit)...
docker-compose logs -f postgres
goto end

:shell
echo 🐘 Opening PostgreSQL shell...
docker exec -it tarot-db-local psql -U tarot -d tarot_dev
goto end

:migrate
echo 🔄 Running migrations...
cd backend
call alembic upgrade head
cd ..
echo ✅ Migrations complete
goto end

:seed
echo 🌱 Seeding database...
cd backend
python scripts/seed_data.py
cd ..
echo ✅ Seeding complete
goto end

:end
