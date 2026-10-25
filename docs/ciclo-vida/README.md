# Herramientas del ciclo de vida del software — Sportify Club Manager

Este directorio documenta **qué herramientas se incorporaron al proyecto para cada fase del ciclo de vida, por qué se eligieron y cómo se implementaron paso a paso**. La bitácora cronológica de todas las acciones está en [bitacora.md](bitacora.md).

## Criterio de selección

1. **Priorizar herramientas que cubran varias fases** para reducir la cantidad de tecnologías a aprender y mantener.
2. **Sencillas de implementar**: configuración en archivos de texto dentro del repositorio (infraestructura como código), sin servidores propios.
3. **Gratuitas** para un proyecto académico.

## Herramientas por fase

| Herramienta | Construcción | Test | Liberación | Implementación | Operación | Monitoreo |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Docker + Docker Compose** | ✔ | | ✔ | ✔ | ✔ | ✔ |
| **GitHub Actions** | ✔ | ✔ | ✔ | ✔ | | |
| ESLint | ✔ | | | | | |
| xUnit + Moq + Coverlet (backend) | | ✔ | | | | |
| Vitest + Testing Library (frontend) | | ✔ | | | | |
| GitHub Releases + SemVer + GitHub Container Registry | | | ✔ | | | |
| **Render (Blueprint)** + Aiven MySQL | | | | ✔ | ✔ | ✔ |
| `scripts/backup-db.ps1` + respaldos de Aiven | | | | | ✔ | |
| Health Checks ASP.NET Core + UptimeRobot | | | | | | ✔ |

**Docker**, **GitHub Actions** y **Render** son las herramientas centrales. Entre las tres cubren las seis fases: Docker está en todas menos en test, GitHub Actions automatiza las cuatro primeras y Render sirve para implementación, operación y monitoreo.

## Flujo completo

```
 Desarrollador
     │ git push
     ▼
 GitHub Actions: CI (ci.yml) ──────────── CONSTRUCCIÓN + TEST
   ├─ backend: restore → build → dotnet test + cobertura
   ├─ frontend: npm ci → ESLint → Vitest + cobertura → vite build
   └─ docker compose build (valida las imágenes)
     │ git tag v1.0.0 && git push --tags
     ▼
 GitHub Actions: Release (release.yml) ─── LIBERACIÓN
   ├─ pruebas
   ├─ imágenes Docker → ghcr.io/dubis007/sportify-api|web:<versión>
   └─ GitHub Release con notas
     │ Deploy Hooks
     ▼
 Render (render.yaml) + Aiven MySQL ────── IMPLEMENTACIÓN
     │
     ▼
 restart automático · rollback · respaldos ─ OPERACIÓN (actúa)
     ▲
     │ alertas / hallazgos
 /api/health ← Docker HEALTHCHECK, Render, UptimeRobot
 logs y métricas de Render ─────────────── MONITOREO (observa)
     │ retroalimentación (issues)
     ▼
 Desarrollador (nuevo ciclo)
```

## Documentos por fase

1. [Construcción](01_construccion.md): Docker, Docker Compose, ESLint, configuración por variables de entorno.
2. [Test](02_test.md): xUnit/Coverlet, Vitest/Testing Library, CI con GitHub Actions.
3. [Liberación](03_liberacion.md): versionado SemVer, GitHub Releases, GitHub Container Registry.
4. [Implementación](04_implementacion.md): Render Blueprint, Aiven MySQL, Deploy Hooks.
5. [Operación](05_operacion.md): recuperación automática, despliegues seguros, keep-alive, respaldo y rollback.
6. [Monitoreo](06_monitoreo.md): health checks, UptimeRobot, logs, métricas y retroalimentación.

## Archivos agregados o modificados

| Archivo | Fase |
|---|---|
| `backend/Dockerfile`, `backend/.dockerignore` | Construcción / Monitoreo (`HEALTHCHECK`) |
| `frontend/Dockerfile`, `frontend/nginx.conf`, `frontend/.dockerignore` | Construcción |
| `docker-compose.yml`, `.env.example`, `.gitignore` | Construcción / Implementación |
| `frontend/eslint.config.js` | Construcción |
| `frontend/src/services/api/apiClient.ts`, `frontend/src/vite-env.d.ts` | Construcción (URL de API configurable) |
| `backend/Sportify.Api/Program.cs` | Construcción (CORS configurable) |
| `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `*.test.ts(x)` | Test |
| `backend/Sportify.Tests/Services/PaymentServiceTests.cs` | Test |
| `.github/workflows/ci.yml` | Construcción / Test |
| `.github/workflows/release.yml` | Liberación / Implementación |
| `render.yaml` | Implementación / Operación / Monitoreo |
| `scripts/backup-db.ps1` | Operación |
