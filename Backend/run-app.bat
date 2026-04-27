@echo off
echo ========================================
echo Building and Running Travel Hub Backend
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Cleaning and building project...
call mvnw.cmd clean install
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Starting Spring Boot application...
echo.
call mvnw.cmd spring-boot:run

pause
