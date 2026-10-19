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
| 7 | 2026-10-19 | Construcción | Dockerfiles multi-stage + `.dockerignore` + `nginx.conf` | `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf` | ✅ creados · ⏳ construir localmente al instalar Docker |
| 8 | 2026-10-19 | Construcción / Implementación | Orquestación local BD + API + web | `docker-compose.yml`, `.env.example`, `.gitignore` (`.env`, `backups/`, `coverage/`, `TestResults/`) | ✅ creados · ⏳ `docker compose up -d --build` |
| 9 | 2026-10-19 | Test | Instalar Vitest y Testing Library | `npm install -D vitest@3 jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8@3` | ✅ |
| 10 | 2026-10-19 | Test | Configurar Vitest y crear 7 pruebas | `vitest.config.ts`, `src/test/setup.ts`, `schemas.test.ts`, `Pagination.test.tsx` | ✅ `Tests 7 passed` |
| 11 | 2026-10-19 | Test | Cobertura backend con Coverlet | `dotnet test --collect:"XPlat Code Coverage"` | ✅ `coverage.cobertura.xml` generado |
| 12 | 2026-10-19 | Construcción | Configurar ESLint 9 (no tenía configuración, `npm run lint` fallaba) | `npm install -D @eslint/js@9 globals typescript-eslint@8` · `eslint.config.js` | ✅ 113 problemas detectados |
| 13 | 2026-10-19 | Construcción | Corregir 5 `no-unused-vars` y dejar `any` como advertencia | 5 archivos `catch (err)` → `catch` · regla `no-explicit-any: warn` | ✅ `0 errors, 105 warnings` |
| 14 | 2026-10-19 | Construcción / Test | Workflow de CI | `.github/workflows/ci.yml` | ✅ creado · ⏳ primera ejecución al hacer push |
| 15 | 2026-10-19 | Liberación / Implementación | Workflow de Release (GHCR + GitHub Release + Deploy Hooks) | `.github/workflows/release.yml` | ✅ creado · ⏳ ejecutar con tag `v1.0.0` |
| 16 | 2026-10-19 | Implementación / Operación | Blueprint de Render | `render.yaml` | ✅ creado · ⏳ crear servicios en Render |
| 17 | 2026-10-19 | Operación | Script de respaldo de la BD local | `scripts/backup-db.ps1` | ✅ creado · ⏳ probar con Docker |
| 18 | 2026-10-19 | Todas | Documentación por fase y bitácora | `docs/ciclo-vida/*.md`, `CHANGELOG.md` | ✅ |
| 19 | — | Construcción | Instalar Docker Desktop y levantar el entorno | `docker compose up -d --build` · `curl http://localhost:8080/api/health` | ⏳ |
| 20 | — | Construcción / Test | Subir la rama y verificar CI en verde | `git push -u origin Ciclo_Vida_DevOps` | ⏳ |
| 21 | — | Implementación | Crear MySQL en Aiven y Blueprint en Render; cargar secretos `RENDER_DEPLOY_HOOK_API/WEB` | Panel de Aiven, Render y GitHub | ⏳ |
| 22 | — | Liberación | Publicar la primera versión | `git tag -a v1.0.0 -m "Sportify v1.0.0"` · `git push origin v1.0.0` | ⏳ |
| 23 | — | Operación | Crear monitor HTTP en UptimeRobot sobre `/api/health` | Panel de UptimeRobot | ⏳ |

> Al completar cada paso pendiente, cambiar ⏳ por ✅, poner la fecha y agregar la evidencia (captura o enlace a la ejecución de GitHub Actions / Render) en el documento de la fase.
