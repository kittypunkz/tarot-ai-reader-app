# Start Development Environment
# This script starts both backend and frontend in one window using split panes

$host.ui.RawUI.WindowTitle = "Ask The Tarot - Development Server"

Write-Host "🚀 Starting Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if Windows Terminal is available
$wtPath = (Get-Command wt -ErrorAction SilentlyContinue)?.Source

if ($wtPath) {
    # Use Windows Terminal with split panes
    Write-Host "Starting in Windows Terminal with split panes..." -ForegroundColor Cyan
    wt -w 0 nt --title "Backend" -d "$PSScriptRoot\backend" powershell -NoExit "python -m uvicorn src.main:app --reload" ; `
       nt --title "Frontend" -d "$PSScriptRoot\frontend" powershell -NoExit "npm run dev"
} else {
    # Fallback: Start in separate PowerShell windows
    Write-Host "Starting Backend in new window..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn src.main:app --reload" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    
    Write-Host "Starting Frontend in new window..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal
    
    Write-Host ""
    Write-Host "✅ Both servers started in separate windows!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 URLs:" -ForegroundColor Yellow
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
    Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to close this window..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
