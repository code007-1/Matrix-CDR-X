@echo off
echo Checking if CDR-X Server service is running...
sc query "CDR-X Server" | find "RUNNING"
if %ERRORLEVEL% == 0 (
    echo Service is running.
) else (
    echo Service is NOT running. Starting manually for testing...
    node dist/bundle.js
)
pause
