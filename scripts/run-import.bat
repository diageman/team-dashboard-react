@echo off
chcp 65001 >nul
cd /d "c:\Users\diageman\Desktop\Программист\Дашик\team-dashboard-react\scripts"

echo ========================================
echo 🚀 Автоматический импорт данных
echo %date% %time%
echo ========================================
echo.

call npm run import

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Импорт успешно завершён!
) else (
    echo.
    echo ❌ Ошибка при импорте! Код: %ERRORLEVEL%
)

echo.
echo Завершено: %date% %time%
echo ========================================
