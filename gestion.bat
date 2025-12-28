@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Puerto por defecto (coincide con server.js)
set PORT=3000

REM Si existe .env, leer PORT de ahi
if exist ".env" (
  for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    if /I "%%A"=="PORT" set PORT=%%B
  )
)

echo Iniciando backend en puerto %PORT%...

REM Iniciar el servidor en una nueva ventana de consola
start "Backend - Gestion Vehiculos" cmd /c "npm start"

REM Esperar a que el servidor responda /health (hasta ~20s)
set /a RETRIES=12
:wait_loop
ping -n 2 127.0.0.1 > nul
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing http://localhost:%PORT%/health -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %ERRORLEVEL% neq 0 (
  set /a RETRIES-=1
  if %RETRIES% gtr 0 goto wait_loop
)

echo Abriendo navegador en http://localhost:%PORT%/
start "" http://localhost:%PORT%/

endlocal
