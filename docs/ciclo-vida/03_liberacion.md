# Fase 3 — Liberación

**Objetivo:** producir versiones identificables, probadas y descargables del sistema.

**Herramientas:** Versionado semántico (SemVer) con tags de git, GitHub Actions (`release.yml`), GitHub Container Registry (GHCR) y GitHub Releases. Se reutiliza `CHANGELOG.md` (formato *Keep a Changelog*, ya existente).

---

## 3.1 Convención de versiones (SemVer)

`vMAYOR.MENOR.PARCHE`, por ejemplo `v1.0.0`:
- **MAYOR**: cambios incompatibles (p. ej. la API cambia contratos).
- **MENOR**: funcionalidades nuevas compatibles.
- **PARCHE**: correcciones de errores.

Primera versión liberada: **`v1.0.0`**.

## 3.2 Workflow de liberación (`.github/workflows/release.yml`)

Se dispara **solo al subir un tag** con forma `v*.*.*`. Permisos: `contents: write` (crear el Release) y `packages: write` (publicar imágenes).

| Job | Qué hace |
|---|---|
| `test` | Vuelve a ejecutar `dotnet test` y `npm run test`: no se libera nada que no pase las pruebas |
| `publish` | Calcula la versión desde el tag; inicia sesión en `ghcr.io` con el `GITHUB_TOKEN` automático; construye y publica `ghcr.io/dubis007/sportify-api:<versión>` y `sportify-web:<versión>` (más `latest`); crea el **GitHub Release** con notas generadas automáticamente y enlace a `CHANGELOG.md` |
| `deploy` | Llama a los Deploy Hooks de Render (ver [04_implementacion.md](04_implementacion.md)) |

La variable de repositorio opcional `VITE_API_URL` (GitHub → Settings → Secrets and variables → Actions → *Variables*) define con qué URL de API se compila la imagen del frontend.

## 3.3 Pasos para liberar una versión

```powershell
# 1. Agregar la entrada de la versión en CHANGELOG.md y hacer commit
# 2. Crear el tag y subirlo
git tag -a v1.0.0 -m "Sportify v1.0.0"
git push origin v1.0.0
```

**Evidencia:**
- GitHub → **Actions** → workflow *Release* en verde.
- GitHub → **Releases** → `Sportify v1.0.0`.
- GitHub → perfil/organización → **Packages** → `sportify-api` y `sportify-web` con la etiqueta `1.0.0`.
- Cualquiera puede descargar la versión: `docker pull ghcr.io/dubis007/sportify-api:1.0.0`.

## 3.4 Liberación real: v1.0.0 (2026-10-19)

`git tag -a v1.0.0 -m "Sportify v1.0.0"` · `git push origin v1.0.0` sobre el commit `fe15e4a`. Ejecución: [Release run 39329172944](https://github.com/Dubis007/SPORTIFY-CLUB-MANAGER/actions/runs/39329172944).

| Job | Intento 1 | Intento 2 |
|---|---|---|
| Pruebas antes de liberar | ✅ | ✅ |
| Publicar imágenes y Release | ✅ | ✅ |
| Desplegar en Render | ❌ `curl` código 3 (URL mal formada) | ✅ |

**Problema encontrado:** un secret de Deploy Hook se había pegado con caracteres de más (espacio, salto de línea o texto extra). Se volvieron a copiar los hooks con el botón de copiar de Render, se actualizaron los secrets y se usó **Re-run failed jobs**: solo se repitió el despliegue, sin volver a publicar el Release.

**Evidencia:**
- [GitHub Release `Sportify v1.0.0`](https://github.com/Dubis007/SPORTIFY-CLUB-MANAGER/releases/tag/v1.0.0), con notas generadas automáticamente.
- Imágenes públicas en GHCR con las etiquetas `1.0.0` y `latest`: `ghcr.io/dubis007/sportify-api` y `ghcr.io/dubis007/sportify-web` (comprobado con un token anónimo: `tags: ["1.0.0","latest"]`).
- Después del redeploy: `/api/health` → `Healthy` y el CORS del frontend correcto.
