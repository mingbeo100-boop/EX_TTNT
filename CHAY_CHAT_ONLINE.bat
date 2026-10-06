@echo off
setlocal
chcp 65001 >nul
title EduAdvisor AI - Khoi dong tat ca (Online + Cloudflare)

cd /d "%~dp0"

set "PYTHON_EXE=python"
if exist "C:\Users\Admin\AppData\Local\Programs\Python\Python311\python.exe" (
    set "PYTHON_EXE=C:\Users\Admin\AppData\Local\Programs\Python\Python311\python.exe"
)

"%PYTHON_EXE%" "start_online.py"
if %errorlevel% neq 0 (
    echo.
    echo [THONG BAO] Tien trinh da dung lai hoac gap su co.
    pause
)