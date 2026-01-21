@echo off
echo Starting CDR-X Application...
echo.

REM Start backend server in a new window
cd backend
start "CDR-X Backend" node bundle.cjs

REM Wait a moment for backend to initialize
timeout /t 2 /nobreak > nul

REM Start frontend server in a new window
cd ..\Frontend
start "CDR-X Frontend" serve -s dist -l 5173

echo.
echo Both servers started!
echo Backend: Running in 'CDR-X Backend' window
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window (servers will keep running)...
pause > nul
