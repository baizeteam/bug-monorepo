@echo off
setlocal
cd /d "%~dp0\.."

echo [INFO] Checking Docker engine...
docker info >nul 2>&1
if %errorlevel% neq 0 (
  echo [INFO] Docker is not ready, trying to start Docker Desktop...
  start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
  if %errorlevel% neq 0 (
    start "" "%LocalAppData%\Docker\Docker Desktop.exe"
  )

  echo [INFO] Waiting for Docker engine...
  set /a retries=0
  :wait_docker
  timeout /t 3 /nobreak >nul
  docker info >nul 2>&1
  if %errorlevel% equ 0 goto docker_ready
  set /a retries+=1
  if %retries% geq 40 (
    echo [ERROR] Docker did not become ready in time.
    echo [ERROR] Please open Docker Desktop manually, then run again.
    exit /b 1
  )
  goto wait_docker
)

:docker_ready
echo [INFO] Docker is ready.
echo [INFO] Starting all services...
powershell -ExecutionPolicy Bypass -File ".\scripts\dev-all.ps1"

