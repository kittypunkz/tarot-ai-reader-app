# 🚀 Auto-Start Options

Since I can't keep servers running between our conversations, here are **one-click solutions** to start your dev environment:

## Option 1: Double-Click Start (Easiest) ⭐

### Windows
```powershell
# Double-click this file in File Explorer:
dev.bat

# Or run in PowerShell:
.\dev.bat
```

**What it does:**
- Opens 2 PowerShell windows
- Starts backend in one, frontend in the other
- Shows you the URLs

---

## Option 2: PowerShell Script (Fancier)

```powershell
# Run this in PowerShell:
.\start-dev.ps1
```

**Features:**
- If you have Windows Terminal: Opens in split panes (side-by-side)
- Otherwise: Opens 2 separate windows
- Better looking output

---

## Option 3: VS Code (If you use it)

1. Open project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: `Tasks: Run Task`
4. Select: `Start All (Backend + Frontend)`

Or use keyboard shortcut: `Ctrl+Shift+B`

---

## Option 4: Create a Desktop Shortcut

### Windows

1. Right-click on desktop → New → Shortcut
2. Enter location:
   ```
   powershell.exe -WindowStyle Hidden -Command "cd 'C:\path\to\alin-tarot'; .\dev.bat"
   ```
3. Name it: "Start Tarot App"
4. (Optional) Change icon: Right-click → Properties → Change Icon

Now just **double-click the desktop icon** anytime!

---

## Option 5: Auto-Start on Login (Advanced)

### Windows - Task Scheduler

Create a task that runs on login:

```powershell
# Run as Administrator
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -Command cd 'C:\path\to\alin-tarot'; .\dev.bat"
$trigger = New-ScheduledTaskTrigger -AtLogon
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "Start Tarot Dev" -Action $action -Trigger $trigger -Principal $principal -Settings $settings
```

To remove later:
```powershell
Unregister-ScheduledTask -TaskName "Start Tarot Dev" -Confirm:$false
```

---

## 📝 Summary

| Method | Command | Best For |
|--------|---------|----------|
| **Double-click** | `dev.bat` | Quick start |
| **PowerShell** | `.\start-dev.ps1` | Better UI |
| **VS Code** | `Ctrl+Shift+B` | IDE users |
| **Desktop Icon** | Shortcut | Everyday use |

---

## 💡 Pro Tip

Bookmark these URLs in your browser:
- http://localhost:3000 (Frontend)
- http://localhost:8000/docs (API Docs)

---

## ❓ "But I want YOU to run it!"

I understand! But here's why I can't:

1. **Each chat is temporary** - I can't keep processes running after you close the chat
2. **Security** - Running background processes without your control would be risky
3. **Resources** - Servers need to run on YOUR computer, not mine

**The good news:** The `.bat` and `.ps1` files I created do exactly what I'd do - just click them! 🎯

---

## 🆘 Troubleshooting

### "Script won't run"
```powershell
# Run this first to allow scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Ports already in use"
```powershell
# Find and kill processes
netstat -ano | findstr :3000
netstat -ano | findstr :8000
# Then kill with: taskkill /PID <PID> /F
```

---

**Just use `dev.bat` - double-click and go!** 🚀
