# Script de Mantenimiento Preventivo y Auditoría de Superficie de Ataque (Sportify Club Manager)
# Ejecuta escaneo de vulnerabilidades en NuGet (.NET 10) y npm (React Frontend + Microservicios TS).

$ErrorActionPreference = "Stop"

Write-Host "=== 1. Escaneando paquetes NuGet vulnerables en Backend (.NET 10) ===" -ForegroundColor Cyan
dotnet list "$PSScriptRoot\..\backend\Sportify.slnx" package --vulnerable

Write-Host "`n=== 2. Escaneando dependencias de producción en Frontend (React/Vite) ===" -ForegroundColor Cyan
npm --prefix "$PSScriptRoot\..\frontend" audit --omit=dev

Write-Host "`n=== 3. Escaneando dependencias en Microservicios (Node/TS) ===" -ForegroundColor Cyan
npm --prefix "$PSScriptRoot\..\backend\microservice" audit --omit=dev

Write-Host "`nAuditoría preventiva completada exitosamente." -ForegroundColor Green
