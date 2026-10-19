# Fase 2 — Test

**Objetivo:** verificar automáticamente que el sistema funciona en cada cambio y medir cuánto código cubren las pruebas.

**Herramientas:** xUnit + Moq + Coverlet (backend), Vitest + Testing Library (frontend), GitHub Actions (ejecución automática).

---

## 2.1 Backend: xUnit, Moq y Coverlet

El proyecto `backend/Sportify.Tests` ya usaba **xUnit** (framework de pruebas), **Moq** (simula dependencias como el repositorio) y **coverlet.collector** (cobertura de código).

**Corrección previa:** al integrar los cambios de la rama remota, `PaymentService` pasó a recibir un segundo parámetro (`IFileStorageService`) y las pruebas dejaron de compilar (`error CS7036`). Se agregó un mock en `backend/Sportify.Tests/Services/PaymentServiceTests.cs`:

```csharp
private readonly Mock<IFileStorageService> _fileStorageMock = new();
...
_service = new PaymentService(_repositoryMock.Object, _fileStorageMock.Object);
```

**Ejecución con cobertura:**
```powershell
dotnet test backend/Sportify.slnx --collect:"XPlat Code Coverage" --results-directory backend/TestResults
```
Resultado: `Correctas! - Con error: 0, Superado: 3, Total: 3` y el reporte `coverage.cobertura.xml` en `backend/TestResults/`.

## 2.2 Frontend: Vitest y Testing Library

**Qué es:** Vitest es el ejecutor de pruebas nativo de Vite (reutiliza su configuración); Testing Library permite renderizar componentes React y probarlos como los usaría el usuario.

**Pasos realizados:**
1. Instalación:
   ```powershell
   cd frontend
   npm install -D vitest@3 jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8@3
   ```
2. `frontend/vitest.config.ts`: combina `vite.config.ts` (alias `@`, plugin React) con el entorno `jsdom` y la cobertura.
3. `frontend/src/test/setup.ts`: carga los *matchers* de jest-dom (`toBeInTheDocument`, `toBeDisabled`) y limpia el DOM tras cada prueba.
4. Scripts en `package.json`: `"test": "vitest run"` y `"test:coverage": "vitest run --coverage"`.
5. Pruebas creadas:
   - `src/validations/schemas.test.ts` (4 pruebas): reglas de `loginSchema` y `userSchema` (correo válido, contraseña mínima de 6, nombre/apellido mínimos).
   - `src/components/Pagination.test.tsx` (3 pruebas): rango "11–20 de 25 registros", botones deshabilitados en los extremos y llamada a `onPageChange(2)`.

**Resultado:** `npm run test` → `Test Files 2 passed, Tests 7 passed`. `npm run build` sigue compilando (el `tsc` del build también revisa las pruebas).

## 2.3 GitHub Actions: integración continua (`.github/workflows/ci.yml`)

**Qué es:** servicio de automatización de GitHub que ejecuta *workflows* (archivos YAML) en servidores de GitHub cuando ocurre un evento en el repositorio. Gratis para repositorios públicos.

**Por qué:** cubre construcción, test, liberación e implementación con un mismo formato y sin servidor propio.

El workflow **CI** se ejecuta en cada `push`, `pull_request` o manualmente (`workflow_dispatch`) y tiene tres jobs:

| Job | Pasos |
|---|---|
| `backend` | `setup-dotnet 10.0.x` → `dotnet restore` → `dotnet build -c Release` → `dotnet test` con cobertura y logger `trx` → sube `backend/TestResults` como artefacto |
| `frontend` | `setup-node 22` con caché npm → `npm ci` → `npm run lint` → `npm run test:coverage` → `npm run build` → sube `frontend/coverage` como artefacto |
| `docker` | (si los anteriores pasan) copia `.env.example` a `.env` y ejecuta `docker compose build` para validar los Dockerfiles |

**Cómo ver la evidencia:** GitHub → pestaña **Actions** → workflow *CI* → ejecución → descargar artefactos `backend-test-results` y `frontend-coverage`.
