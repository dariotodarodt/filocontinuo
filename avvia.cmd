@echo off
setlocal
cd /d "%~dp0"
if not exist "%~dp0.tools\tmp" mkdir "%~dp0.tools\tmp"
set "TEMP=%~dp0.tools\tmp"
set "TMP=%~dp0.tools\tmp"
set "npm_config_cache=%~dp0.tools\npm-cache"
if exist "%~dp0.tools\node-v22.16.0-win-x64\node.exe" set "PATH=%~dp0.tools\node-v22.16.0-win-x64;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Installa Node.js 22 o superiore da https://nodejs.org e riapri questo file.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm.cmd install --cache "%~dp0.tools\npm-cache"
  if errorlevel 1 exit /b 1
)
start "" http://127.0.0.1:5173
call npm.cmd run dev -- --port 5173 --strictPort
