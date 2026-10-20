# Fase 6 — Monitoreo

**Objetivo:** saber en todo momento qué está pasando con el sistema, enterarse rápido cuando falla y convertir lo observado en mejoras.

**Herramientas:** Health Checks de ASP.NET Core (ya existían), `HEALTHCHECK` de Docker, UptimeRobot (monitoreo gratuito), y el panel de logs y métricas de Render.

---

## 6.1 Health check: un único punto de verdad

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
| `HEALTHCHECK` en `backend/Dockerfile` | Docker marca el contenedor como `healthy`/`unhealthy` (se ve con `docker compose ps`) |
| `healthCheckPath` en `render.yaml` | Render usa el resultado para aceptar o rechazar un despliegue (ver [5.2](05_operacion.md#52-despliegues-seguros-health-check-gate)) |
| Monitor de UptimeRobot | Mide la disponibilidad y alerta por correo cuando la API cae |

## 6.2 Monitoreo de disponibilidad con UptimeRobot

1. Crear una cuenta en https://uptimerobot.com.
2. **Add New Monitor** → tipo **HTTP(s)** → URL `https://sportify-api-ps0y.onrender.com/api/health` → intervalo de 5 min.
3. Agregar el correo de alerta.
4. (Opcional) crear una **Status Page** pública para mostrar la disponibilidad.

El panel muestra el porcentaje de *uptime*, el historial de caídas y el tiempo de respuesta de cada consulta.

### Evidencia (2026-10-19)

- Monitor **Sportify API** creado (HTTP(s), cada 5 min) y en estado **Up**.
- Antes de existir el monitor, con la API dormida, la primera petición tardó **34 s**.
- Con el monitor activo, tras ≈3 h sin tráfico propio:

```text
$ curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://sportify-api-ps0y.onrender.com/api/health
200 1.061744s
200 0.461378s
200 0.319070s
```

Captura sugerida para el informe: panel del monitor con el historial de *uptime* y los tiempos de respuesta.

## 6.3 Logs

| Entorno | Comando / lugar |
|---|---|
| Local | `docker compose logs -f api` (o `db`, `web`) |
| Render | Servicio → pestaña **Logs** (en vivo y con búsqueda) |

Los errores no controlados quedan registrados por `GlobalExceptionHandler` (`backend/Sportify.Api/Middlewares/GlobalExceptionHandler.cs`).

## 6.4 Métricas

En Render, la pestaña **Metrics** de cada servicio muestra CPU, memoria y peticiones por minuto. Así se ve si el plan gratuito se queda corto (por ejemplo, si la memoria está cerca del límite).

## 6.5 De la observación a la acción

El monitoreo no corrige nada por sí mismo: detecta y avisa. La corrección la hace la [fase de Operación](05_operacion.md) o, si el problema exige cambiar el código, un nuevo ciclo de desarrollo.

| Qué se detecta | Herramienta que lo detecta | Quién actúa |
|---|---|---|
| La API no responde | UptimeRobot (correo), `docker compose ps` (`unhealthy`) | Operación: reiniciar ([5.4](05_operacion.md#54-procedimientos-de-operación)) |
| Una versión nueva falla al arrancar | Health check de Render | Operación: Render mantiene la versión anterior; si es necesario, rollback |
| La base de datos no está disponible | `/api/health` → `Unhealthy` (check `Database`) | Operación: revisar Aiven o el contenedor `db` y restaurar el respaldo |
| Errores 500 repetidos | Logs (`GlobalExceptionHandler`) | Desarrollo: registrar un issue en GitHub → construcción → test → liberación |

**Retroalimentación (cierre del ciclo DevOps):** lo que se observa vuelve a la planificación. Un caso real de este proyecto: la medición del arranque en frío de 34 s llevó a usar el monitor de UptimeRobot también como keep-alive ([5.3](05_operacion.md#53-mantener-la-api-disponible-keep-alive)).
