@echo off
REM Doble clic para previsualizar la landing de Origen en el navegador.
REM Arranca un servidor local (necesario: las fuentes y los iframes no cargan via file://)
REM y abre http://localhost:8000/ . Para detenerlo, cierra la ventana de PowerShell.
cd /d "%~dp0"
start "Origen - servidor local" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
timeout /t 1 >nul
start "" http://localhost:8000/
