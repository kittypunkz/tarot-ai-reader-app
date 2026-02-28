# Start the Ask The Tarot Backend
$env:PYTHONPATH = "backend"
cd backend
.\venv\Scripts\python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
