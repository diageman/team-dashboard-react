@echo off
cd /d "c:\Users\diageman\Desktop\Программист\Дашик\team-dashboard-react"

echo ========================================
echo   Загрузка на GitHub и деплой
echo ========================================
echo.

REM Проверка наличия Git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Git не установлен!
    echo Скачайте Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Инициализация репозитория (если еще не создан)
if not exist ".git" (
    echo Инициализация Git репозитория...
    git init
    git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/ВАШ_РЕПО.git
)

echo.
echo [1/4] Добавление файлов...
git add .

echo.
echo [2/4] Создание коммита...
git commit -m "Premium design update: animations, glow effects, performance fixes"

echo.
echo [3/4] Загрузка на GitHub...
git branch -M main
git push -u origin main

echo.
echo [4/4] Деплой на хостинг...
call npm run deploy

echo.
echo ========================================
echo   Готово! Проект загружен и задеплоен
echo ========================================
pause
