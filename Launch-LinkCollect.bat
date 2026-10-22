@echo off
title LinkCollect App Launcher
echo ========================================================
echo               Launching LinkCollect App
echo ========================================================
echo.

:: 1. Ensure MySQL80 service is running
echo [1/3] Checking MySQL Database Service...
sc query MySQL80 | find "RUNNING" >nul
if errorlevel 1 (
    echo Starting MySQL80 service...
    net start MySQL80
) else (
    echo MySQL80 is already running.
)
echo.

:: 2. Ensure any previous instance is closed
echo [2/3] Preparing LinkCollect server...
taskkill /F /IM LinkCollect.Api.exe >nul 2>&1

:: 3. Launch the unified Web application
echo [3/3] Starting LinkCollect (Backend + Database + Frontend)...
cd /d "%~dp0LinkCollect"
start "" dotnet run --project src/LinkCollect.Api --launch-profile http --no-build

:: 4. Wait briefly and open browser
echo.
echo Application is starting at http://localhost:5070
echo Opening your browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5070

echo.
echo ========================================================
echo LinkCollect is running in the background!
echo You can bookmark http://localhost:5070 in any browser.
echo You can close this window at any time.
echo ========================================================
exit
