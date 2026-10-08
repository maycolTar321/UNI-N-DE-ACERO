@echo off
title UNION DE ACERO - SERVIDOR LOCAL
color 0A

echo ==========================================
echo       UNION DE ACERO
echo       SERVIDOR LOCAL
echo ==========================================
echo.
echo Iniciando servidor...
echo.

cd /d "C:\Users\HP\proyectos\union-de-acero"

if not exist "package.json" (
    echo.
    echo ERROR: No se encontro package.json
    echo Revisa que la carpeta del proyecto sea correcta.
    echo.
    pause
    exit /b
)

if not exist "node_modules" (
    echo Instalando dependencias por primera vez...
    echo.
    call npm install
    echo.
)

echo Iniciando Next.js...
echo.
call npm run dev

pause