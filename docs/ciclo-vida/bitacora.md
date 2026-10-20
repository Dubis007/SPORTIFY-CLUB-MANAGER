# Bitácora de implementación de herramientas

Registro cronológico de cada acción realizada. Estado: ✅ hecho y verificado · ⏳ pendiente (requiere acción del equipo).

| # | Fecha | Fase | Acción | Comando / archivo | Resultado |
|---|---|---|---|---|---|
| 1 | 2026-10-19 | — | Actualizar la rama base con los cambios remotos | `git fetch origin` · `git pull --ff-only` | ✅ `Rendimiento_Admin_Frontend` en `22a844e` |
| 2 | 2026-10-19 | Construcción | Reinstalar dependencias (los `node_modules`/`obj` se quitaron del repo) | `npm install` · `dotnet restore backend/Sportify.slnx` | ✅ 5 proyectos restaurados, build OK |
| 3 | 2026-10-19 | Test | Corregir prueba rota por el nuevo parámetro `IFileStorageService` | `backend/Sportify.Tests/Services/PaymentServiceTests.cs` | ✅ 3/3 pruebas superadas |
| 4 | 2026-10-19 | — | Crear rama de trabajo | `git checkout -b Ciclo_Vida_DevOps` | ✅ |
| 5 | 2026-10-19 | Construcción | URL de la API configurable con `VITE_API_URL` | `apiClient.ts`, `vite-env.d.ts`, `AccountantDashboard.tsx`, `AdminPaymentsPage.tsx` | ✅ |
| 6 | 2026-10-19 | Construcción | CORS/CSP configurables con `Cors__AllowedOrigins__N` | `backend/Sportify.Api/Program.cs` | ✅ build OK |
| 7 | 2026-10-19 | Construcción | Dockerfiles multi-stage + `.dockerignore` + `nginx.conf` | `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf` | ✅ creados · ✅ construidos (ver #19) |
| 8 | 2026-10-19 | Construcción / Implementación | Orquestación local BD + API + web | `docker-compose.yml`, `.env.example`, `.gitignore` (`.env`, `backups/`, `coverage/`, `TestResults/`) | ✅ creados · ✅ entorno levantado (ver #19) |
| 9 | 2026-10-19 | Test | Instalar Vitest y Testing Library | `npm install -D vitest@3 jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8@3` | ✅ |
| 10 | 2026-10-19 | Test | Configurar Vitest y crear 7 pruebas | `vitest.config.ts`, `src/test/setup.ts`, `schemas.test.ts`, `Pagination.test.tsx` | ✅ `Tests 7 passed` |
| 11 | 2026-10-19 | Test | Cobertura backend con Coverlet | `dotnet test --collect:"XPlat Code Coverage"` | ✅ `coverage.cobertura.xml` generado |
| 12 | 2026-10-19 | Construcción | Configurar ESLint 9 (no tenía configuración, `npm run lint` fallaba) | `npm install -D @eslint/js@9 globals typescript-eslint@8` · `eslint.config.js` | ✅ 113 problemas detectados |
| 13 | 2026-10-19 | Construcción | Corregir 5 `no-unused-vars` y dejar `any` como advertencia | 5 archivos `catch (err)` → `catch` · regla `no-explicit-any: warn` | ✅ `0 errors, 105 warnings` |
| 14 | 2026-10-19 | Construcción / Test | Workflow de CI | `.github/workflows/ci.yml` | ✅ creado · ✅ primera ejecución en verde (ver #20) |
| 15 | 2026-10-19 | Liberación / Implementación | Workflow de Release (GHCR + GitHub Release + Deploy Hooks) | `.github/workflows/release.yml` | ✅ creado · ✅ ejecutado con tag `v1.0.0` (ver #22) |
| 16 | 2026-10-19 | Implementación / Operación / Monitoreo | Blueprint de Render | `render.yaml` | ✅ creado · ✅ servicios creados en Render (ver #21) |
| 17 | 2026-10-19 | Operación | Script de respaldo de la BD local | `scripts/backup-db.ps1` | ✅ creado · ✅ probado (ver #26) |
| 18 | 2026-10-19 | Todas | Documentación por fase y bitácora | `docs/ciclo-vida/*.md`, `CHANGELOG.md` | ✅ |
| 19 | 2026-10-19 | Construcción | Instalar Docker Desktop y levantar el entorno | `docker compose up -d --build` · `curl http://localhost:8080/api/health` | ✅ Docker 29.9.1; 3 contenedores *healthy*, pero BD vacía → ver #24 y #25 |
| 20 | 2026-10-19 | Construcción / Test | Subir la rama y verificar CI en verde | `git push -u origin Ciclo_Vida_DevOps` | ✅ [run 39280917366](https://github.com/Dubis007/SPORTIFY-CLUB-MANAGER/actions/runs/39280917366): 3/3 jobs success |
| 21 | 2026-10-19 | Implementación | Crear MySQL en Aiven y Blueprint en Render; cargar secretos `RENDER_DEPLOY_HOOK_API/WEB` | Panel de Aiven, Render y GitHub | ✅ API https://sportify-api-ps0y.onrender.com · web https://sportify-web-p1fi.onrender.com; health, login, CORS y endpoint protegido OK (ver #28) |
| 22 | 2026-10-19 | Liberación | Publicar la primera versión | `git tag -a v1.0.0 -m "Sportify v1.0.0"` · `git push origin v1.0.0` | ✅ [Release v1.0.0](https://github.com/Dubis007/SPORTIFY-CLUB-MANAGER/releases/tag/v1.0.0); imágenes `1.0.0` en GHCR; [run 39329172944](https://github.com/Dubis007/SPORTIFY-CLUB-MANAGER/actions/runs/39329172944) en verde (intento 2, ver #29) |
| 23 | 2026-10-19 | Monitoreo (keep-alive → Operación) | Crear monitor HTTP en UptimeRobot sobre `/api/health` | Panel de UptimeRobot: HTTP(s), `https://sportify-api-ps0y.onrender.com/api/health`, cada 5 min | ✅ monitor *Sportify API* en **Up** · ✅ keep-alive verificado: 20:12 (≈3 h sin tráfico propio) `/api/health` → 200 en 1,06 s (vs 34 s con la API dormida) |
| 24 | 2026-10-19 | Construcción | Corregir healthcheck de MySQL: la API arrancaba durante la inicialización de la BD (`Unable to connect`) | `docker-compose.yml`: `mysqladmin ping -h 127.0.0.1` (TCP) | ✅ la API espera a que MySQL acepte conexiones de red |
| 25 | 2026-10-19 | Construcción | Corregir la migración: MySQL 8 rechazaba `DEFAULT UTC_TIMESTAMP()` y no se creaba `Usuarios` | `SportifyDbContext.cs`, `InitialCreate.cs`, snapshot → `(UTC_TIMESTAMP())` | ✅ desde cero: 15 tablas, 4 usuarios semilla, 0 errores, login 200 con JWT; xUnit 3/3 |
| 26 | 2026-10-19 | Operación | Probar el respaldo de la BD | `.\scripts\backup-db.ps1` | ✅ `sportify_db_20261019_115804.sql` (20 KB, 15 tablas) |
| 27 | 2026-10-19 | Implementación | Fijar Node 22 en el sitio estático de Render (igual que el CI) | `render.yaml`: `NODE_VERSION=22` | ✅ |
| 28 | 2026-10-19 | Implementación | Corregir URLs con sufijo de Render: frontend llamaba a otra API y CORS bloqueaba el login | Render: `VITE_API_URL` (rebuild) y `Cors__AllowedOrigins__0`; GitHub: variable `VITE_API_URL` | ✅ preflight 204 con `access-control-allow-origin` del web; origen ajeno rechazado |
| 29 | 2026-10-19 | Liberación / Implementación | Corregir secrets de Deploy Hook mal pegados (`curl` código 3) y relanzar solo el despliegue | GitHub Secrets · *Re-run failed jobs* | ✅ job *Desplegar en Render* success; health y CORS OK tras el redeploy |
| 30 | 2026-10-19 | Operación / Monitoreo | Separar Operación y Monitoreo en dos fases (el entregable pide 6): la operación actúa y el monitoreo observa | `05_operacion.md`, nuevo `06_monitoreo.md`, `README.md` (columna Monitoreo y diagrama) | ✅ |
| 31 | 2026-10-19 | Todas | Documento Word para el informe académico: por fase, herramienta, cómo se implementó y función | `docs/ciclo-vida/Sportify_Ciclo_de_Vida_DevOps.docx` (generado con docx-js, validado y revisado en Word) | ✅ 9 páginas, 19 herramientas en 6 fases |

> Al completar cada paso pendiente, cambiar ⏳ por ✅, poner la fecha y agregar la evidencia (captura o enlace a la ejecución de GitHub Actions / Render) en el documento de la fase.
