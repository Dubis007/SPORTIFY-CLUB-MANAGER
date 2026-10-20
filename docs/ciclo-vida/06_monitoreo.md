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

### Incidente real detectado (2026-10-20)

El monitor pasó a **Down** el 20-oct a las 14:09 (GMT-5) con causa `502 Bad Gateway`; a las 15:44 llevaba 1 h 34 min caído y la disponibilidad de 7 días bajó a 92,647 % (2 incidentes; el anterior, del 19-oct, duró 5 min). Comprobación manual: `/api/health` sin respuesta en 60–120 s, mientras el frontend estático respondía 200. Capturas: `img/uptimerobot-monitor.png` e `img/uptimerobot-respuesta-incidentes.png`.

**Recuperación:** el incidente quedó *Resolved* a las 16:46 tras **2 h 37 min**; la disponibilidad de 7 días quedó en 88,478 % (2 incidentes, 2 h 42 min caído en total). Verificación: `/api/health` → `200 Healthy` en 0,78 s. Capturas: `img/uptimerobot-monitor-up.png` e `img/uptimerobot-incidentes-resueltos.png`.

> Nota: en ese periodo la gráfica de tiempo de respuesta (≈305 ms) mide la respuesta 502 del proxy de Render, no el rendimiento de la API.

## 6.3 Demo con tráfico artificial (`scripts/demo-trafico.mjs`)

Script de Node sin dependencias que simula usuarios concurrentes contra la API y resume su rendimiento. Se ejecuta con `node` (no le afecta la política de ejecución de scripts de PowerShell):

```powershell
node scripts/demo-trafico.mjs                                   # 10 usuarios, 60 s, /api/health en Render
node scripts/demo-trafico.mjs <url> <usuarios> <segundos>       # personalizado
```

Cada usuario virtual hace una petición, espera 250 ms y repite (carga ligera). Cada 5 s muestra el progreso y al final: peticiones totales, req/s, % de éxito, códigos de respuesta y tiempos mín/promedio/p50/p95/máx.

**Guion de la demo (después de la presentación `UptimeRobot_Sportify.pptx`):**
1. Abrir el panel de UptimeRobot en el monitor *sportify-api* (estado y gráfica de tiempo de respuesta).
2. Ejecutar `node scripts/demo-trafico.mjs` y comentar el progreso.
3. Leer el resumen: % de éxito, promedio y p95.
4. Volver a UptimeRobot: el chequeo siguiente (cada 5 min) sigue en **Up** y su tiempo aparece en la gráfica.

Prueba contra la API real (2026-10-20, tras la recuperación): 10 usuarios × 60 s → **1081 respuestas 200 (100 %)**, 18 req/s, mín 244 ms · promedio 298 ms · p50 263 ms · p95 419 ms · máx 2890 ms (el máximo corresponde a las primeras peticiones). Pruebas previas: contra el frontend, 10 usuarios × 10 s → 290 peticiones, 100 % 200, promedio 90 ms, p95 91 ms; contra la API caída → todas las peticiones como `timeout`/`sin respuesta`, sin bloquear el script.

## 6.4 Logs

| Entorno | Comando / lugar |
|---|---|
| Local | `docker compose logs -f api` (o `db`, `web`) |
| Render | Servicio → pestaña **Logs** (en vivo y con búsqueda) |

Los errores no controlados quedan registrados por `GlobalExceptionHandler` (`backend/Sportify.Api/Middlewares/GlobalExceptionHandler.cs`).

## 6.5 Métricas

En Render, la pestaña **Metrics** de cada servicio muestra CPU, memoria y peticiones por minuto. Así se ve si el plan gratuito se queda corto (por ejemplo, si la memoria está cerca del límite).

## 6.6 De la observación a la acción

El monitoreo no corrige nada por sí mismo: detecta y avisa. La corrección la hace la [fase de Operación](05_operacion.md) o, si el problema exige cambiar el código, un nuevo ciclo de desarrollo.

| Qué se detecta | Herramienta que lo detecta | Quién actúa |
|---|---|---|
| La API no responde | UptimeRobot (correo), `docker compose ps` (`unhealthy`) | Operación: reiniciar ([5.4](05_operacion.md#54-procedimientos-de-operación)) |
| Una versión nueva falla al arrancar | Health check de Render | Operación: Render mantiene la versión anterior; si es necesario, rollback |
| La base de datos no está disponible | `/api/health` → `Unhealthy` (check `Database`) | Operación: revisar Aiven o el contenedor `db` y restaurar el respaldo |
| Errores 500 repetidos | Logs (`GlobalExceptionHandler`) | Desarrollo: registrar un issue en GitHub → construcción → test → liberación |

**Retroalimentación (cierre del ciclo DevOps):** lo que se observa vuelve a la planificación. Un caso real de este proyecto: la medición del arranque en frío de 34 s llevó a usar el monitor de UptimeRobot también como keep-alive ([5.3](05_operacion.md#53-mantener-la-api-disponible-keep-alive)).
