
@echo off
echo Starting 3D Web Fighter Server...
echo Please wait while the server starts.
echo If this is the first time running, it may take a moment to download the server tool.
echo.
call npx -y http-server . -o index.html -c-1
pause
