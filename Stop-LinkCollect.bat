@echo off
title Stop LinkCollect
echo Stopping LinkCollect background server...
taskkill /F /IM LinkCollect.Api.exe >nul 2>&1
echo LinkCollect has been stopped cleanly.
timeout /t 2 >nul
exit
