@echo off
title AI Anti-Fraud Backend
echo ========================================
echo    AI Anti-Fraud - Flask Backend
echo ========================================
echo.

cd /d D:\my project\Anti-Fraud

echo Activating virtual environment...
call .venv\Scripts\activate

echo Setting API Key...
set DASHSCOPE_API_KEY=sk-ba8e6bbaf3b64ff0839332fc37b88dc8

echo Starting server...
echo.
echo Keep this window open
echo Press Ctrl+C to stop
echo ========================================
echo.

python api_server.py

pause