# Respaldo de la base de datos del contenedor sportify-db (docker compose)
# Uso: .\scripts\backup-db.ps1   -> genera backups\sportify_db_<fecha>.sql
$ErrorActionPreference = 'Stop'

$envFile = Join-Path $PSScriptRoot '..\.env'
$password = (Get-Content $envFile | Where-Object { $_ -match '^MYSQL_ROOT_PASSWORD=' }) -replace '^MYSQL_ROOT_PASSWORD=', ''

$backupDir = Join-Path $PSScriptRoot '..\backups'
New-Item -ItemType Directory -Force $backupDir | Out-Null
$file = Join-Path $backupDir ("sportify_db_{0}.sql" -f (Get-Date -Format 'yyyyMMdd_HHmmss'))

docker compose exec -T db mysqldump -uroot "-p$password" --single-transaction sportify_db | Out-File -Encoding utf8 $file
Write-Host "Respaldo creado: $file"
