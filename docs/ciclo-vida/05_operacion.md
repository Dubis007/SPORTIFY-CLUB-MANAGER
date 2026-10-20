# Fase 5 — Operación

**Objetivo:** saber si el sistema está funcionando, enterarse rápido cuando falla y poder recuperarlo.

**Herramientas:** Health Checks de ASP.NET Core (ya existían), `HEALTHCHECK` y `restart` de Docker, panel de logs/métricas de Render, UptimeRobot (monitoreo gratuito) y `scripts/backup-db.ps1`.

---

## 5.1 Health check: un único punto de verdad

El backend ya registraba un health check que además comprueba la conexión a la base de datos (`backend/Sportify.Api/Program.cs`):

```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<SportifyDbContext>("Database");
...
app.MapHealthChecks("/api/health");
```

Se reutilizó el mismo endpoint en tres lugares:

| Dónde | Para qué |
|---|---|
| `HEALTHCHECK` en `backend/Dockerfile` | Docker marca el contenedor como `healthy`/`unhealthy` (`docker compose ps`) |
| `healthCheckPath` en `render.yaml` | Render no envía tráfico a una versión nueva hasta que responda `Healthy`; si falla, mantiene la anterior |
| Monitor de UptimeRobot | Alerta por correo cuando la API cae |

## 5.2 Recuperación automática

- **Local:** `restart: unless-stopped` en `docker-compose.yml` reinicia cualquier contenedor que se detenga.
- **Render:** reinicia el servicio si el proceso termina.

## 5.3 Monitoreo con UptimeRobot (gratis)

1. Crear cuenta en https://uptimerobot.com.
2. **Add New Monitor** → tipo **HTTP(s)** → URL `https://sportify-api-ps0y.onrender.com/api/health` → intervalo 5 min.
3. Agregar el correo de alerta.
4. (Opcional) crear una **Status Page** pública para mostrar la disponibilidad.

Efecto adicional: la consulta cada 5 minutos evita que el plan gratuito de Render duerma la API.

### Evidencia (2026-10-19)

- Monitor **Sportify API** creado (HTTP(s), cada 5 min) y en estado **Up**.
- Antes del monitor, con la API dormida, la primera petición tardó **34 s** (arranque en frío de Render).
- Con el monitor activo, tras ≈3 h sin tráfico propio:

```text
$ curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://sportify-api-ps0y.onrender.com/api/health
200 1.061744s
200 0.461378s
200 0.319070s
```

La API responde en ~1 s desde la primera petición: el monitor la mantiene despierta. Captura sugerida para el informe: panel del monitor con el historial de *uptime* y tiempos de respuesta.

## 5.4 Logs

| Entorno | Comando / lugar |
|---|---|
| Local | `docker compose logs -f api` (o `db`, `web`) |
| Render | Servicio → pestaña **Logs** (en vivo, con búsqueda) y **Metrics** (CPU, memoria, peticiones) |

Los errores no controlados quedan registrados por `GlobalExceptionHandler` (`backend/Sportify.Api/Middlewares/GlobalExceptionHandler.cs`).

## 5.5 Procedimientos de operación

| Situación | Acción |
|---|---|
| Reiniciar | Local: `docker compose restart api` · Render: **Manual Deploy → Restart service** |
| Volver a la versión anterior (rollback) | Render: **Events** → despliegue anterior → **Rollback** · Local: `docker compose down` y `docker run ghcr.io/dubis007/sportify-api:<versión anterior>` |
| Respaldar la BD local | `.\scripts\backup-db.ps1` → `backups/sportify_db_<fecha>.sql` |
| Restaurar la BD local | `Get-Content backups\<archivo>.sql \| docker compose exec -T db mysql -uroot -p<clave> sportify_db` |
| Evidencia del respaldo (2026-10-19) | `backups/sportify_db_20261019_115804.sql`: 20 KB con las 15 sentencias `CREATE TABLE` y los datos semilla |
| Respaldar la BD en la nube | Aiven realiza respaldos automáticos diarios (pestaña **Backups**) |
