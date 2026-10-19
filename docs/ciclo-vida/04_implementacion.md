# Fase 4 — Implementación (despliegue)

**Objetivo:** poner el sistema en funcionamiento en un entorno accesible por internet, de forma repetible y automática.

**Herramientas:** Render (plataforma en la nube, plan gratuito) definido con **Blueprint** (`render.yaml`), Aiven (MySQL gestionado, plan gratuito), Docker (la API se ejecuta con `backend/Dockerfile`) y GitHub Actions (Deploy Hooks). Alternativa local: `docker compose up -d` (ver [01_construccion.md](01_construccion.md)).

---

## 4.1 Base de datos: Aiven for MySQL (gratis)

Render no ofrece MySQL gratuito, por eso se usa Aiven.

1. Crear cuenta en https://aiven.io → **Create service** → **MySQL** → plan **Free**.
2. En *Overview* copiar `Host`, `Port`, `User` (`avnadmin`) y `Password`.
3. Armar la cadena de conexión (Aiven exige SSL):
   ```
   Server=<host>;Port=<port>;Database=sportify_db;Uid=avnadmin;Pwd=<password>;SslMode=Required;
   ```
   La API crea la base `sportify_db`, aplica las migraciones y carga los datos semilla al arrancar.

## 4.2 Render Blueprint (`render.yaml`)

Infraestructura como código: un archivo en el repositorio describe los dos servicios.

| Servicio | Tipo | Detalle |
|---|---|---|
| `sportify-api` | Web service, runtime **docker**, plan free | `backend/Dockerfile`; `healthCheckPath: /api/health`; `JwtSettings__Secret` generado por Render; conexión y CORS se ingresan en el panel (`sync: false`) |
| `sportify-web` | Static site | `rootDir: frontend`, `npm ci && npm run build`, publica `dist`; regla *rewrite* `/* → /index.html`; `VITE_API_URL` se ingresa en el panel |

Ambos tienen `autoDeploy: false`: **solo se despliega lo que se libera** (tag), no cada commit.

### Pasos
1. Crear cuenta en https://render.com con GitHub y autorizar el repositorio.
2. **New → Blueprint** → elegir el repositorio y la rama → Render lee `render.yaml`.
3. Completar las variables:
   - `ConnectionStrings__DefaultConnection`: la cadena de Aiven.
   - `Cors__AllowedOrigins__0`: `https://sportify-web.onrender.com` (URL real del static site).
   - `VITE_API_URL`: `https://sportify-api.onrender.com` (URL real de la API).
4. **Apply** → primer despliegue.
5. En cada servicio: **Settings → Deploy Hook** → copiar la URL.
6. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `RENDER_DEPLOY_HOOK_API` y `RENDER_DEPLOY_HOOK_WEB` con esas URLs.
   - (Variable) `VITE_API_URL` con la URL de la API, para la imagen del frontend en GHCR.

## 4.3 Despliegue automático

Desde ese momento, al subir un tag (`git push origin v1.0.1`), el job `deploy` de `release.yml` hace `POST` a los Deploy Hooks y Render reconstruye y publica ambos servicios. Si los secretos no existen, el job emite una advertencia y no falla.

**Evidencia:** Render → servicio → pestaña **Events** (despliegue *Live*), `https://sportify-api.onrender.com/api/health` → `Healthy`, inicio de sesión en `https://sportify-web.onrender.com` con `admin@sportify.com`.

> Nota del plan gratuito: la API se "duerme" tras 15 minutos sin tráfico y la primera petición tarda ~1 minuto en despertar. El monitor de UptimeRobot (fase 5) la mantiene activa.
