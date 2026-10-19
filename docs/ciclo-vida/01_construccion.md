# Fase 1 — Construcción

**Objetivo:** que cualquier persona (o servidor) pueda compilar y ejecutar el sistema completo de la misma forma, sin instalar .NET, Node ni MySQL a mano, y que el código cumpla reglas de calidad.

**Herramientas:** Docker, Docker Compose, ESLint y GitHub Actions (job de build, ver [02_test.md](02_test.md)).

---

## 1.1 Preparación: configuración por variables de entorno

Antes de contenerizar se detectó que el código tenía direcciones fijas de desarrollo, que impedirían ejecutarlo en Docker o en la nube:

| Problema | Archivo | Solución |
|---|---|---|
| URL de la API fija `http://localhost:5000` | `frontend/src/services/api/apiClient.ts` | `export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';` |
| La misma URL fija para ver comprobantes PDF | `frontend/src/pages/accountant/AccountantDashboard.tsx`, `frontend/src/pages/admin/AdminPaymentsPage.tsx` | Se reutiliza `API_URL` importado de `apiClient.ts` |
| Tipado de `import.meta.env` | `frontend/src/vite-env.d.ts` (nuevo) | Declara `VITE_API_URL` |
| Orígenes CORS y CSP fijos en `localhost:5173` | `backend/Sportify.Api/Program.cs` | Se leen de `Cors:AllowedOrigins` (variable `Cors__AllowedOrigins__0`); si no existe, se mantiene `localhost:5173` |

En desarrollo local todo sigue funcionando igual porque los valores por defecto son los anteriores.

## 1.2 Docker: imágenes del backend y del frontend

**Qué es:** Docker empaqueta la aplicación con todo lo que necesita (runtime, dependencias) en una *imagen* que se ejecuta igual en cualquier máquina.

**Por qué:** es la herramienta que más fases cubre: construye (build reproducible), es el artefacto que se libera (imagen versionada), es lo que se implementa (Render la ejecuta) y facilita la operación (reinicio automático y health check).

### `backend/Dockerfile` (multi-stage)
1. **Etapa `build`** (`mcr.microsoft.com/dotnet/sdk:10.0`): copia primero solo los `.csproj` y ejecuta `dotnet restore` (así Docker reutiliza esa capa si solo cambia el código), luego copia el código y ejecuta `dotnet publish -c Release`.
2. **Etapa `runtime`** (`mcr.microsoft.com/dotnet/aspnet:10.0`, más liviana, sin SDK): copia solo el resultado publicado, crea `wwwroot/comprobantes`, expone el puerto 8080 y define un `HEALTHCHECK` que consulta `/api/health`.

`backend/.dockerignore` excluye `bin/`, `obj/`, el proyecto de pruebas y PDFs para que la imagen sea pequeña.

### `frontend/Dockerfile` (multi-stage)
1. **Etapa `build`** (`node:22-alpine`): `npm ci` y `npm run build`. Recibe `ARG VITE_API_URL`, porque Vite incrusta la URL de la API en el JavaScript al compilar.
2. **Etapa `runtime`** (`nginx:1.27-alpine`): sirve la carpeta `dist` con `frontend/nginx.conf`, que activa gzip, caché larga para `/assets/` y redirige toda ruta a `index.html` (necesario para React Router).

## 1.3 Docker Compose: el sistema completo con un comando

`docker-compose.yml` en la raíz define tres servicios:

| Servicio | Imagen | Puerto local | Detalle |
|---|---|---|---|
| `db` | `mysql:8.4` | 3307 | Volumen `db_data` para persistir datos; healthcheck con `mysqladmin ping` |
| `api` | `./backend` | 8080 | Espera a que `db` esté *healthy*; recibe conexión, secreto JWT y CORS por variables de entorno; volumen `comprobantes` |
| `web` | `./frontend` | 8081 | Compilado con `VITE_API_URL=http://localhost:8080` |

Todos usan `restart: unless-stopped`. Los secretos se leen de un archivo `.env` (ignorado por git); la plantilla es `.env.example`.

Al arrancar, la API aplica las migraciones de EF Core y carga los datos semilla (lógica ya existente en `Program.cs`), por lo que no hay que crear la base de datos a mano.

### Pasos para ejecutarlo
```powershell
# 1. Instalar Docker Desktop (https://www.docker.com/products/docker-desktop/) y reiniciar
docker --version
# 2. Crear el archivo de secretos
Copy-Item .env.example .env   # y editar los valores
# 3. Construir y levantar
docker compose up -d --build
# 4. Verificar
docker compose ps
curl http://localhost:8080/api/health   # -> Healthy
# Frontend: http://localhost:8081  (admin@sportify.com / Admin123!)
```

## 1.4 ESLint: calidad del código del frontend

**Situación encontrada:** el proyecto tenía ESLint 9 instalado y el script `npm run lint`, pero **no tenía archivo de configuración**, así que el comando fallaba siempre.

**Pasos realizados:**
1. Se instalaron los paquetes que pide la configuración "flat" de ESLint 9:
   `npm install -D @eslint/js@9 globals typescript-eslint@8`
2. Se creó `frontend/eslint.config.js` con las reglas recomendadas de JavaScript, TypeScript, React Hooks y React Refresh.
3. Primera ejecución: **113 problemas** (107 `no-explicit-any`, 5 `no-unused-vars`, 1 advertencia).
4. Se corrigieron los 5 `no-unused-vars`: eran `catch (err)` con la variable sin usar; se cambiaron a `catch {` en `AccountantDashboard.tsx`, `AdminPaymentsPage.tsx`, `useAccountantViewModel.ts`, `useCoachViewModel.ts` y `useLocationsViewModel.ts`.
5. Los 107 usos de `any` se dejaron como **advertencia** (deuda técnica documentada en la configuración) para no bloquear el CI; se pueden ir tipando poco a poco.
6. Se actualizó el script: `"lint": "eslint . --report-unused-disable-directives"` (la opción `--ext` ya no existe en ESLint 9).

**Resultado:** `npm run lint` → `0 errors, 105 warnings`, código de salida 0.
