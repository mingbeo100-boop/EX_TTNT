@echo off
chcp 65001 >nul
title EduAdvisor AI - Khoi Dong He Thong (Localhost)

:: 1. Dinh vi thu muc du an AI_EX
if exist "%~dp0start_local.py" (
    cd /d "%~dp0"
) else if exist "%~dp0..\..\start_local.py" (
    cd /d "%~dp0..\..\"
) else if exist "%~dp0..\start_local.py" (
    cd /d "%~dp0..\"
) else (
    cd /d "c:\Skills-Stitch\AI_EX"
)

:: 2. Tim Python tren he thong
set "PY=python"
python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if not errorlevel 1 (
        set "PY=py"
    ) else if exist "C:\Users\Admin\AppData\Local\Programs\Python\Python311\python.exe" (
        set "PY=C:\Users\Admin\AppData\Local\Programs\Python\Python311\python.exe"
    ) else (
        echo [LOI] Khong tim thay Python tren he thong!
        echo Vui long cai dat Python tai https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

:: 3. Khoi dong du an voi Localhost cho Giang vien cham thi
echo [*] Dang khoi dong EduAdvisor AI (Localhost)...
if exist "start_local.py" (
    "%PY%" "start_local.py"
) else (
    "%PY%" "start_online.py"
)

if errorlevel 1 (
    echo.
    echo [THONG BAO] Tien trinh da dung lai hoac gap su co.
    pause
)