# Fase 5 — Operación

**Objetivo:** mantener el sistema funcionando en producción y poder recuperarlo cuando falla.

> **Operación vs. Monitoreo.** La operación **actúa** sobre el sistema: lo ejecuta, lo reinicia, lo respalda y lo devuelve a una versión anterior. El monitoreo ([fase 6](06_monitoreo.md)) **observa** el sistema: mide, registra y alerta. El monitoreo detecta el problema y la operación lo corrige.

**Herramientas:** política `restart` de Docker, reinicio automático, *health check gate* y rollback de Render, `scripts/backup-db.ps1` y respaldos automáticos de Aiven.

---

## 5.1 Recuperación automática

- **Local:** `restart: unless-stopped` en `docker-compose.yml` reinicia cualquier contenedor que se detenga.
- **Render:** reinicia el servicio si el proceso termina.

## 5.2 Despliegues seguros (*health check gate*)

`render.yaml` define `healthCheckPath: /api/health`. Render no envía tráfico a una versión nueva hasta que el endpoint responda `Healthy`; si no responde, mantiene la versión anterior en servicio. El endpoint es la misma señal que usa el monitoreo ([6.1](06_monitoreo.md#61-health-check-un-único-punto-de-verdad)); aquí se usa para **decidir** si la versión nueva entra en servicio.

## 5.3 Mantener la API disponible (keep-alive)

El plan gratuito de Render duerme el servicio después de 15 minutos sin tráfico, y la primera petición posterior sufre un arranque en frío de **34 s** (medido el 2026-10-19). El monitor de UptimeRobot ([6.2](06_monitoreo.md#62-monitoreo-de-disponibilidad-con-uptimerobot)) consulta la API cada 5 minutos, así que esta nunca se duerme: tras ≈3 h sin tráfico propio respondió en **1,06 s**. El monitor es una herramienta de monitoreo, pero este efecto suyo pertenece a la operación.

## 5.4 Procedimientos de operación

| Situación | Acción |
|---|---|
| Reiniciar | Local: `docker compose restart api` · Render: **Manual Deploy → Restart service** |
| Volver a la versión anterior (rollback) | Render: **Events** → despliegue anterior → **Rollback** · Local: `docker compose down` y `docker run ghcr.io/dubis007/sportify-api:<versión anterior>` |
| Respaldar la BD local | `.\scripts\backup-db.ps1` → `backups/sportify_db_<fecha>.sql` |
| Restaurar la BD local | `Get-Content backups\<archivo>.sql \| docker compose exec -T db mysql -uroot -p<clave> sportify_db` |
| Evidencia del respaldo (2026-10-19) | `backups/sportify_db_20261019_115804.sql`: 20 KB con las 15 sentencias `CREATE TABLE` y los datos semilla |
| Respaldar la BD en la nube | Aiven realiza respaldos automáticos diarios (pestaña **Backups**) |
