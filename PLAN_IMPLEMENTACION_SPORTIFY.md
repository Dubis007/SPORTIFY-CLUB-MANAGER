# PLAN MAESTRO DE IMPLEMENTACIÓN, TRAZABILIDAD Y CONTINUIDAD — SPORTIFY CLUB MANAGER

> **Única fuente de verdad operativa** para la ejecución autónoma, trazabilidad de requerimientos, gobernanza de decisiones de negocio, verificación mediante pruebas automatizadas y control de commits del repositorio `SPORTIFY-CLUB-MANAGER`.

---

## A. Contexto y fuentes

### 1. Fuentes documentales obligatorias revisadas íntegramente
1. **`Sportify_Contraste_Videos_vs_Estado_Actual.docx`** (*Informe de Contraste de Requerimientos (Video 1 y Video 2) vs. Estado Actual de Sportify — Fase 3, 25 de octubre de 2026*):
   - Catálogo de brechas reales `GAP-001` a `GAP-010` y criterios verificables de cierre.
   - Hoja de ruta priorizada `TAREA-P0-01` a `TAREA-P4-01` (Prioridad 0 a Prioridad 4).
   - Gobernanza de decisiones de negocio `DEC-001` a `DEC-010` y verificación técnica `VER-TEC-001`.
2. **`InventarioConsolidado_AnalsisComparacion.docx`** (*SPORTIFY-CLUB-MANAGER — Fase 3 (Entregable 1): Verificación de Fuentes, Inventario Consolidado y Comparación de Videos — 29 de octubre de 2026*):
   - **27 Requerimientos Funcionales**: `VID1-RF-001` a `VID1-RF-017` (17 RF, plataforma *Controla Club*, 07:44 min, `EV-01`..`EV-24`) y `VID2-RF-001` a `VID2-RF-010` (10 RF, plataforma *VeloClubTech / Club Correcaminos*, 04:13 min, `VID2-EVT-001`..`VID2-EVT-019`).
   - **10 Requerimientos No Funcionales**: `VID1-RNF-001` a `VID1-RNF-005` y `VID2-RNF-001` a `VID2-RNF-005`.
   - **Agrupadores de equivalencia**: `GRP-RF-01` a `GRP-RF-08` y `GRP-RNF-01` a `GRP-RNF-03`.
   - **Reglas de negocio, criterios y dudas**: `VID1-RN-001`..`012`, `VID2-RN-001`..`008`, `CA-001`..`017`, `VID2-CA-001`..`010`, `VID1-DU-001`..`014`, `VID2-DU-001`..`008`.
   - **Comparaciones explícitas**: `CMP-01` a `CMP-08`.
3. **Documentación interna del repositorio contrastada**:
   - `README.md`, `docs/requisitos/RF_catalogo.md` (`RF-01`..`RF-13`), `docs/requisitos/reglas_negocio.md` (`RN-01`..`RN-10`), `docs/requisitos/matriz_requisitos_modulos.md`, `docs/arquitectura/decision_tecnica.md` y `docs/base-datos/modelo_datos.md`.

### 2. Objetivo y restricciones operativas
- **Objetivo**: Contrastar la documentación funcional con el código real del repositorio, implementar de forma incremental todas las tareas aprobadas, técnicamente habilitadas y verificables sin bloquear el avance por decisiones externas pendientes, validar cada entrega con compilación limpia y pruebas automatizadas, y registrar un commit **Conventional Commit en español** independiente por cada funcionalidad completada a través del motor Git de **GitHub Desktop**.
- **Restricciones estrictas**:
  - No inventar aprobaciones de producto sobre `DEC-001` a `DEC-010` cuando no exista evidencia verificable en el repositorio.
  - No implementar módulos periféricos de sobre-alcance solo por aparecer en los videos (CMS web, red social, chatbot IA, pizarras vectoriales 2D, biometría física, menú radial móvil no aprobado).
  - No ejecutar despliegues remotos ni `git push`, no alterar bases de datos de producción, no eliminar migraciones ni usar comandos Git destructivos (`git reset --hard`, `git clean -fd`).
  - No exponer secretos, credenciales ni enviar mensajes reales por WhatsApp o pasarelas de cobro.

### 3. Criterio de resolución y registro de discrepancias documentales detectadas
Se conserva intacta la nomenclatura original de ambas fuentes (`VID1-*`, `VID2-*`, `GRP-*`, `CMP-*`, `GAP-*`, `DEC-*`, `TAREA-*`) y la evidencia del código fuente real prevalece únicamente para diagnosticar el **estado actual implementado**:

1. **Discrepancia Documental DISC-01 (`ReceiptService.cs` vs. `ReportService.cs`)**:
   - *Procedencia*: `Sportify_Contraste_Videos_vs_Estado_Actual.docx` (Secciones 2, 7, 8, 9 y 14) afirma preliminarmente por nombre de archivo que `ReceiptService.cs` genera recibos PDF, aunque en `VER-TEC-001` solicita inspeccionar su contenido real.
   - *Hallazgo en código*: `backend/Sportify.Infrastructure/Storage/ReceiptService.cs` únicamente almacena y lee archivos adjuntos subidos por el usuario (`ComprobantePago` vía `IFileStorageService`), sin usar QuestPDF. La generación real de PDFs con QuestPDF reside en `ReportService.cs` para 4 reportes tabulares agregados (`payments/pdf`, `members/pdf`, `locations/pdf`, `performance/pdf`), careciendo hasta ahora de una colilla/comprobante PDF individual por pago.
2. **Discrepancia Documental DISC-02 (Rango de agrupadores `GRP-RF-*` en Documento 2)**:
   - *Procedencia*: En `InventarioConsolidado_AnalsisComparacion.docx` (Sección 2, párrafo introductorio) el texto menciona *"GRP-RF-01 a GRP-RF-07"*, pero las Tablas 2.1 y 2.3 definen formalmente hasta **`GRP-RF-08`** (*Reportes y Analíticas*, agrupando `VID1-RF-008` y `VID2-RF-010`).
   - *Resolución*: Se conservan íntegros los 8 agrupadores reales `GRP-RF-01` a `GRP-RF-08` y `GRP-RNF-01` a `GRP-RNF-03`.
3. **Discrepancia Documental DISC-03 (Borradores tempranos en `docs/` vs. Arquitectura Real)**:
   - *Procedencia*: `docs/arquitectura/decision_tecnica.md` y `docs/base-datos/modelo_datos.md` (borradores de septiembre 2026) mencionan Blazor Server, PostgreSQL y claves `UUID`, mientras que `README.md` y todo el código fuente real implementan **ASP.NET Core .NET 10 + EF Core MySQL (`int` PK) + React 19 / TypeScript + 2 microservicios Node/TS**. Se respeta estrictamente la arquitectura real vigente.

---

## B. Estado inicial del proyecto

### 1. Estado inicial de Git
- **Directorio raíz**: `C:\Users\duvan\Documents\nuevas_tecnologias_2026\PROYECTO\SPORTIFY-CLUB-MANAGER`
- **Rama activa**: `Requerimientos_en_Automatico` (sincronizada con `origin/Requerimientos_en_Automatico`)
- **Commit `HEAD` inicial**: `e7c3007d9d6f98f8a866e3dbf2ec19632fe7e8c7` (`Merge remote-tracking branch 'origin/Ciclo_Vida_DevOps' into Rendimiento_Admin_Frontend`)
- **Árbol de trabajo (`git status`)**: Limpio (`nothing to commit, working tree clean`), sin cambios ajenos pendientes.

### 2. Arquitectura y stack tecnológico verificado
- **Backend Core (`backend/`)**: Solución .NET (`net10.0`) estructurada en 4 capas + proyecto de pruebas:
  - `Sportify.Domain`: 14 entidades (`Asistencia`, `Competencia`, `ComprobantePago`, `Entrenamiento`, `EvaluacionCompetencia`, `InscripcionCompetencia`, `Membresia`, `Pago`, `PasswordResetToken`, `PlanMembresia`, `Rol`, `Sede`, `Usuario`, `UsuarioRol`) y 3 enums (`EstadoInscripcion`, `EstadoMembresia`, `EstadoPago`).
  - `Sportify.Application`: 10 servicios de aplicación, 24 interfaces y DTOs parciales.
  - `Sportify.Infrastructure`: `SportifyDbContext` (`MySql.EntityFrameworkCore 10.0.0-rc`), 9 repositorios, `JwtTokenService`, `FileStorageService`, `ReceiptService`, más 2 servicios mal ubicados (`MembershipService` y `ReportService` con `QuestPDF 2026.8.0`).
  - `Sportify.Api`: 15 controladores REST con autenticación JWT Bearer y políticas por rol (`ADMIN`, `CONTADOR`, `ENTRENADOR`, `MIEMBRO`), `/api/health`, rate limiting y cabeceras de seguridad.
  - `Sportify.Tests`: xUnit (`2.9.3`) + Moq (`4.20.72`).
- **Microservicios Nativos (`backend/microservice/`, Cero Docker)**:
  - `microservicio1` (`:5101`): Validación criptográfica HMAC-SHA256 de JWT, normalización de claims XML de ASP.NET Core y auditoría/revocación en memoria de sesiones concurrentes (`máx. 2`), usando `zod` y `tsx`.
  - `microservicio2` (`:5102`): Agregador analítico asíncrono y cálculo de KPIs ejecutivos con `zod`. **Defecto detectado en inspección**: invoca `GET /api/dashboard/metrics` en `Sportify.Api`, ruta inexistente (solo existe `GET /api/dashboard/stats`), cayendo siempre en `ANALYTICAL_CACHE`.
- **Frontend (`frontend/`)**: React `19.2.0` + TypeScript `5.7` + Vite `6.4` + Tailwind CSS `3.4` + React Hook Form + Zod + Recharts + Axios + Vitest `3.2.7`, organizado bajo arquitectura MVVM (`models/`, `services/`, `viewmodels/`, `pages/`, `layouts/EnterpriseErpLayout.tsx`).

### 3. Línea base de compilación y pruebas antes de modificar código
| Verificación Base | Comando Ejecutado | Resultado Real |
| :--- | :--- | :--- |
| Compilación Backend .NET 10 | `dotnet build backend/Sportify.Api/Sportify.Api.csproj` | **OK** — 0 errores, 0 advertencias |
| Pruebas Unitarias Backend | `dotnet test backend/Sportify.Tests/Sportify.Tests.csproj` | **OK** — 3/3 aprobadas (`PaymentServiceTests`) |
| Tipado Frontend TypeScript | `npm --prefix frontend run typecheck` | **OK** — 0 errores |
| Pruebas Unitarias Frontend | `npm --prefix frontend run test` | **OK** — 2 suites, 7/7 aprobadas (`schemas.test.ts`, `Pagination.test.tsx`) |
| Tipado Microservicios TS | `npm --prefix backend/microservice run typecheck` | **OK** — 0 errores (0 pruebas automatizadas existentes) |

### 4. Resolución de `VER-TEC-001` y resumen de brechas confirmadas en código
- **`VER-TEC-001` (Completada por inspección directa)**:
  1. `microservicio1` y `microservicio2` contienen lógica real en TypeScript con validación Zod (no son stubs vacíos), pero carecen de pruebas automatizadas y `microservicio2` apunta a un endpoint inexistente (`/api/dashboard/metrics`).
  2. `ReceiptService.cs` solo gestiona carga/lectura de soportes subidos (`ComprobantePago`), no emite colillas PDF; `ReportService.cs` usa QuestPDF para reportes tabulares y presenta codificación ANSI/Latin-1 en lugar de UTF-8 limpio (al igual que `ReportsController.cs`).
  3. `Asistencia.cs` solo posee `bool Presente` y `string? Observaciones` (sin enum de 4 estados); `Usuario.cs` no posee `FechaNacimiento`, `TipoDocumento`, `NumeroDocumento`, `Genero`, `Talla` ni campos médicos (`EPS`, `RH`, `Alergias`).
  4. El frontend cuenta con estados de carga tipo skeleton/spinner parciales en algunas vistas bajo `EnterpriseErpLayout.tsx`.
- **Deuda arquitectónica confirmada (`GAP-010`)**:
  - `MembershipService` y `ReportService` viven en `Sportify.Infrastructure` inyectando `SportifyDbContext` directamente.
  - `DashboardController` en `Sportify.Api` inyecta `SportifyDbContext` directamente.
  - 6 controladores exponen o reciben entidades de `Sportify.Domain.Entities` directamente sin DTOs (`CompetitionsController`, `EvaluationsController`, `LocationsController`, `MembershipPlansController`, `RegistrationsController`, `TrainingsController`).
  - `AdminPaymentsPage.tsx` reutiliza `useAccountantViewModel.ts` porque no existe `useAdminPaymentsViewModel.ts`.
  - Cobertura de pruebas crítica pero mínima (solo 1 archivo de tests en backend, 2 en frontend y 0 en microservicios).

---

## C. Inventario maestro de implementación

> **Convención de estados**:
> - `- [x]`: Tarea implementada al 100%, verificada con compilación y pruebas automatizadas, y confirmada con su commit independiente.
> - `- [ ] [EJECUTABLE]`: Tarea técnicamente habilitada y dentro del alcance aprobado, lista para ejecución autónoma en esta sesión.
> - `- [ ] [BLOQUEADA: DEC-XXX]`: Tarea detenida porque exige una elección de negocio o cambio de esquema irreversible pendiente de aprobación del responsable del producto.
> - `- [ ] [FUERA DE ALCANCE MVP / BLOQUEADA: DEC-010]`: Módulo periférico de alta complejidad observado en los videos sin autorización de incorporación al MVP.

### Prioridad 0 — Gobernanza, Trazabilidad y Verificación Inicial

- [x] **TAREA-P0-01** — *Prioridad 0 | Gobernanza, Trazabilidad y Verificación Técnica Inicial*
  - **Requerimientos y brechas**: Transversal a los 27 RF (`VID1-RF-001`..`017`, `VID2-RF-001`..`010`), 10 RNF (`VID1-RNF-001`..`005`, `VID2-RNF-001`..`005`), `GRP-RF-01`..`08`, `GRP-RNF-01`..`03`, `CMP-01`..`08`, `GAP-001`..`010`, `VER-TEC-001`, `DEC-001`..`010`.
  - **Descripción**: Ejecutar la auditoría real del código (`VER-TEC-001`), contrastar todas las fuentes contra el repositorio real, documentar estado de decisiones `DEC-001`..`DEC-010` sin inventar aprobaciones y establecer `PLAN_IMPLEMENTACION_SPORTIFY.md` como fuente única de seguimiento.
  - **Estado actual comprobado**: Completada la inspección integral del repositorio, microservicios, línea base de pruebas y contraste documental.
  - **Dependencias**: Ninguna.
  - **Archivos a crear/modificar**:
    - `PLAN_IMPLEMENTACION_SPORTIFY.md`
  - **Criterios de aceptación**:
    1. Los 27 RF, 10 RNF, `GRP-*`, `CMP-01`..`08`, `GAP-001`..`010` y `DEC-001`..`010` están trazados con sus IDs originales intactos.
    2. `VER-TEC-001` queda resuelta con hallazgos verificados en el código real.
  - **Pruebas a ejecutar**: Verificación de estado limpio de Git y validación de línea base (`dotnet test`, `vitest run`, `tsc --noEmit`).
  - **Commit propuesto**: `docs(plan): crea el plan maestro de implementación y trazabilidad de Sportify`

---

### Prioridad 1 — Correcciones Estructurales y Funcionales Críticas

- [x] **TAREA-P1-01A** — *Prioridad 1 | Arquitectura Backend (Clean Architecture & Codificación UTF-8)*
  - **Requerimientos y brechas**: `GAP-010`, `VER-TEC-001` (soporte estructural para `VID1-RF-001`, `VID1-RF-008`, `VID2-RF-010`, `VID1-RF-015`).
  - **Descripción**: Reubicar `MembershipService` y `ReportService` desde `Sportify.Infrastructure` hacia `Sportify.Application/Services/`, extrayendo el acceso a datos a repositorios dedicados (`IMembershipRepository` / `MembershipRepository`, `IReportRepository` / `ReportRepository`) y el renderizado QuestPDF a un adaptador (`IPdfReportRenderer` / `QuestPdfReportRenderer` en `Infrastructure`), y extraer la lógica de `DashboardController` hacia `IDashboardService` / `DashboardService` + `IDashboardRepository` / `DashboardRepository`. Normalizar `ReportService` y `ReportsController` a UTF-8 limpio.
  - **Estado actual comprobado**: `MembershipService.cs` y `ReportService.cs` están en `Sportify.Infrastructure` acoplados a `SportifyDbContext`; `DashboardController.cs` consulta `SportifyDbContext` directamente.
  - **Dependencias**: `TAREA-P0-01`. Sin bloqueo de negocio.
  - **Archivos a crear/modificar**:
    - `backend/Sportify.Application/Interfaces/IMembershipRepository.cs` (nuevo)
    - `backend/Sportify.Application/Interfaces/IReportRepository.cs` (nuevo)
    - `backend/Sportify.Application/Interfaces/IPdfReportRenderer.cs` (nuevo)
    - `backend/Sportify.Application/Interfaces/IDashboardRepository.cs` (nuevo)
    - `backend/Sportify.Application/Interfaces/IDashboardService.cs` (nuevo)
    - `backend/Sportify.Application/DTOs/Reports/ReportDataDtos.cs` (nuevo)
    - `backend/Sportify.Application/Services/MembershipService.cs` (nuevo, reubicado)
    - `backend/Sportify.Application/Services/ReportService.cs` (nuevo, reubicado)
    - `backend/Sportify.Application/Services/DashboardService.cs` (nuevo)
    - `backend/Sportify.Application/DependencyInjection.cs`
    - `backend/Sportify.Infrastructure/Repositories/MembershipRepository.cs` (nuevo)
    - `backend/Sportify.Infrastructure/Repositories/ReportRepository.cs` (nuevo)
    - `backend/Sportify.Infrastructure/Repositories/DashboardRepository.cs` (nuevo)
    - `backend/Sportify.Infrastructure/Reports/QuestPdfReportRenderer.cs` (nuevo)
    - `backend/Sportify.Infrastructure/Reports/ReportService.cs` (eliminado tras reubicación)
    - `backend/Sportify.Infrastructure/Services/MembershipService.cs` (eliminado tras reubicación)
    - `backend/Sportify.Infrastructure/DependencyInjection.cs`
    - `backend/Sportify.Api/Controllers/DashboardController.cs`
    - `backend/Sportify.Api/Controllers/ReportsController.cs`
  - **Criterios de aceptación**:
    1. `MembershipService`, `ReportService` y `DashboardService` residen en `Sportify.Application/Services/` sin referencia alguna a `Sportify.Infrastructure` ni `SportifyDbContext`.
    2. `DashboardController` consume `IDashboardService` y no inyecta `SportifyDbContext`.
    3. La solución compila con 0 errores y 0 advertencias, conservando intactos los contratos HTTP existentes.
  - **Pruebas a ejecutar**: `dotnet build backend/Sportify.Api/Sportify.Api.csproj` y `dotnet test backend/Sportify.Tests/Sportify.Tests.csproj`.
  - **Commit propuesto**: `refactor(arquitectura): reubica servicios en aplicación y desacopla acceso a datos`

- [x] **TAREA-P1-01B** — *Prioridad 1 | API y Contratos DTO en los 6 Módulos Restantes*
  - **Requerimientos y brechas**: `GAP-010` (transversal a Sedes `VID2-RF-009`, Planes `VID1-RF-015`, Entrenamientos `VID1-RF-003`/`007`, Competencias `VID1-RF-006`, Inscripciones y Evaluaciones `VID1-RF-010`).
  - **Descripción**: Crear los DTOs tipados faltantes en `Sportify.Application/DTOs/` para los 6 módulos que aún exponen entidades de dominio (`Locations`, `MembershipPlans`, `Trainings`, `Competitions`, `Registrations`, `Evaluations`) y refactorizar sus interfaces de servicio, servicios y controladores para eliminar toda exposición directa de `Sportify.Domain.Entities` en `Sportify.Api/Controllers/`, manteniendo compatibilidad JSON 100% con el frontend React.
  - **Estado actual comprobado**: `CompetitionsController`, `EvaluationsController`, `LocationsController`, `MembershipPlansController`, `RegistrationsController` y `TrainingsController` reciben o retornan entidades de dominio directamente; `LocationDto` vive dentro de `ILocationRepository.cs` y `MarkAttendanceDto` vive dentro de `TrainingsController.cs`.
  - **Dependencias**: `TAREA-P1-01A`. Sin bloqueo de negocio.
  - **Archivos a crear/modificar**:
    - `backend/Sportify.Application/DTOs/Locations/LocationDtos.cs` (nuevo)
    - `backend/Sportify.Application/DTOs/MembershipPlans/MembershipPlanDtos.cs` (nuevo)
    - `backend/Sportify.Application/DTOs/Trainings/TrainingDtos.cs` (nuevo)
    - `backend/Sportify.Application/DTOs/Competitions/CompetitionDtos.cs` (nuevo)
    - `backend/Sportify.Application/DTOs/Registrations/RegistrationDtos.cs` (nuevo)
    - `backend/Sportify.Application/DTOs/Evaluations/EvaluationDtos.cs` (nuevo)
    - `backend/Sportify.Application/Interfaces/ILocationRepository.cs`
    - `backend/Sportify.Application/Interfaces/ILocationService.cs`
    - `backend/Sportify.Application/Interfaces/IMembershipPlanService.cs`
    - `backend/Sportify.Application/Interfaces/ITrainingService.cs`
    - `backend/Sportify.Application/Interfaces/ICompetitionService.cs`
    - `backend/Sportify.Application/Interfaces/IRegistrationService.cs`
    - `backend/Sportify.Application/Interfaces/IEvaluationService.cs`
    - `backend/Sportify.Application/Services/LocationService.cs`
    - `backend/Sportify.Application/Services/MembershipPlanService.cs`
    - `backend/Sportify.Application/Services/TrainingService.cs`
    - `backend/Sportify.Application/Services/CompetitionService.cs`
    - `backend/Sportify.Application/Services/RegistrationService.cs`
    - `backend/Sportify.Application/Services/EvaluationService.cs`
    - `backend/Sportify.Infrastructure/Repositories/LocationRepository.cs`
    - `backend/Sportify.Api/Controllers/LocationsController.cs`
    - `backend/Sportify.Api/Controllers/MembershipPlansController.cs`
    - `backend/Sportify.Api/Controllers/TrainingsController.cs`
    - `backend/Sportify.Api/Controllers/CompetitionsController.cs`
    - `backend/Sportify.Api/Controllers/RegistrationsController.cs`
    - `backend/Sportify.Api/Controllers/EvaluationsController.cs`
  - **Criterios de aceptación**:
    1. Ningún controlador en `backend/Sportify.Api/Controllers/` importa `Sportify.Domain.Entities` ni `Sportify.Infrastructure`.
    2. Los payloads JSON de entrada/salida conservan los nombres de campos consumidos por `frontend/src/services/`.
    3. Compilación limpia en backend y frontend.
  - **Pruebas a ejecutar**: `dotnet build`, `dotnet test` y `npm --prefix frontend run typecheck`.
  - **Commit propuesto**: `refactor(api): desacopla los seis controladores restantes mediante contratos DTO`

- [x] **TAREA-P1-01C** — *Prioridad 1 | Arquitectura MVVM Frontend (`useAdminPaymentsViewModel`)*
  - **Requerimientos y brechas**: `GAP-010`, `VID1-RNF-001` (consistencia MVVM en administración de pagos).
  - **Descripción**: Crear el ViewModel dedicado `frontend/src/viewmodels/useAdminPaymentsViewModel.ts` para gestionar estado, filtros, paginación, resumen financiero, aprobación/rechazo de pagos y previsualización de comprobantes en la vista administrativa, actualizando `AdminPaymentsPage.tsx` para desacoplarla de `useAccountantViewModel.ts`.
  - **Estado actual comprobado**: `AdminPaymentsPage.tsx` importa `useAccountantViewModel` directamente; `useAdminPaymentsViewModel.ts` no existe.
  - **Dependencias**: Ninguna.
  - **Archivos a crear/modificar**:
    - `frontend/src/viewmodels/useAdminPaymentsViewModel.ts` (nuevo)
    - `frontend/src/pages/admin/AdminPaymentsPage.tsx`
    - `frontend/src/viewmodels/useAdminPaymentsViewModel.test.ts` (nuevo)
  - **Criterios de aceptación**:
    1. `AdminPaymentsPage.tsx` utiliza exclusivamente `useAdminPaymentsViewModel`.
    2. Pruebas unitarias en Vitest validan carga inicial, filtrado, aprobación, rechazo y manejo de errores del ViewModel.
  - **Pruebas a ejecutar**: `npm --prefix frontend run typecheck` y `npm --prefix frontend run test`.
  - **Commit propuesto**: `refactor(pagos): incorpora useAdminPaymentsViewModel en la vista administrativa`

- [x] **TAREA-P1-02** — *Prioridad 1 | Módulo de Asistencia de 4 Estados (`Presente`, `Ausente`, `Tarde`, `Excusa`) y Comentarios Opcionales*
  - **Requerimientos y brechas**: `VID1-RF-003`, `VID2-RF-004`, `VID2-RNF-003`, `GRP-RF-05`, `CMP-01`, `GAP-002` (Reglas: `VID1-RN-003`, `VID1-RN-011`, `VID2-RN-004`, `VID2-RN-005`; Criterios: `CA-003`, `VID2-CA-004`).
  - **Descripción**: Incorporar enum `EstadoAsistencia` (`PRESENTE`, `AUSENTE`, `TARDE`, `EXCUSA`) en `Sportify.Domain`, evolucionar `Asistencia.cs` manteniendo sincronizado `bool Presente` (`true` en `PRESENTE` y `TARDE`) para métricas de actividad, habilitar comentarios opcionales (`Observaciones`), bloqueo de edición cuando la sesión está `CERRADO`, actualización optimista instantánea (`<100ms`) con contadores en vivo en `TrainingsPage.tsx` y visualización de los 4 estados + comentario en `MemberDashboard.tsx`.
  - **Estado actual comprobado**: Implementado al 100%, verificado con `TrainingServiceTests` y `TrainingsPage.test.tsx`.
  - **Dependencias**: **`DEC-003` resuelta por definición explícita del usuario** (estados `Presente`, `Ausente`, `Tarde`, `Excusa` con comentarios opcionales).
  - **Archivos creados/modificados**: `backend/Sportify.Domain/Enums/EstadoAsistencia.cs`, `backend/Sportify.Domain/Entities/Asistencia.cs`, `backend/Sportify.Infrastructure/Persistence/SportifyDbContext.cs`, `backend/Sportify.Api/Program.cs`, `backend/Sportify.Application/DTOs/Trainings/TrainingDtos.cs`, `backend/Sportify.Application/Interfaces/ITrainingService.cs`, `backend/Sportify.Application/Services/TrainingService.cs`, `backend/Sportify.Api/Controllers/TrainingsController.cs`, `backend/Sportify.Application/DTOs/MemberProfile/MemberProfileDtos.cs`, `backend/Sportify.Application/Services/MemberProfileService.cs`, `backend/Sportify.Infrastructure/Repositories/MemberProfileRepository.cs`, `backend/Sportify.Tests/Services/TrainingServiceTests.cs`, `frontend/src/models/index.ts`, `frontend/src/services/trainings/trainingService.ts`, `frontend/src/pages/admin/TrainingsPage.tsx`, `frontend/src/pages/admin/TrainingsPage.test.tsx`, `frontend/src/pages/member/MemberDashboard.tsx`.
  - **Criterios de aceptación**: Persistir los 4 estados (`PRESENTE`, `AUSENTE`, `TARDE`, `EXCUSA`) y comentarios opcionales, recalcular contadores en cliente de forma inmediata y bloquear cambios tras cierre de sesión.
  - **Pruebas ejecutadas**: `dotnet test` (41/41 aprobadas) y `vitest run` (16/16 aprobadas).
  - **Commit**: `feat(asistencia): incorpora estados presente, ausente, tarde y excusa con comentarios opcionales`

- [x] **TAREA-P1-03A** — *Prioridad 1 | Emisión de Colilla / Comprobante PDF Individual de Pago mediante QuestPDF*
  - **Requerimientos y brechas**: Base verificable sin bloqueo de `VID1-RF-001` y `VID2-RF-006`, `GAP-005`, `VER-TEC-001` (`DISC-01`).
  - **Descripción**: Implementar la generación real de una colilla/comprobante PDF oficial por pago individual (`GET /api/reports/payments/{id:int}/voucher-pdf`) usando QuestPDF, incluyendo encabezado institucional del club, estado semáforo del pago (`APROBADO`, `PENDIENTE`, `RECHAZADO`), datos del socio, plan de membresía, monto en COP, fecha, referencia/código de verificación e instrucciones institucionales de pago, integrando su descarga/visualización en `AdminPaymentsPage.tsx` y `AccountantDashboard.tsx` mediante `PdfViewerModal.tsx`. *(El envío automático o manual por WhatsApp permanece separado en `TAREA-P1-03B` bloqueado por `DEC-001`)*.
  - **Estado actual comprobado**: `ReceiptService.cs` solo devuelve el archivo adjunto subido por el miembro (`ComprobantePago`), y `ReportService.cs` solo genera reportes globales tabulares, sin existir colilla PDF individual de un pago.
  - **Dependencias**: `TAREA-P1-01A`, `TAREA-P1-01C`. No altera esquema de BD ni asume `DEC-001`/`DEC-002`.
  - **Archivos a crear/modificar**:
    - `backend/Sportify.Application/DTOs/Reports/ReportDataDtos.cs`
    - `backend/Sportify.Application/Interfaces/IReportRepository.cs`
    - `backend/Sportify.Application/Interfaces/IPdfReportRenderer.cs`
    - `backend/Sportify.Application/Interfaces/IReportService.cs`
    - `backend/Sportify.Application/Services/ReportService.cs`
    - `backend/Sportify.Infrastructure/Repositories/ReportRepository.cs`
    - `backend/Sportify.Infrastructure/Reports/QuestPdfReportRenderer.cs`
    - `backend/Sportify.Api/Controllers/ReportsController.cs`
    - `frontend/src/services/api/paymentService.ts`
    - `frontend/src/viewmodels/useAdminPaymentsViewModel.ts`
    - `frontend/src/viewmodels/useAccountantViewModel.ts`
    - `frontend/src/pages/admin/AdminPaymentsPage.tsx`
    - `frontend/src/pages/accountant/AccountantDashboard.tsx`
  - **Criterios de aceptación**:
    1. `GET /api/reports/payments/{id}/voucher-pdf` retorna `application/pdf` válido (`%PDF-...`) con estado semáforo, datos del socio, plan y monto, o `404` si el pago no existe.
    2. El administrador y el contador pueden abrir/descargar la colilla PDF generada para cualquier pago registrado.
  - **Pruebas a ejecutar**: `dotnet test` validando generación de bytes `%PDF` y caso inexistente (`404`/null), más `vitest run` y `tsc --noEmit`.
  - **Commit propuesto**: `feat(recibos): genera colilla PDF individual de pago mediante QuestPDF`

- [ ] [DESCARTADA EN COBRANZA: DEC-002 · DIFERIDA EN WHATSAPP: DEC-001] **TAREA-P1-03B** — *Prioridad 1 | Rediseño del Motor de Cobranza (Tarifa General 1-28, Lote Mensual, Abonos Parciales y Despacho WhatsApp)*
  - **Decisión del 2026-11-11**: el responsable del producto definió que el pago es único y total. No habrá abonos parciales, tarifa general ni lote mensual, y el envío por WhatsApp no se aborda por ahora. La parte de cobranza queda descartada y el despacho por WhatsApp queda diferido (ver Sección G).
  - **Requerimientos y brechas**: `VID1-RF-001`, `VID1-RF-002`, `VID2-RF-005`, `VID2-RF-006`, `VID1-RNF-005`, `GRP-RF-03`, `GRP-RF-04`, `CMP-02`, `CMP-03`, `GAP-003`, `GAP-005` (Reglas: `VID1-RN-001`, `VID1-RN-002`, `VID1-RN-006`, `VID1-RN-010`, `VID2-RN-006`, `VID2-RN-007`; Criterios: `CA-001`, `CA-002`, `VID2-CA-005`, `VID2-CA-006`; Dudas: `VID1-DU-001`, `VID1-DU-003`, `VID2-DU-003`, `VID2-DU-004`).
  - **Descripción**: Rediseñar el flujo transaccional de `Pago.cs` para definir si el club opera con suscripción a `PlanMembresia` + `Otros Cargos` + `Abonos Parciales` con barra de progreso (Video 1), con `Tarifa General` masiva (día 1-28 solo para `'Sin configurar'`) + generación masiva bloqueada (Video 2), manteniendo o reemplazando el rol `CONTADOR` actual (`RN-04`/`RN-05`), e integrar envío por WhatsApp (API oficial Meta/Twilio con bandeja `'Chats de WhatsApp'` vs enlace manual `wa.me`).
  - **Estado actual comprobado**: Sportify implementa pago manual único por membresía con aprobación/rechazo obligatorio por `CONTADOR`/`ADMIN`, sin abonos parciales, sin tarifa general día 1-28 ni integración WhatsApp.
  - **Dependencias**: **Bloqueada por `DEC-001` (`CMP-03`) y `DEC-002` (`CMP-02`)**.
  - **Archivos potencialmente afectados**: `backend/Sportify.Domain/Entities/Pago.cs`, `backend/Sportify.Domain/Entities/Membresia.cs`, `backend/Sportify.Application/Services/PaymentService.cs`, `frontend/src/pages/admin/AdminPaymentsPage.tsx`, `frontend/src/pages/accountant/AccountantDashboard.tsx`.
  - **Criterios de aceptación**: Sujetos a la definición aprobada en `DEC-001` y `DEC-002`.
  - **Pruebas a ejecutar**: Pruebas transaccionales en `Sportify.Tests` y `Vitest`.
  - **Commit propuesto**: `feat(cobranza): implementa motor de facturación periódica, abonos y despacho WhatsApp`

---

### Prioridad 2 — Nuevas Funcionalidades y Ampliaciones de Módulos

- [ ] [BLOQUEADA: DEC-004, DEC-008] **TAREA-P2-01** — *Prioridad 2 | Configuración General del Club, 12 Temas, Sedes con Departamento → Municipio y GPS Clima*
  - **Requerimientos y brechas**: `VID1-RF-016`, `VID2-RF-009`, `VID1-RNF-003` (logo `<=2MB`), `VID2-RNF-004` (conmutador claro/oscuro), `GRP-RF-06`, `GRP-RNF-03`, `CMP-04`, `GAP-009` (Regla: `VID2-RN-008`; Criterios: `CA-016`, `VID2-CA-009`; Dudas: `VID1-DU-007`, `VID2-DU-008`).
  - **Descripción**: Crear entidad de configuración maestra del club (datos institucionales, logotipo `<=2MB`, departamento base, 12 temas cromáticos / conmutador claro-oscuro) y ampliar `Sede.cs` y `LocationsPage.tsx` con validación condicional Departamento → Municipio y selector GPS en mapa para pronóstico de clima.
  - **Estado actual comprobado**: No existe entidad `Club` ni `SettingsPage.tsx`; `Sede.cs` tiene `Nombre`, `Ciudad`, `Direccion`, `Telefono`, `Activa` sin departamento, municipio dependiente ni coordenadas GPS; el frontend usa tema oscuro fijo Enterprise ERP.
  - **Dependencias**: `TAREA-P1-01B`; **Bloqueada por `DEC-004` y `DEC-008`** (alcance de GPS/clima en sedes, jerarquía de sedes y temas visuales frente al estándar Enterprise ERP vigente).
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo` (nuevas entidades/migraciones `ConfiguracionClub` y columnas en `Sede.cs`, `LocationsPage.tsx`).
  - **Criterios de aceptación**: Bloqueo de municipio si no hay departamento configurado, validación de logo `<=2MB` y persistencia de parámetros aprobados.
  - **Pruebas a ejecutar**: Pruebas de validación en `Sportify.Tests` y `Vitest`.
  - **Commit propuesto**: `feat(configuracion): agrega ajustes institucionales del club y validación geográfica de sedes`

- [ ] [BLOQUEADA: DEC-004] **TAREA-P2-02** — *Prioridad 2 | Módulo de Grupos y Categorías Deportivas con Control de Aforo, Horarios, Edad y Dorsales*
  - **Requerimientos y brechas**: `VID1-RF-014`, `VID2-RF-003`, `GRP-RF-06`, `CMP-04`, `GAP-001` (Regla: `VID2-RN-004`; Criterios: `CA-014`, `VID2-CA-003`; Dudas: `VID1-DU-012`, `VID2-DU-002`).
  - **Descripción**: Modelar y persistir la jerarquía de `Grupo` / `Categoría` deportiva (deporte, nivel, rango de edad, horario, entrenador asignado, cupo máximo, cálculo de `%` de ocupación, dorsales) y habilitar el filtrado multicriterio de asistencia por día, sede/grupo y categoría de edad de la A a la Z.
  - **Estado actual comprobado**: No existen las entidades `Grupo.cs` ni `Categoria.cs` en `Sportify.Domain/Entities/`.
  - **Dependencias**: `TAREA-P2-01`; **Bloqueada por `DEC-004` (`CMP-04`)** — contradicción estructural en el modelo de dominio entre Video 1 (`Grupo` como eje principal y `Sede` como etiqueta) y Video 2 (`Sede` como división formativa principal subdividida en catálogo fijo de categorías de edad).
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo` (nuevas entidades EF Core, migraciones MySQL, controladores y páginas de Grupos/Asistencia).
  - **Criterios de aceptación**: CRUD de grupos con barra de ocupación (`ocupados/cupo`) y filtro alfabético por sede y categoría.
  - **Pruebas a ejecutar**: Pruebas de dominio/servicio en `Sportify.Tests` y componentes en `Vitest`.
  - **Commit propuesto**: `feat(grupos): incorpora gestión de grupos deportivos con control de aforo y categorías`

- [ ] [BLOQUEADA: DEC-005, DEC-008] **TAREA-P2-03** — *Prioridad 2 | Planes de Acceso Limitados por Cupo de Entradas vs. Ilimitados*
  - **Requerimientos y brechas**: `VID1-RF-015`, `VID1-RN-007`, `GAP-003` (Criterio: `CA-015`; Dudas: `VID1-DU-005`, `VID1-DU-008`, `VID1-DU-009`).
  - **Descripción**: Extender `PlanMembresia.cs` y `Membresia.cs` para diferenciar planes ilimitados de planes limitados por bolsa de entradas (ej. `5/12 entradas`), descontando entradas consumidas al registrar asistencia, y definir exclusión/inclusión de submódulos de Inventario e Ingreso Físico biométrico/QR.
  - **Estado actual comprobado**: `PlanMembresia.cs` solo define `DuracionDias` y `PrecioCOP`; no existe bolsa de entradas ni submódulos de inventario o acceso físico.
  - **Dependencias**: `TAREA-P1-02`; **Bloqueada por `DEC-005` y `DEC-008`** (regla crítica de negocio sobre si `'Justificada / Excusa médica'` o `'Tarde'` descuentan entrada del paquete y exclusión de inventario/biometría).
  - **Archivos potencialmente afectados**: `backend/Sportify.Domain/Entities/PlanMembresia.cs`, `backend/Sportify.Domain/Entities/Membresia.cs`, `backend/Sportify.Application/Services/MembershipService.cs`, `frontend/src/pages/admin/PlansPage.tsx`, `frontend/src/pages/admin/MembershipsPage.tsx`.
  - **Criterios de aceptación**: Conteo exacto de entradas consumidas/contratadas conforme a la regla de descuento aprobada.
  - **Pruebas a ejecutar**: Pruebas unitarias de consumo de entradas en `Sportify.Tests`.
  - **Commit propuesto**: `feat(planes): implementa control de cupo de entradas consumidas en membresías`

- [ ] [BLOQUEADA: DEC-006] **TAREA-P2-04** — *Prioridad 2 | Preinscripción Pública Autoservicio por Enlace, Adjuntos 15 MB, Estatutos y Alta Multirrol*
  - **Requerimientos y brechas**: `VID1-RF-004`, `VID2-RF-002` (asistente modal con 7 tipos de documento e invitación por link), `VID1-RNF-003` (`<=15MB`), `VID1-RNF-004` (ofuscación de enlaces públicos), `GRP-RF-02`, `CMP-05`, `GAP-004` (Reglas: `VID1-RN-004`, `VID2-RN-003`; Criterios: `CA-004`, `VID2-CA-002`; Dudas: `VID1-DU-002`, `VID2-DU-001`).
  - **Descripción**: Construir flujo público sin login con token ofuscado por grupo, captura de acudiente para menores de edad, carga de documentos PDF/JPG/PNG `<=15MB`, aceptación obligatoria de estatutos PDF, bandeja administrativa `Pendientes/Aprobados/Rechazados` y definición de coexistencia con el asistente modal de alta con 7 tipos de documento (`CC`, `TI`, `RC`, `CE`, `PA`, `NIT`, `Otro`).
  - **Estado actual comprobado**: No existe ruta pública de admisión ni entidad de solicitud de matrícula (`Registrations` es exclusivamente `InscripcionCompetencia` para torneos internos); `Usuario.cs` no almacena tipo/número de documento ni datos de acudiente.
  - **Dependencias**: `TAREA-P2-02`; **Bloqueada por `DEC-006` (`CMP-05`)**.
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo` (nueva entidad `SolicitudPreinscripcion`, almacenamiento de adjuntos de 15 MB, rutas públicas en `AppRoutes.tsx` y bandeja de admisiones).
  - **Criterios de aceptación**: Radicación pública sin login con token ofuscado, validación `<=15MB`, obligatoriedad de acudiente en menores y aprovisionamiento de usuario al aprobar.
  - **Pruebas a ejecutar**: Pruebas de integración/servicio en `Sportify.Tests` y formulario público en `Vitest`.
  - **Commit propuesto**: `feat(admisiones): incorpora formulario público de preinscripción y bandeja de aprobación`

- [x] **TAREA-P2-05A** — *Prioridad 2 | Calendario Mensual y de Lista Unificado de Entrenamientos y Competencias*
  - **Requerimientos y brechas**: Núcleo aprobado y sin bloqueo de `VID1-RF-005` y `VID2-RF-008`, `VID1-RNF-005` (exportación a Google Calendar), `VID2-RNF-005` (estados vacíos amigables), `VID1-RNF-002` / `VID2-RNF-001` (diseño responsivo), `GRP-RF-07`, `GAP-006` (Regla: `VID1-RN-005`; Criterios: `CA-005` parcial sin WhatsApp, `VID2-CA-008`).
  - **Descripción**: Construir el módulo unificado de Calendario (`CalendarPage.tsx` + `useCalendarViewModel.ts`) accesible para `ADMIN`, `ENTRENADOR` y `MIEMBRO`, integrando en una cuadrícula mensual interactiva y vista de lista todos los `Entrenamientos` (azul institucional) y `Competencias` (rojo/coral), con panel de eventos del día seleccionado y de todo el mes, modal de detalle del evento, enlace directo `"Añadir a Google Calendar"` y estados vacíos amigables cuando un día o mes no registra eventos (`VID2-RNF-005`). *(El despacho de recordatorios por WhatsApp queda separado y bloqueado por `DEC-001`)*.
  - **Estado actual comprobado**: `TrainingsPage.tsx` y `CompetitionsPage.tsx` existen como tablas CRUD separadas; no existe vista ni ruta de Calendario unificado.
  - **Dependencias**: `TAREA-P1-01B`. No requiere cambios destructivos de esquema ni depende de `DEC-001` o `DEC-007`.
  - **Archivos a crear/modificar**:
    - `frontend/src/viewmodels/useCalendarViewModel.ts` (nuevo)
    - `frontend/src/pages/common/CalendarPage.tsx` (nuevo)
    - `frontend/src/pages/common/CalendarPage.test.tsx` (nuevo)
    - `frontend/src/routes/AppRoutes.tsx`
    - `frontend/src/layouts/AdminLayout/index.tsx`
    - `frontend/src/layouts/CoachLayout/index.tsx`
    - `frontend/src/layouts/MemberLayout/index.tsx`
  - **Criterios de aceptación**:
    1. Renderiza cuadrícula mensual navegable entre meses y vista de lista, diferenciando visualmente `Competencias` (rojo) y `Entrenamientos` (azul).
    2. Al seleccionar un día muestra sus eventos y los eventos del mes, presentando estados vacíos explícitos (`"Sin eventos en el día seleccionado"` / `"Sin eventos programados este mes"`) cuando no hay registros.
    3. Permite abrir el detalle de un evento y generar enlace válido de Google Calendar.
  - **Pruebas a ejecutar**: `npm --prefix frontend run typecheck` y `npm --prefix frontend run test` (`CalendarPage.test.tsx`).
  - **Commit propuesto**: `feat(calendario): incorpora vista mensual unificada de entrenamientos y competencias`

- [ ] [BLOQUEADA: DEC-007] **TAREA-P2-05B** — *Prioridad 2 | Ampliación de Ficha Médica (EPS, RH, Alergias, IMC, Enlace Público) y Antropometría en cm*
  - **Requerimientos y brechas**: `VID1-RF-010`, `VID1-RF-017`, `VID1-RNF-004` (enlace público ofuscado), `CMP-08`, `GAP-007` (Regla: `VID1-RN-010`; Criterios: `CA-010`, `CA-017`; Duda: `VID1-DU-011`).
  - **Descripción**: Extender el perfil del deportista con expediente clínico (tipo de sangre RH, EPS, alergias, contacto de emergencia, peso, estatura, cálculo automático de IMC y enlace público) y definir la incorporación del módulo antropométrico de 6 pestañas con 4 curvas evolutivas de perímetros corporales en cm (brazo, muslo y pantorrilla izq/der).
  - **Estado actual comprobado**: `EvaluacionCompetencia.cs` solo evalúa desempeño técnico/táctico/físico en competencias; `Usuario.cs` y `MemberProfileDtos.cs` carecen de atributos médicos, antropométricos y ruta pública.
  - **Dependencias**: **Bloqueada por `DEC-007` (`CMP-08`)** — requiere confirmación expresa del modelo clínico/antropométrico en BD y de las implicaciones de privacidad de exponer datos médicos sensibles en un enlace público sin autenticación (`VID1-DU-011`).
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo` (nuevas entidades `FichaMedica`, `MedicionAntropometrica`, migraciones EF Core, `MemberProfileService.cs`, `EvaluationsPage.tsx`).
  - **Criterios de aceptación**: Cálculo automático de IMC con categoría OMS y curvas evolutivas según alcance aprobado en `DEC-007`.
  - **Pruebas a ejecutar**: Pruebas unitarias de cálculo de IMC y series en `Sportify.Tests` y `Vitest`.
  - **Commit propuesto**: `feat(perfil): agrega ficha médica con cálculo de IMC y seguimiento antropométrico`

- [x] **TAREA-P2-06A** — *Prioridad 2 | Analítica Financiera de 12 Meses, Alertas Accionables, Prevención `0/0` y Sincronización `microservicio2`*
  - **Requerimientos y brechas**: Núcleo verificable sin bloqueo de `VID1-RF-008`, `VID2-RF-010`, `VID2-RNF-005` (prevención división por cero `0% / 0 de 0` y estados vacíos), `GRP-RF-08`, `CMP-07`, `GAP-008`, `VER-TEC-001` (Regla: `VID1-RN-008`; Criterios: `CA-008`, `VID2-CA-010`).
  - **Descripción**: Ampliar `DashboardStatsDto` y `DashboardService` (conservando compatibilidad hacia atrás) con:
    1. Serie histórica anual de facturación aprobada de **12 meses** (`IngresosUltimos12Meses`).
    2. Cálculo seguro de tasa de pagos/membresías al día (`TasaMembresiasAlDiaPct`, retornando `0%` cuando `TotalMiembros == 0` para prevenir errores de división `0/0`, `VID2-RNF-005`).
    3. **Alertas accionables** (`AlertasAccionables`): miembros activos sin asistencia registrada en los últimos 21 días (`>3 semanas`, `VID1-RF-008`), membresías que vencen en los próximos 7 días, membresías vencidas/en mora y pagos pendientes de revisión.
    4. Exponer `GET /api/dashboard/metrics` (o alinear contrato con `microservicio2`) para corregir el fallo detectado en `VER-TEC-001` donde `microservicio2` siempre caía en caché estática.
    5. Actualizar `DashboardPage.tsx` para visualizar la tendencia anual de 12 meses, el porcentaje al día con protección `0/0` y el panel de alertas accionables.
  - **Estado actual comprobado**: `DashboardController` solo calcula 6 meses (`MesesSerie = 6`), no genera alertas accionables de inasistencia/vencimiento, no calcula tasa porcentual protegida contra `0/0`, y `microservicio2` falla al consultar `/api/dashboard/metrics`.
  - **Dependencias**: `TAREA-P1-01A`. No requiere cambios de esquema en BD ni depende de `DEC-009` (el widget de cumpleaños y banners comerciales permanecen separados en `TAREA-P2-06C`).
  - **Archivos a crear/modificar**:
    - `backend/Sportify.Application/DTOs/Dashboard/DashboardStatsDto.cs`
    - `backend/Sportify.Application/Interfaces/IDashboardRepository.cs`
    - `backend/Sportify.Application/Interfaces/IDashboardService.cs`
    - `backend/Sportify.Application/Services/DashboardService.cs`
    - `backend/Sportify.Infrastructure/Repositories/DashboardRepository.cs`
    - `backend/Sportify.Api/Controllers/DashboardController.cs`
    - `backend/microservice/microservicio2/microservicio.ts`
    - `frontend/src/models/index.ts`
    - `frontend/src/pages/admin/DashboardPage.tsx`
  - **Criterios de aceptación**:
    1. `GET /api/dashboard/stats` retorna la serie cronológica completa de 12 meses, `TasaMembresiasAlDiaPct` libre de `NaN`/`DivideByZeroException` cuando hay 0 miembros, y las alertas accionables calculadas desde BD.
    2. `GET /api/dashboard/metrics` responde con las métricas esperadas por `microservicio2`.
    3. `DashboardPage.tsx` renderiza la tendencia de 12 meses, el KPI de `% al día` y las alertas accionables con estados vacíos claros.
  - **Pruebas a ejecutar**: `dotnet test` (incluyendo caso de BD con 0 miembros para verificar prevención `0/0`), `npm --prefix backend/microservice run typecheck`, `npm --prefix frontend run typecheck` y `npm --prefix frontend run test`.
  - **Commit propuesto**: `feat(analitica): incorpora tendencia anual de 12 meses, alertas accionables y protección 0/0`

- [x] **TAREA-P2-06B** — *Prioridad 2 | Directorio de Usuarios/Miembros con Contadores por Rol, Filtros Combinables, Skeleton Loading y Exportación Excel/CSV*
  - **Requerimientos y brechas**: Núcleo verificable sin cambio de esquema de `VID1-RF-013`, `VID2-RF-002` (contadores por rol), `VID1-RNF-001` (skeleton loading), `GRP-RF-02`, `GAP-008` (Regla: `VID1-RN-008`; Criterios: `CA-013` parcial en campos existentes, `VID2-CA-002` en contadores).
  - **Descripción**: Incorporar en el directorio (`UsersPage.tsx` + `useUsersViewModel.ts` + endpoint de exportación en `ReportsController` / utilidad de descarga):
    1. Tarjetas de contadores segmentados por rol y distinción cuentas totales vs. miembros deportivos activos/inactivos (`Total Usuarios`, `Deportistas / Miembros`, `Entrenadores`, `Contadores`, `Administradores`).
    2. Filtros combinables sobre los atributos existentes verificados en el dominio (búsqueda por nombre/correo, rol, estado activo/inactivo y sede).
    3. Skeleton loading pulsante durante transiciones asíncronas (`VID1-RNF-001`).
    4. Exportación directa del padrón filtrado en formato compatible con Microsoft Excel (`.csv` UTF-8 con BOM / endpoint de exportación). *(Los filtros de `talla`, `género` y `tipo de documento` que exigen nuevas columnas en `Usuario.cs` permanecen documentados bajo `DEC-006`)*.
  - **Estado actual comprobado**: `UsersPage.tsx` lista usuarios paginados pero carece de tarjetas de contadores por rol, separación estadística Usuarios vs. Miembros y botón de descarga compatible con Excel.
  - **Dependencias**: `TAREA-P1-01A`. No altera esquema MySQL ni asume `DEC-006`.
  - **Archivos a crear/modificar**:
    - `frontend/src/viewmodels/useUsersViewModel.ts`
    - `frontend/src/pages/admin/UsersPage.tsx`
    - `frontend/src/pages/admin/UsersPage.test.tsx` (nuevo)
  - **Criterios de aceptación**:
    1. Muestra contadores exactos por rol y estado activo/inactivo de miembros deportivos.
    2. Permite combinar filtros de rol, estado, sede y búsqueda textual, mostrando skeletons durante la carga.
    3. Exporta los registros filtrados en archivo `.csv` con BOM UTF-8 legible directamente en Excel con columnas acentuadas correctas.
  - **Pruebas a ejecutar**: `npm --prefix frontend run typecheck` y `npm --prefix frontend run test` (`UsersPage.test.tsx`).
  - **Commit propuesto**: `feat(miembros): agrega contadores por rol, filtros combinables y exportación para Excel`

- [x] **TAREA-P2-06C** — *Prioridad 2 | Fecha de Nacimiento, Próximos Cumpleaños con Días Faltantes y Avisos en Calendario*
  - **Requerimientos y brechas**: `VID2-RF-001`, `VID1-RF-005`, `VID2-RF-008`, `GRP-RF-01`, `GRP-RF-07`, `CMP-07`, `GAP-006`, `GAP-008` (Reglas: `VID2-RN-001`, `VID2-RN-002`; Criterio: `VID2-CA-001`; Dudas: `VID2-DU-005`, `VID2-DU-007`).
  - **Descripción**: Añadir campo opcional `FechaNacimiento` a `Usuario.cs` con actualización idempotente en MySQL (`Program.cs`), endpoints `GET /api/users/birthdays` y `PATCH /api/profile/birth-date`, cálculo exacto de próximo cumpleaños y días faltantes (incluyendo cruce de año diciembre → enero y años bisiestos 29-Feb → 28-Feb), banner de aviso de próximos cumpleaños (ventana de 30 días) + eventos de cumpleaños directamente en `CalendarPage.tsx` y tarjeta resumen en `DashboardPage.tsx`, descartando la barra comercial de trial SaaS y banners publicitarios del Video 2.
  - **Estado actual comprobado**: Implementado al 100%, verificado con `UserServiceTests` y `CalendarPage.test.tsx`.
  - **Dependencias**: **`DEC-009` resuelta por definición explícita del usuario** (`fecha de cumpleaños próximo con aviso en calendario`).
  - **Archivos creados/modificados**: `backend/Sportify.Domain/Entities/Usuario.cs`, `backend/Sportify.Application/DTOs/Users/UpcomingBirthdayDto.cs`, `backend/Sportify.Application/DTOs/Users/UserDto.cs`, `backend/Sportify.Application/DTOs/Users/CreateUserDto.cs`, `backend/Sportify.Application/DTOs/Users/UpdateUserDto.cs`, `backend/Sportify.Application/DTOs/MemberProfile/MemberProfileDtos.cs`, `backend/Sportify.Application/Interfaces/IUserService.cs`, `backend/Sportify.Application/Services/UserService.cs`, `backend/Sportify.Application/Interfaces/IMemberProfileService.cs`, `backend/Sportify.Application/Services/MemberProfileService.cs`, `backend/Sportify.Api/Controllers/UsersController.cs`, `backend/Sportify.Api/Controllers/ProfileController.cs`, `backend/Sportify.Api/Program.cs`, `backend/Sportify.Tests/Services/UserServiceTests.cs`, `frontend/src/models/index.ts`, `frontend/src/services/users/userService.ts`, `frontend/src/services/members/memberService.ts`, `frontend/src/viewmodels/useMemberViewModel.ts`, `frontend/src/viewmodels/useCalendarViewModel.ts`, `frontend/src/pages/common/CalendarPage.tsx`, `frontend/src/pages/common/CalendarPage.test.tsx`, `frontend/src/pages/admin/UsersPage.tsx`, `frontend/src/pages/admin/DashboardPage.tsx`, `frontend/src/pages/member/MemberDashboard.tsx`.
  - **Criterios de aceptación**: Cálculo exacto de días faltantes (incluyendo hoy `0 días`, cruce de año y 29 de febrero), aviso destacado de próximos cumpleaños en Calendario y marcación en celdas mensuales y agenda.
  - **Pruebas ejecutadas**: `dotnet test` (42/42 aprobadas) y `vitest run` (17/17 aprobadas).
  - **Commit**: `feat(cumpleanos): agrega fecha de nacimiento y avisos de próximos cumpleaños en calendario`

---

### Prioridad 3 — Validación Técnica y Suite Integral de Pruebas Automatizadas

- [x] **TAREA-P3-01A** — *Prioridad 3 | Ampliación Integral de Pruebas Unitarias Backend (`Sportify.Tests`)*
  - **Requerimientos y brechas**: `GAP-010`, validación transversal de reglas de negocio `RN-01`..`RN-10`, autenticación, usuarios, sedes, planes, membresías, pagos, entrenamientos/asistencia, competencias, inscripciones (`RN-03` bloqueo por morosidad/sin membresía activa), evaluaciones, dashboard (prevención `0/0` y serie de 12 meses) y reportes/colillas QuestPDF (`%PDF`).
  - **Descripción**: Crear suites completas de pruebas unitarias con xUnit y Moq en `backend/Sportify.Tests/Services/` cubriendo los servicios de aplicación que hoy tienen 0 pruebas (11 servicios adicionales a `PaymentServiceTests`).
  - **Estado actual comprobado**: Solo existe `PaymentServiceTests.cs` con 3 pruebas en todo el backend.
  - **Dependencias**: `TAREA-P1-01A`, `TAREA-P1-01B`, `TAREA-P1-03A`, `TAREA-P2-06A`.
  - **Archivos a crear/modificar**:
    - `backend/Sportify.Tests/Services/AuthServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/UserServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/LocationServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/MembershipPlanServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/MembershipServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/TrainingServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/CompetitionServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/RegistrationServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/EvaluationServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/DashboardServiceTests.cs` (nuevo)
    - `backend/Sportify.Tests/Services/ReportServiceTests.cs` (nuevo)
  - **Criterios de aceptación**:
    1. Todos los servicios críticos de `Sportify.Application` cuentan con pruebas unitarias verificando casos exitosos, reglas de negocio y rechazos/excepciones.
    2. `ReportServiceTests` verifica que tanto los reportes tabulares como la colilla PDF individual generan bytes PDF reales con cabecera `%PDF`.
    3. 100% de pruebas aprobadas en `dotnet test` con 0 advertencias de compilación.
  - **Pruebas a ejecutar**: `dotnet test backend/Sportify.Tests/Sportify.Tests.csproj`.
  - **Commit propuesto**: `test(backend): amplía cobertura de pruebas unitarias en servicios de aplicación y reportes PDF`

- [x] **TAREA-P3-01B** — *Prioridad 3 | Pruebas Automatizadas de Microservicios Node/TS (`microservicio1` y `microservicio2`)*
  - **Requerimientos y brechas**: `GAP-010`, `VER-TEC-001`.
  - **Descripción**: Incorporar pruebas automatizadas ejecutables con el runner nativo `node:test` + `tsx` (sin añadir dependencias externas innecesarias) en `backend/microservice/`, validando en `microservicio1` la verificación criptográfica HMAC-SHA256 de JWT, detección de expiración, autorización por rol, normalización de claims de ASP.NET Core y revocación de sesiones concurrentes (`>2`), y en `microservicio2` la validación estricta de esquemas Zod, agregación financiera y cálculo de KPIs ejecutivos.
  - **Estado actual comprobado**: `backend/microservice/` tiene `0` pruebas automatizadas y carece de script `test` en `package.json`.
  - **Dependencias**: `TAREA-P2-06A`.
  - **Archivos a crear/modificar**:
    - `backend/microservice/package.json`
    - `backend/microservice/tests/microservicio1.test.ts` (nuevo)
    - `backend/microservice/tests/microservicio2.test.ts` (nuevo)
  - **Criterios de aceptación**:
    1. `npm --prefix backend/microservice run test` ejecuta todas las pruebas de `microservicio1` y `microservicio2` con 100% de éxito.
    2. `npm --prefix backend/microservice run typecheck` finaliza con 0 errores.
  - **Pruebas a ejecutar**: `npm --prefix backend/microservice run test` y `npm --prefix backend/microservice run typecheck`.
  - **Commit propuesto**: `test(microservicios): incorpora pruebas automatizadas para validación JWT, sesiones y reportes Zod`

---

### Prioridad 4 — Funcionalidades Opcionales o Ampliaciones Fuera del MVP Aprobado (`TAREA-P4-01`)

> Conforme a las Secciones 4.D y 6, estos módulos de alta complejidad observados en los videos **se conservan trazados con sus identificadores originales** pero **no se implementan sin aprobación expresa (`DEC-010`)** para evitar sobre-alcance no autorizado.

- [ ] [FUERA DE ALCANCE MVP / BLOQUEADA: DEC-010] **TAREA-P4-01A** — *Prioridad 4 | Pizarra Táctica 2D de Partido, Alineaciones y Bitácora Minuto a Minuto (`VID1-RF-006`)*
  - **Requerimientos y brechas**: `VID1-RF-006`, `CMP-08` (Reglas: `VID1-RN-006`, `VID1-RN-009`; Criterio: `CA-006`; Dudas: `VID1-DU-006`, `VID1-DU-012`).
  - **Estado actual comprobado**: Existen `Competencia.cs` y `EvaluacionCompetencia.cs`; no existe cancha 2D interactiva ni bitácora cronológica de goles/tarjetas ni cargo automático de `$50` por convocatoria.
  - **Dependencias**: **Bloqueada por `DEC-010`**.
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo`.
  - **Criterios de aceptación / Pruebas / Commit propuesto**: Sujetos a aprobación expresa de alcance en `DEC-010` (`feat(competencias): incorpora pizarra táctica 2D y bitácora minuto a minuto`).

- [ ] [FUERA DE ALCANCE MVP / BLOQUEADA: DEC-010] **TAREA-P4-01B** — *Prioridad 4 | Sesiones de Entrenamiento en 3 Fases (Inicial, Central, Final), Estado Borrador y Pizarra Vectorial 2D (`VID1-RF-007`)*
  - **Requerimientos y brechas**: `VID1-RF-007`, `CMP-08` (Reglas: `VID1-RN-005`, `VID1-RN-012`; Criterio: `CA-007`; Duda: `VID1-DU-012`).
  - **Estado actual comprobado**: `Entrenamiento.cs` registra sesiones planas sin división en 3 fases cronometradas, sin estado `'Borrador'` oculto ni lienzo vectorial 2D con coordenadas X/Y.
  - **Dependencias**: **Bloqueada por `DEC-010`**.
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo`.
  - **Criterios de aceptación / Pruebas / Commit propuesto**: Sujetos a aprobación en `DEC-010` (`feat(entrenamientos): agrega planificación por fases y lienzo táctico vectorial`).

- [ ] [FUERA DE ALCANCE MVP / BLOQUEADA: DEC-010] **TAREA-P4-01C** — *Prioridad 4 | Constructor CMS No-Code de Sitio Web Institucional del Club (`VID1-RF-009`)*
  - **Requerimientos y brechas**: `VID1-RF-009`, `VID1-RNF-002` (conmutador de previsualización Desktop/Mobile en CMS), `CMP-08` (Regla: `VID1-RN-009`; Criterio: `CA-009`; Duda: `VID1-DU-004`).
  - **Estado actual comprobado**: No implementado en el repositorio ni contemplado en `docs/requisitos/RF_catalogo.md`.
  - **Dependencias**: **Bloqueada por `DEC-010`**.
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo`.
  - **Criterios de aceptación / Pruebas / Commit propuesto**: Sujetos a aprobación en `DEC-010` (`feat(cms): incorpora constructor de sitio web institucional del club`).

- [ ] [FUERA DE ALCANCE MVP / BLOQUEADA: DEC-010] **TAREA-P4-01D** — *Prioridad 4 | Red Social Deportiva `'Social Controla'` (`VID1-RF-011`)*
  - **Requerimientos y brechas**: `VID1-RF-011`, `CMP-08` (Criterio: `CA-011`; Duda: `VID1-DU-013`).
  - **Estado actual comprobado**: No implementado en el repositorio ni contemplado en `docs/requisitos/RF_catalogo.md`.
  - **Dependencias**: **Bloqueada por `DEC-010`**.
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo`.
  - **Criterios de aceptación / Pruebas / Commit propuesto**: Sujetos a aprobación en `DEC-010` (`feat(social): incorpora muro comunitario deportivo del club`).

- [ ] [FUERA DE ALCANCE MVP / BLOQUEADA: DEC-010] **TAREA-P4-01E** — *Prioridad 4 | Asistente Virtual Flotante con IA `'Controli'` (`VID1-RF-012`)*
  - **Requerimientos y brechas**: `VID1-RF-012`, `CMP-08` (Criterio: `CA-012`).
  - **Estado actual comprobado**: No implementado en el repositorio.
  - **Dependencias**: **Bloqueada por `DEC-010`**.
  - **Archivos potencialmente afectados**: `Por determinar tras inspección del módulo`.
  - **Criterios de aceptación / Pruebas / Commit propuesto**: Sujetos a aprobación en `DEC-010` (`feat(soporte): incorpora asistente flotante de ayuda interactiva`).

- [ ] [FUERA DE ALCANCE MVP / BLOQUEADA: DEC-010] **TAREA-P4-01F** — *Prioridad 4 | Barra Inferior Móvil con Menú Radial Flotante `'+'` y Loader de Marca `'VC'` (`VID2-RF-007`, `VID2-RNF-002`)*
  - **Requerimientos y brechas**: `VID2-RF-007`, `VID2-RNF-001`, `VID2-RNF-002`, `GRP-RNF-01`, `GRP-RNF-02`, `CMP-06` (Criterio: `VID2-CA-007`; Duda: `VID2-DU-007`).
  - **Estado actual comprobado**: Sportify implementa `EnterpriseErpLayout.tsx` con barra lateral izquierda unificada y skeletons (alineado con `VID1-RNF-001` y la refactorización Enterprise ERP previa del proyecto).
  - **Dependencias**: **Bloqueada por `DEC-010` / `CMP-06`**.
  - **Archivos potencialmente afectados**: `frontend/src/layouts/EnterpriseErpLayout.tsx`.
  - **Criterios de aceptación / Pruebas / Commit propuesto**: Sujetos a decisión expresa sobre navegación híbrida en `CMP-06` / `DEC-010` (`feat(navegacion): agrega menú radial flotante para resoluciones móviles`).

---

## D. Hoja de ruta priorizada

1. **Prioridad 0 — Gobernanza y Verificación (`TAREA-P0-01`)**: Completada la inspección de código (`VER-TEC-001`), trazabilidad de los 27 RF y 10 RNF, y clasificación rigurosa de `DEC-001`..`DEC-010`.
2. **Prioridad 1 — Saneamiento Arquitectónico y Entregables Críticos Habilitados**:
   - Ejecutar `TAREA-P1-01A` (reubicación de `MembershipService`, `ReportService` y `DashboardService` a `Sportify.Application` con repositorios desacoplados).
   - Ejecutar `TAREA-P1-01B` (contratos DTO completos en los 6 controladores restantes).
   - Ejecutar `TAREA-P1-01C` (`useAdminPaymentsViewModel.ts` y pruebas Vitest).
   - Ejecutar `TAREA-P1-03A` (generación de colilla PDF individual de pago con QuestPDF y visor integrado).
   - Mantener `TAREA-P1-02` bloqueada por `DEC-003` y `TAREA-P1-03B` bloqueada por `DEC-001`/`DEC-002`.
3. **Prioridad 2 — Nuevas Funcionalidades Desacopladas de Decisiones Pendientes**:
   - Ejecutar `TAREA-P2-05A` (Calendario mensual/lista unificado de Entrenamientos y Competencias con exportación a Google Calendar y estados vacíos amigables).
   - Ejecutar `TAREA-P2-06A` (Tendencia anual de ingresos de 12 meses, alertas accionables de inasistencia/mora, protección contra división `0/0` y sincronización en vivo con `microservicio2`).
   - Ejecutar `TAREA-P2-06B` (Contadores por rol, filtros combinables con skeleton loading y exportación compatible con Excel en el directorio de miembros).
   - Mantener `TAREA-P2-01`..`P2-04`, `TAREA-P2-05B` y `TAREA-P2-06C` bloqueadas únicamente en los puntos que dependen de `DEC-004` a `DEC-009`.
4. **Prioridad 3 — Validación Técnica y Cobertura de Pruebas**:
   - Ejecutar `TAREA-P3-01A` (suite completa de pruebas unitarias xUnit en `Sportify.Tests` para los servicios de aplicación y generación PDF).
   - Ejecutar `TAREA-P3-01B` (suite de pruebas automatizadas en `backend/microservice/` para `microservicio1` y `microservicio2`).
5. **Prioridad 4 — Módulos Opcionales (`TAREA-P4-01A`..`F`)**:
   - Conservados bajo bloqueo `DEC-010` hasta definición formal de alcance post-MVP.

---

## E. Decisiones pendientes y bloqueos (`DEC-001` a `DEC-010`, `VER-TEC-001` y `CMP-01` a `CMP-08`)

### 1. Verificación técnica resuelta con evidencia en código
- **`VER-TEC-001`** (*Estado: **Resuelta con evidencia***):
  - *Verificación requerida*: Inspeccionar `microservicio1`, `microservicio2`, `ReceiptService.cs`, `Asistencia.cs`, `Entrenamiento.cs`, `EvaluacionCompetencia.cs` y estados de carga en `frontend/src/pages/`.
  - *Evidencia comprobada*: Ambos microservicios poseen implementación real con Zod (`:5101` JWT/sesiones y `:5102` analítica KPI, con bug de ruta `/api/dashboard/metrics` que se corrige en `TAREA-P2-06A`); `ReceiptService.cs` solo almacena archivos subidos mientras QuestPDF está en `ReportService.cs`; `Asistencia.cs` solo tiene `bool Presente` y `Observaciones`.

### 2. Decisiones de producto/negocio (`DEC-001` a `DEC-010`) y contradicciones (`CMP-01` a `CMP-08`)

#### `DEC-001` (Relacionada con `CMP-03`, `VID1-DU-001`, `VID2-DU-004`)
- **Pregunta concreta**: ¿El envío de colillas PDF y recordatorios de eventos por WhatsApp debe ser automático desatendido vía WhatsApp Business Cloud API / Twilio (con bandeja `'Chats de WhatsApp'` de solo lectura, Video 1) o mediante apertura manual de enlace `wa.me` tras registrar/descargar el comprobante (Video 2)?
- **Requerimientos afectados**: `VID1-RF-001`, `VID1-RF-005`, `VID2-RF-006`, `VID1-RNF-005`, `GRP-RF-03`.
- **Módulos y archivos potencialmente afectados**: `ReportService.cs`, `PaymentsController.cs`, `AdminPaymentsPage.tsx`, `CalendarPage.tsx`, variables de entorno en `appsettings.json` (y potencial nuevo microservicio o adaptador de mensajería).
- **Consecuencia técnica**: La API oficial exige cuenta Meta Business verificada, plantillas aprobadas, webhook público, costos por conversación y tabla de historial de mensajes; `wa.me` no requiere infraestructura pagada pero no puede adjuntar binarios PDF automáticamente sin URL firmada pública ni ofrece bandeja de chats automatizada.
- **Evidencia en el repositorio**: No existen credenciales de Meta/Twilio en `appsettings.json` ni mención a WhatsApp API en `docs/requisitos/RF_catalogo.md` (`RF-01`..`RF-13`).
- **Recomendación técnica razonada**: Emitir la colilla PDF individual con QuestPDF ya mismo (`TAREA-P1-03A`, sin bloqueo) y, para el MVP académico/operativo sin costos recurrentes, adoptar en una siguiente iteración enlaces `wa.me` con mensaje prellenado + descarga/URL firmada temporal del PDF, dejando WhatsApp Cloud API como adaptador opcional.
- **Estado**: **Diferida por instrucción del usuario (2026-11-11)**: el envío por WhatsApp no se implementa por ahora. Deja de bloquear trabajo en curso; `TAREA-P1-03B` queda sin ejecutar.

#### `DEC-002` (Relacionada con `CMP-02`, `VID1-DU-003`, `VID2-DU-003`, `VID2-DU-004`)
- **Pregunta concreta**: ¿Cuál es el modelo transaccional definitivo de cobranza: combinar `Tarifa General` masiva (día 1-28 para socios `'Sin configurar'`) y generación por lote mensual (Video 2) con `Abonos Parciales` acumulativos, barra de progreso y `Otros Cargos` (Video 1), conservando o eliminando la aprobación manual obligatoria del rol `CONTADOR` actual?
- **Requerimientos afectados**: `VID1-RF-002`, `VID2-RF-005`, `VID2-RF-006`, `GRP-RF-04`.
- **Módulos y archivos potencialmente afectados**: `Pago.cs`, `Membresia.cs`, `PlanMembresia.cs`, `PaymentService.cs`, `PaymentsController.cs`, `AdminPaymentsPage.tsx`, `AccountantDashboard.tsx`.
- **Consecuencia técnica**: Soportar abonos parciales y otros cargos requiere separar la entidad `ObligacionCobro` (deuda con saldo pendiente) de `AbonoPago` (transacción individual aprobada por Contador o caja directa), modificando migraciones MySQL y reportes financieros.
- **Evidencia en el repositorio**: `docs/requisitos/reglas_negocio.md` (`RN-04`, `RN-05`, `RN-08`) define explícitamente el rol `CONTADOR` y la validación manual de pagos (`PENDIENTE` → `APROBADO`/`RECHAZADO`), pero no arbitra entre Tarifa General (Video 2) y Abonos Parciales/Otros Cargos (Video 1).
- **Recomendación técnica razonada**: Conservar el rol `CONTADOR` (`RN-08`) e introducir una entidad `CargoFacturable` (generable en lote mensual o como otro cargo) asociada a `1..N` registros `Pago` (abonos) cuyo saldo se descuente al pasar a `APROBADO`.
- **Estado**: **Resuelta por instrucción del usuario (2026-11-11)**: el pago es único y total, sin abonos parciales, tarifa general ni lote mensual. Se conserva la aprobación manual por `CONTADOR` o `ADMIN`. La parte de cobranza de `TAREA-P1-03B` queda descartada.

#### `DEC-003` (Relacionada con `CMP-01`, `VID1-RN-003`, `VID2-RN-004`, `VID2-RN-005`, `VID2-DU-006`)
- **Pregunta concreta**: ¿Cómo debe operar la pantalla de Asistencia: rotación táctil cíclica iniciando todos en `'Ausente'` (Video 2), tabla vertical con 4 botones separados, notas opcionales y alta de `'persona no registrada'` (Video 1), o vista dual conmutable? ¿Cuál será el nombre oficial del 4° estado (`'Justificada'` vs `'Excusa médica'`)?
- **Requerimientos afectados**: `VID1-RF-003`, `VID2-RF-004`, `VID2-RNF-003`, `GRP-RF-05`.
- **Módulos y archivos potencialmente afectados**: `Asistencia.cs`, nuevo `EstadoAsistencia.cs`, `TrainingService.cs`, `TrainingsPage.tsx`, `CoachDashboard.tsx`.
- **Consecuencia técnica**: Define los valores del enum persistido en MySQL y si abrir una sesión pre-inicializa a todos los inscritos como `AUSENTE` o permite estado sin marcar.
- **Evidencia en el repositorio**: `Asistencia.cs` tiene `bool Presente` y `string? Observaciones` (alineado parcialmente con el campo de notas del Video 1), sin enum de 4 estados.
- **Recomendación técnica razonada**: Definir `enum EstadoAsistencia { Ausente = 0, Presente = 1, Tarde = 2, Justificada = 3 }` (mostrando etiqueta `"Justificada / Excusa médica"`), conservar `Observaciones` y ofrecer conmutador UI Tabla (escritorio) / Tarjetas táctiles cíclicas `<100ms` (móvil).
- **Estado**: **Resuelta por instrucción del usuario (2026-11-01) / Implementada en `TAREA-P1-02`** (`Presente`, `Ausente`, `Tarde`, `Excusa` + comentarios opcionales).

#### `DEC-004` (Relacionada con `CMP-04`, `VID1-DU-012`, `VID2-DU-002`)
- **Pregunta concreta**: ¿Se confirma la jerarquía de dominio `Club -> Sede (lugar físico con municipio) -> Grupo/Categoría (división por edad/nivel con cupo máximo, horario, entrenador y dorsales)`?
- **Requerimientos afectados**: `VID1-RF-014`, `VID2-RF-003`, `VID2-RF-009`, `GRP-RF-06`.
- **Módulos y archivos potencialmente afectados**: `Sede.cs`, nueva entidad `GrupoDeportivo.cs`, `Usuario.cs`, `Entrenamiento.cs`, migraciones EF Core.
- **Consecuencia técnica**: Impacta claves foráneas entre sedes, grupos, deportistas y entrenamientos en `sportify_db`.
- **Evidencia en el repositorio**: `Sede.cs` modela ubicaciones físicas reales (`Nombre`, `Ciudad`, `Direccion`) y `Entrenamiento.cs` ya tiene `SedeId` y `EntrenadorId`, pero no existe `Grupo`.
- **Recomendación técnica razonada**: Mantener `Sede` como instalación física y agregar `GrupoDeportivo` con `SedeId`, `EntrenadorId`, `CupoMaximo`, `CategoriaEdad`, `Nivel` y tabla puente `GrupoMiembro` con `Dorsal`.
- **Estado**: **Pendiente / Bloquea `TAREA-P2-01` y `TAREA-P2-02`**. El 2026-11-11 el usuario indicó dejar la jerarquía sede/grupo en pendientes para abordarla más adelante.

#### `DEC-005` (Relacionada con `VID1-DU-005`)
- **Pregunta concreta**: En planes limitados por número de entradas/clases (ej. `12 entradas/mes`), ¿los estados `'Tarde'` y `'Justificada / Excusa médica'` descuentan una entrada del saldo del deportista o solo `'Presente'` y `'Tarde'`?
- **Requerimientos afectados**: `VID1-RF-003`, `VID1-RF-015`, `VID1-RN-007`.
- **Módulos y archivos potencialmente afectados**: `PlanMembresia.cs`, `Membresia.cs`, `TrainingService.cs`, `MembershipService.cs`.
- **Consecuencia técnica**: Condiciona la regla transaccional e idempotencia al editar asistencias pasadas para no descontar entradas por duplicado.
- **Evidencia en el repositorio**: `PlanMembresia.cs` actual solo controla vigencia por `DuracionDias` (`RN-02`), sin conteo de entradas.
- **Recomendación técnica razonada**: Descontar entrada únicamente cuando el estado sea `Presente` o `Tarde` (reintegrándola si se corrige a `Justificada`), calculando `EntradasConsumidas` dinámicamente o con ajuste idempotente.
- **Estado**: **Pendiente / Bloquea `TAREA-P2-03`**.

#### `DEC-006` (Relacionada con `CMP-05`, `VID1-DU-002`, `VID2-DU-001`, `VID1-DU-010`)
- **Pregunta concreta**: ¿Deben coexistir el alta administrativa directa (incorporando los 7 tipos de documento `CC/TI/RC/CE/PA/NIT/Otro` del Video 2, más género y talla del Video 1) y el formulario público de preinscripción sin login con adjuntos de `15 MB`, estatutos PDF y creación automática de cuenta al aprobar?
- **Requerimientos afectados**: `VID1-RF-004`, `VID1-RF-013`, `VID2-RF-002`, `VID1-RNF-003`, `VID1-RNF-004`, `GRP-RF-02`.
- **Módulos y archivos potencialmente afectados**: `Usuario.cs`, nueva entidad `SolicitudAdmision.cs`, `FileStorageService.cs`, `UsersController.cs`, `AppRoutes.tsx`, `UsersPage.tsx`.
- **Consecuencia técnica**: Define nuevas columnas obligatorias/opcionales en `Usuario`, límites de `RequestSizeLimit` (`15 MB` frente a los `5 MB` actuales de `RF-06`) y flujo de envío de credenciales iniciales.
- **Evidencia en el repositorio**: `RF-02` y `RN-01` restringen hoy el alta de usuarios a gestión interna administrativa, y `FileStorageService` está dimensionado para comprobantes de pago (`5 MB` según `RF-06`).
- **Recomendación técnica razonada**: Habilitar coexistencia creando tabla aislada `SolicitudPreinscripcion` con token público ofuscado y límite de `15 MB` solo en su endpoint dedicado, convirtiendo la solicitud en `Usuario` con rol `MIEMBRO` al aprobarla.
- **Estado**: **Pendiente / Bloquea `TAREA-P2-04` (y filtros por talla/género/documento)**.

#### `DEC-007` (Relacionada con `CMP-08`, `VID1-DU-011`)
- **Pregunta concreta**: ¿El módulo de perfil y evaluaciones debe incorporar expediente médico completo (`RH`, `EPS`, `Alergias`, `Contacto emergencia`, `IMC` automático, enlace público) y seguimiento antropométrico de perímetros en cm (4 gráficas evolutivas), además de `EvaluacionCompetencia`? ¿Se autoriza o prohíbe exponer datos médicos en enlace público sin login?
- **Requerimientos afectados**: `VID1-RF-010`, `VID1-RF-017`, `VID1-RNF-004`, `GAP-007`.
- **Módulos y archivos potencialmente afectados**: `MemberProfileDtos.cs`, `MemberProfileService.cs`, nuevas entidades `FichaMedica` y `MedicionAntropometrica`, `ProfileController.cs`, `EvaluationsPage.tsx`.
- **Consecuencia técnica**: Añade tablas clínicas sujetas a protección de datos sensibles de salud (Habeas Data / Ley 1581); publicar EPS/alergias en URL pública sin login representa riesgo de privacidad si no se acota qué campos son públicos.
- **Evidencia en el repositorio**: `EvaluacionCompetencia.cs` está orientada exclusivamente a torneos (`RF-11`); no existen campos clínicos en `Sportify.Domain`.
- **Recomendación técnica razonada**: Incorporar `FichaMedica` privada para `ADMIN`/`ENTRENADOR`/`MIEMBRO` titular con cálculo de IMC y tabla `MedicionAntropometrica` opcional, excluyendo datos clínicos sensibles de cualquier enlace público no autenticado.
- **Estado**: **Pendiente / Bloquea `TAREA-P2-05B`**.

#### `DEC-008` (Relacionada con `VID1-DU-008`, `VID1-DU-009`, `VID2-DU-008`)
- **Pregunta concreta**: ¿Quedan formalmente excluidos del alcance actual los submódulos periféricos de Tienda/Inventario, control físico biométrico por huella/torniquete y pronóstico meteorológico por coordenadas GPS en Sedes?
- **Requerimientos afectados**: `VID1-RF-015` (submódulos Inventario e Ingreso Físico), `VID2-RF-009` (GPS para clima).
- **Módulos y archivos potencialmente afectados**: `Sede.cs`, `LocationsPage.tsx` y potenciales módulos externos de hardware/POS/API meteorológica.
- **Consecuencia técnica**: Integrar lectores biométricos o APIs externas de clima introduce dependencias de hardware y claves de terceros ajenas al núcleo ERP.
- **Evidencia en el repositorio**: Ninguno de estos submódulos figura en `docs/requisitos/RF_catalogo.md` (`RF-01`..`RF-13`) ni fueron abiertos siquiera en los videos de referencia.
- **Recomendación técnica razonada**: Confirmar su exclusión formal del MVP y limitar `Sede` a datos administrativos y validación geográfica local.
- **Estado**: **Pendiente / Bloquea `TAREA-P2-01` y `TAREA-P2-03`**.

#### `DEC-009` (Relacionada con `CMP-07`, `VID2-DU-005`, `VID2-DU-007`)
- **Pregunta concreta**: ¿Con cuántos días de anticipación deben listarse los cumpleaños próximos en el Dashboard (ej. 30 días) tras añadir `FechaNacimiento` a `Usuario`, y se confirma el descarte de la barra de `'Periodo de prueba: 15 días'` y banners comerciales del Video 2?
- **Requerimientos afectados**: `VID2-RF-001`, `GRP-RF-01`, `GAP-008`.
- **Módulos y archivos potencialmente afectados**: `Usuario.cs`, `DashboardService.cs`, `DashboardPage.tsx`.
- **Consecuencia técnica**: Requiere migración en `Usuario` (`FechaNacimiento` nullable o requerida) y regla de ventana temporal.
- **Evidencia en el repositorio**: `Usuario.cs` no tiene `FechaNacimiento`; Sportify es el sistema propio del club (no un SaaS en trial comercial con publicidad de terceros).
- **Recomendación técnica razonada**: Añadir `DateOnly? FechaNacimiento` a `Usuario`, usar ventana configurable de `30 días` y descartar banners publicitarios y barra de trial SaaS.
- **Estado**: **Resuelta por instrucción del usuario (2026-11-01) / Implementada en `TAREA-P2-06C`** (`FechaNacimiento` en usuario/perfil + aviso de próximos cumpleaños en Calendario y widget en Dashboard, descartando trial SaaS y banners comerciales).

#### `DEC-010` (Relacionada con `CMP-06`, `CMP-08`, `VID1-DU-004`, `VID1-DU-007`, `VID1-DU-013`, `VID2-DU-007`)
- **Pregunta concreta**: ¿Se confirma que los módulos de alta complejidad periférica —Constructor CMS Web (`VID1-RF-009`), Red Social `'Social Controla'` (`VID1-RF-011`), Chatbot IA `'Controli'` (`VID1-RF-012`), Pizarras Tácticas/Vectoriales 2D (`VID1-RF-006`, `VID1-RF-007`) y Menú Radial Móvil `'+'` (`VID2-RF-007`)— quedan fuera del alcance del MVP o reservados para Fase 4 opcional?
- **Requerimientos afectados**: `VID1-RF-006`, `VID1-RF-007`, `VID1-RF-009`, `VID1-RF-011`, `VID1-RF-012`, `VID2-RF-007`, `VID2-RNF-002`.
- **Módulos y archivos potencialmente afectados**: Arquitectura completa frontend/backend.
- **Consecuencia técnica**: Incorporarlos equivaldría a construir 4 productos adicionales (CMS, red social, motor canvas vectorial y asistente LLM), multiplicando costos y superficie de mantenimiento.
- **Evidencia en el repositorio**: `docs/requisitos/RF_catalogo.md` acota el sistema a 13 RF empresariales de gestión deportiva; además, la refactorización previa del proyecto estandarizó `EnterpriseErpLayout` con sidebar izquierda fija y skeleton loaders (`VID1-RNF-001`).
- **Recomendación técnica razonada**: Excluir formalmente del MVP el CMS web, la red social, el chatbot IA, las pizarras vectoriales 2D y el loader `'VC'`, evaluándolos solo como extensiones post-MVP.
- **Estado**: **Pendiente de cierre formal de alcance / Bloquea `TAREA-P4-01A`..`F`**.

---

## F. Registro de ejecución y continuidad

| Fecha / Hora (UTC-5) | Evento / Tarea | Estado | Commit | Pruebas y Resultados | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-10-29 20:25 | Reconocimiento inicial y línea base (`VER-TEC-001`) | Completado | Base `e7c3007d` | Backend build 0 err/0 warn, `dotnet test` 3/3, Frontend `tsc` 0 err, `vitest` 7/7, Microservicios `tsc` 0 err | Árbol Git limpio en rama `Requerimientos_en_Automatico`. |
| 2026-10-29 20:30 | `TAREA-P0-01`: Creación de `PLAN_IMPLEMENTACION_SPORTIFY.md` | Completado | `31e118f5` | Verificación integral de trazabilidad (27 RF + 10 RNF + 10 GAP + 10 DEC + 8 CMP) | Siguiente tarea ejecutable: `TAREA-P1-01A`. |
| 2026-10-29 20:36 | `TAREA-P1-01A`: Reubicación de `MembershipService`, `ReportService` y `DashboardService` en `Sportify.Application` | Completado | `9fb5e192` | `dotnet build` 0 err/0 warn, `dotnet test` 3/3 OK | Eliminado acoplamiento directo a `SportifyDbContext` y normalizado UTF-8 en reportes. |
| 2026-10-29 20:41 | `TAREA-P1-01B`: Contratos DTO tipados en `Locations`, `MembershipPlans`, `Trainings`, `Competitions`, `Registrations` y `Evaluations` | Completado | `5bd4148d` | `dotnet build` 0 err/0 warn, `dotnet test` 3/3 OK, `frontend typecheck` 0 err | 0 controladores en `Sportify.Api` referencian entidades de dominio o infraestructura. |
| 2026-10-29 20:44 | `TAREA-P1-01C`: Implementación de `useAdminPaymentsViewModel.ts`, filtros, skeletons y pruebas Vitest | Completado | `864363e6` | `frontend typecheck` 0 err, `vitest run` 3/3 suites (10/10 tests) OK | `AdminPaymentsPage.tsx` desacoplada de `useAccountantViewModel.ts` y de llamadas `apiClient` directas. |
| 2026-10-29 20:48 | `TAREA-P1-03A`: Generación de colilla PDF individual de 2 páginas con QuestPDF y previsualización modal | Completado | `7482d591` | `dotnet build` 0 err/0 warn, `dotnet test` 5/5 OK, `frontend typecheck` 0 err, `vitest` 10/10 OK | Endpoint `GET /api/reports/payments/{id}/voucher-pdf` con control de titularidad y visor en Admin/Contaduría. |
| 2026-10-29 20:52 | `TAREA-P2-05A`: Calendario mensual y de lista unificado de Entrenamientos y Competencias con exportación a Google Calendar | Completado | `15da4a59` | `frontend typecheck` 0 err, `vitest run` 4/4 suites (12/12 tests) OK | Vistas `/admin/calendar`, `/coach/calendar` y `/member/calendar` con estados vacíos amigables (`VID2-RNF-005`). |
| 2026-10-29 20:57 | `TAREA-P2-06A`: Tendencia anual de 12 meses, alertas accionables, protección `0/0` y `GET /api/dashboard/metrics` para `microservicio2` | Completado | `3a019242` | `dotnet build` 0 err/0 warn, `dotnet test` 8/8 OK, `ms typecheck` 0 err, `frontend typecheck` 0 err, `vitest` 12/12 OK | Resuelto fallo `VER-TEC-001` de `microservicio2` y cubierto caso `0/0` en `DashboardServiceTests`. |
| 2026-10-29 21:02 | `TAREA-P2-06B`: Contadores por rol/estado, filtros combinables, skeleton loading y exportación CSV UTF-8 BOM para Excel en directorio | Completado | `a1ba06f5` | `dotnet build` 0 err/0 warn, `dotnet test` 8/8 OK, `frontend typecheck` 0 err, `vitest` 5/5 suites (15/15 tests) OK | Incluye vinculación opcional con `Sede` existente en dominio y pruebas en `UsersPage.test.tsx`. |
| 2026-10-29 21:05 | `TAREA-P3-01A`: Suite integral de 13 archivos de pruebas unitarias xUnit en `Sportify.Tests` (35 pruebas) | Completado | `9ce3ef07` | `dotnet build` 0 err/0 warn, `dotnet test` 35/35 OK | Cobertura de `Auth`, `Users`, `Locations`, `MembershipPlans`, `Memberships`, `Payments`, `Trainings`, `Competitions`, `Registrations`, `Evaluations`, `Dashboard` y `QuestPDF`. |
| 2026-10-29 21:08 | `TAREA-P3-01B`: Suite de pruebas automatizadas (`node:test` + `tsx`) para `microservicio1` y `microservicio2` | Completado | `8c5738be` | `ms typecheck` 0 err, `ms test` 2/2 suites (9/9 tests) OK | Verifica firma HMAC-SHA256, claims .NET, expiración, sesiones concurrentes (`>2`), sincronización `CORE_API_LIVE`, protección `0/0` y esquemas Zod. |
| 2026-11-01 12:37 | `TAREA-P1-02` (`DEC-003` resuelta): Estados de asistencia (`Presente`, `Ausente`, `Tarde`, `Excusa`) con comentarios opcionales | Completado | `e6d85160` | `dotnet build` 0 err/0 warn, `dotnet test` 41/41 OK, `frontend typecheck` 0 err, `vitest` 6/6 suites (16/16 tests) OK | Selector optimista `<100ms`, contadores en vivo, comentarios desplegables y vista de historial en deportista. |
| 2026-11-01 13:01 | `TAREA-P2-06C` (`DEC-009` resuelta): Fecha de nacimiento y avisos de próximos cumpleaños en Calendario y Dashboard | Completado | `67c92917` | `dotnet build` 0 err/0 warn, `dotnet test` 42/42 OK, `frontend typecheck` 0 err, `vitest` 6/6 suites (17/17 tests) OK | Cálculo de días faltantes con cruce de año/bisiestos, banner de aviso en `CalendarPage`, chips mensuales y edición en perfil/directorio. |
| 2026-11-07 10:30 | Optimización integral UX/UI centrada por rol (`VID1-RNF-001`, `VID2-RNF-005`, `GAP-010`): interfaces independientes sin ruido técnico, esqueletos de carga en todas las vistas y `ConfirmDialogModal` | Completado | Registrado en este commit | `dotnet test` 42/42 OK, `frontend typecheck` 0 err, `vitest` 8/8 suites (22/22 tests) OK, `ms test` 9/9 OK | Aislamiento de telemetría solo para `ADMIN`, eliminación total de `alert`/`window.confirm` bloqueantes y desacoplamiento MVVM completo. |
| 2026-11-10 17:47 – 21:11 | Lista de 17 consejos de seguridad y calidad (frontend 3, backend 6 y 5 de full stack), ejecutada por otro agente | Completado (14 commits) | `1863ca48`, `4c1ba7a3`, `5ae53987`, `9ee34ebb`, `2ea5d42b`, `eb016fa5`, `a97350da`, `be176936`, `a8f490f6`, `05fdb68c`, `8b18e0a8`, `aa683872`, `11727081`, `68a552be` | No se registraron resultados por commit. Verificado en conjunto el 2026-11-11: `dotnet test` 100/100, `vitest` 34/34, `ms test` 9/9 | La prueba en navegador del 2026-11-11 mostró que varios flujos quedaron rotos pese a las pruebas en verde (Sección G.3). |
| 2026-11-11 | Prueba del flujo real en navegador (Chromium automatizado, copia temporal, base `sportify_e2e`) sobre `68a552be` | Completado | Sin commit (no modifica código) | 4 roles, todas las pantallas y flujos interactivos | 14 hallazgos funcionales y 6 de seguridad documentados en la Sección G.3. |
| 2026-11-11 15:24 | Consejo full stack 6: mantenimiento preventivo de dependencias (trabajo que estaba sin commit) | Completado | `029e52e1` | `dotnet test` 100/100, `vitest` 34/34 | Auditoría: NuGet sin vulnerabilidades; npm con pendientes (Sección G.5). |
| 2026-11-11 15:28 | Corrección: el interceptor anti-inyección SQL bloqueaba los lotes parametrizados de EF Core (eliminar usuario daba 500) | Completado | `fb9ef485` | `SqlInjectionPreventionTests` 12/12 | Regresión introducida por `9ee34ebb`. |
| 2026-11-11 15:28 | Corrección: avisos de éxito en usuarios solo cuando el servidor confirma | Completado | `19773330` | `UsersPage.test.tsx` 5/5 | — |
| 2026-11-11 15:29 | Límite de comprobantes a 5 MB en React y C# (`RF-06`) | Completado | `c1028e40` | `FileUploadValidationTests` 10/10, `fileValidation.test.ts` 3/3 | Sustituye el límite de 2 MB de `8b18e0a8`. |
| 2026-11-11 15:31 | Corrección: rechazo de pagos e ingreso manual alineados con el contrato JSON de la API | Completado | `5136098a` | `useAdminPaymentsViewModel.test.ts` 3/3, `tsc` 0 errores | El rechazo devolvía 400 siempre y el selector de miembro salía vacío. |
| 2026-11-11 15:31 | Corrección: el frontend muestra el motivo real de la API (`ProblemDetails`) | Completado | `3bb70cc8` | `apiError.test.ts` 4/4 | Hace visible el bloqueo tras 5 intentos y las reglas de negocio. |
| 2026-11-11 15:34 | Cancelación de membresía por el propio miembro y corrección del portal del miembro | Completado | `fb637936` | `dotnet test` (membresías y controlador) 10/10, `vitest` (miembro) 6/6 | Nuevo `POST /api/members/me/memberships/{id}/cancel`. |
| 2026-11-11 15:39 | Convocatoria a torneos por el personal y aceptación o rechazo por el miembro (`RF-10`, `RN-03`) | Completado | `4ace2f2f` | `dotnet test` 123/123, `vitest` 54/54, `eslint` 0 errores | Nuevos `POST /api/members/me/registrations/{id}/accept` y `/decline`. |
| 2026-11-11 15:43 | Consejo full stack 7: Docker preparado para WSL 2 / Ubuntu, con microservicios | Preparado, sin ejecutar | `bc2d647e` | `docker compose config` válido, `dotnet publish -c Release` correcto, `dotnet test` 123/123 | Las imágenes no se construyeron: Docker Desktop estaba apagado. Guía en `docs/ciclo-vida/07_docker_wsl_ubuntu.md`. |
| 2026-11-11 15:44 | Corrección: el contador ve la aprobación solo cuando el servidor la confirma | Completado | `e8023b9b` | `tsc` 0 errores | — |
| 2026-11-11 | Segunda prueba en navegador y regresión completa sobre `e8023b9b` | Completado | Sin commit | Todas las pantallas, 26 pasos de administrador y 41 de miembro, contador, entrenador y autenticación; 0 errores `fail:` en el log de la API | Verificación final: `dotnet test` 123/123, `vitest` 54/54, `ms test` 9/9, `eslint` 0 errores, `vite build` correcto. |
| 2026-11-12 02:29 | Comprobantes visibles para contador, admin y el miembro titular, sin URL pública | Completado | `1ba36b07` | 20 pruebas nuevas en `ReceiptAccessTests.cs`; `vitest` 78/78; navegador con los 4 roles, accesos cruzados y cabeceras | Resuelve el hallazgo de seguridad 1 de G.3.2. Detalle en H.1. |
| 2026-11-12 02:38 | Llaves por defecto fuera del repositorio y AES con la llave configurada | Completado | `d1e167cd` | `dotnet test` 160/160, `ms test` 11/11; arranque en Production rechazado sin llaves propias y aceptado con ellas | Resuelve los hallazgos de seguridad 3 y 4 de G.3.2. |
| 2026-11-12 17:39 | Dependencias: zod 4, Vitest 5 y `@hookform/resolvers` 7 | Completado | `a9945065` | `npm audit` 0 en frontend (antes 15) y en microservicios (antes 1); `vitest` 78/78, `ms test` 11/11 | Cierra el pendiente G.5.3. |
| 2026-11-12 17:39 | Calendario: nombre de la sede en lugar de "Sede #1" | Completado | `5ff3423c` | `dotnet test` 161/161, `vitest` 78/78 | Hallazgo funcional 3 de G.3.2. |
| 2026-11-12 19:57 | Logotipo propio en login, menú lateral y favicon | Completado | `4a789470` | `vitest` 88/88 con `LoginPage.test.tsx` | Hallazgo funcional 1 de G.3.2. |
| 2026-11-12 19:57 | Membresías del contador sin el 403 de sedes | Completado | `1ceb032b` | `vitest` 88/88 con `useUsersViewModel.test.ts` | Hallazgo funcional 2 de G.3.2. |
| 2026-11-12 19:57 | Formulario de entrenamientos con sede y entrenador responsable | Completado | `999a3697` | `dotnet test` 174/174 (13 casos nuevos), `vitest` 88/88 | Hallazgo funcional 4 de G.3.2. Decisión en H.2. |
| 2026-11-12 | Prueba en navegador de toda la tarea (copia temporal, base `sportify_e2e`) | Completado | Sin commit | Comprobantes 19/19 pasos, recorrido 30 rutas sin errores, administrador 26/26, roles 41/41, arreglos 18/18 | Detalle en H.3. |

### Estado operativo al 2026-11-07 (histórico; el estado vigente está en la Sección G)
- **Última tarea iniciada**: Optimización integral UX/UI centrada por rol y confort de carga asíncrona
- **Última tarea completada**: Optimización integral UX/UI centrada por rol (13 de 13 entregables ejecutables completados, verificados y confirmados en commits atómicos)
- **Balance global de pruebas automatizadas (73/73 en verde)**:
  - **Backend (.NET 10 / xUnit)**: `dotnet build` 0 errores / 0 advertencias · `dotnet test` **42/42 aprobadas** (13 suites).
  - **Frontend (React 19 / TypeScript / Vitest)**: `npm --prefix frontend run typecheck` 0 errores · `npm --prefix frontend run test` **22/22 aprobadas** (8 suites).
  - **Microservicios (Node / TypeScript / Zod)**: `npm --prefix backend/microservice run typecheck` 0 errores · `npm --prefix backend/microservice run test` **9/9 aprobadas** (2 suites).
- **Archivos relevantes modificados en esta tarea**: `frontend/src/layouts/EnterpriseErpLayout.tsx`, `frontend/src/layouts/EnterpriseErpLayout.test.tsx`, `frontend/src/layouts/AccountantLayout/index.tsx`, `frontend/src/components/common/ConfirmDialogModal.tsx`, `frontend/src/components/common/ConfirmDialogModal.test.tsx`, `frontend/src/pages/accountant/AccountantDashboard.tsx`, `frontend/src/pages/coach/CoachDashboard.tsx`, `frontend/src/pages/coach/CoachProfile.tsx`, `frontend/src/pages/admin/*.tsx`, `frontend/src/services/api/paymentService.ts`, `frontend/src/viewmodels/useMemberViewModel.ts`, `frontend/src/viewmodels/useProfileViewModel.ts`.
- **Tareas bloqueadas por decisiones de producto**: `TAREA-P1-03B` (`DEC-001`, `DEC-002`), `TAREA-P2-01` (`DEC-004`, `DEC-008`), `TAREA-P2-02` (`DEC-004`), `TAREA-P2-03` (`DEC-005`, `DEC-008`), `TAREA-P2-04` (`DEC-006`), `TAREA-P2-05B` (`DEC-007`), `TAREA-P4-01A..F` (`DEC-010`).
- **Siguiente tarea prioritaria recomendada tras resolución de decisiones de negocio**: `TAREA-P1-03B` (*Tarifa General, abonos parciales y despacho de colilla por WhatsApp*, tras resolver `DEC-001` y `DEC-002`), seguida de `TAREA-P2-02` (*Grupos y Categorías Deportivas con control de aforo*, tras resolver `DEC-004`).
- **Incidencias que condicionan la continuación**: Únicamente las decisiones de negocio pendientes documentadas en la Sección E; el repositorio queda 100% limpio, compilando sin errores ni advertencias y con las 73 pruebas automatizadas del ecosistema en verde.

---

## G. Actualización del 10 y 11 de noviembre de 2026

Esta sección registra el trabajo posterior al 2026-11-07. Fue el estado vigente hasta el 2026-11-11; lo resuelto después y el estado actual están en la Sección H. El código descrito corresponde al commit `e8023b9b`.

### G.1 Lista de 17 consejos de seguridad y calidad

El responsable del producto incorporó una lista de 17 consejos, repartida en tres frentes. Otro agente ejecutó 14 el 2026-11-10; el resto se cerró el 2026-11-11.

| # | Frente | Consejo | Estado | Commits |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Frontend | Accesibilidad (atributos `alt`, foco por teclado, contraste) | Hecho | `eb016fa5` |
| 2 | Frontend | Eliminar patrones oscuros | Hecho | `5ae53987`; la cancelación directa solo funciona de verdad desde `fb637936` |
| 3 | Frontend | Sacar claves API del navegador | Hecho | `1863ca48` |
| 4 | Backend | Criptografía y datos (BCrypt, cifrado en reposo) | Hecho con una limitación (G.3.2) | `4c1ba7a3` |
| 5 | Backend | Prevención de inyección SQL | Hecho | `9ee34ebb`, corregido en `fb9ef485` |
| 6 | Backend | Validación pura y lógica de negocio en el servidor | Hecho | `2ea5d42b` |
| 7 | Backend | Diseño de API con DTOs de mínimo privilegio | Hecho | `a97350da` |
| 8 | Backend | Lógica de autenticación (PIN de 15 minutos, bloqueo tras 5 intentos) | Hecho; el PIN no se entrega (G.3.2) | `be176936`; el aviso de bloqueo se ve desde `3bb70cc8` |
| 9 | Backend | Row Level Security | Hecho; inactivo sin la cabecera `X-Tenant-Id` (decisión: basta con que exista) | `a8f490f6` |
| 10 | Full stack | Validación de entradas y XSS | Hecho | `05fdb68c` |
| 11 | Full stack | Manejo de archivos (peso y formato en React y C#) | Hecho, a 5 MB | `8b18e0a8`, `c1028e40` |
| 12 | Full stack | Control de acceso (guards y `Authorize`) | Hecho | `aa683872` |
| 13 | Full stack | Gestión del código y secretos | Hecho con una limitación (G.3.2) | `11727081` |
| 14 | Full stack | Autenticación y CSRF | Hecho; la validación CSRF no es obligatoria (G.3.2) | `68a552be` |
| 15 | Full stack | Mantenimiento preventivo de dependencias | Hecho; quedan vulnerabilidades por decidir (G.5) | `029e52e1` |
| 16 | Full stack | Docker en WSL / Ubuntu | Preparado, sin ejecutar | `bc2d647e` |
| 17 | Full stack | Moderación (reportar reseñas falsas) | Excluido por decisión: Sportify no tiene reseñas ni las tendrá | — |

### G.2 Decisiones del responsable del producto (2026-11-11)

1. **Cobranza (`DEC-002`)**: el pago es único y total. No hay abonos parciales, tarifa general ni lote mensual.
2. **WhatsApp (`DEC-001`)**: no se implementa por ahora.
3. **Jerarquía sede/grupo (`DEC-004`)**: queda pendiente para más adelante.
4. **Recuperación de contraseña**: por ahora la restablece el administrador. El envío por correo se hará al desplegar, con Firebase.
5. **Permisos del miembro**: puede cancelar su propia membresía (también el administrador). En torneos, el administrador o el entrenador convocan y el miembro debe aceptar para quedar inscrito.
6. **RLS**: basta con que exista; no se requiere aislar datos por sede.
7. **Límite de archivo**: 5 MB (`RF-06`).
8. **Moderación de reseñas**: fuera de alcance de forma definitiva.
9. **Entorno**: se sigue en local; falta cargar un conjunto de datos de prueba; el despliegue se decidirá después.

### G.3 Prueba del flujo real en navegador (2026-11-11)

Se ejecutó con Chromium automatizado, desde una copia temporal del proyecto y contra una base de prueba vacía (`sportify_e2e`, MariaDB 10.4 de XAMPP). La base `sportify_db` no se tocó. Se hicieron tres pasadas: una sobre `68a552be`, otra sobre los flujos cambiados y una regresión completa sobre `e8023b9b`.

#### G.3.1 Fallos encontrados y corregidos

| Fallo observado en `68a552be` | Causa | Corrección |
| :-- | :-- | :-- |
| El portal del miembro no listaba membresías ni pagos; no podía reportar pagos ni cancelar | El frontend leía `Memberships`/`Payments` y la API devuelve `memberships`/`payments` | `fb637936` |
| El ingreso manual de pagos no listaba miembros (administrador y contador) | El frontend leía `Members`/`Memberships` y la API devuelve `members`/`memberships` | `5136098a` |
| Rechazar un pago devolvía 400 siempre | El frontend enviaba `comentario` y el backend exige `comentarioRechazo` | `5136098a` |
| Eliminar un usuario devolvía 500 | El interceptor anti-inyección bloqueaba el lote `DELETE … ; DELETE …` que genera EF Core | `fb9ef485` |
| La pantalla anunciaba "Usuario eliminado" aunque el borrado fallara; lo mismo al aprobar pagos como contador | El aviso de éxito no dependía del resultado | `19773330`, `e8023b9b` |
| El miembro recibía 403 al inscribirse a un torneo y al cancelar su membresía; la cancelación simulaba éxito | Los endpoints solo admitían personal y el frontend ocultaba el error | `4ace2f2f`, `fb637936` |
| El usuario no veía el motivo real de un error (cuenta bloqueada, cuenta desactivada, regla de negocio) | La API responde `ProblemDetails` (`detail`) y el frontend leía `message` | `3bb70cc8` |
| Mensaje "La contrasea actual…" | Error de texto en `MembersController` | `3bb70cc8` |

#### G.3.2 Hallazgos sin corregir

**Seguridad**

1. **Comprobantes sin protección**: un comprobante subido se descarga sin autenticación en `/comprobantes/receipts/<guid>.pdf`, porque se guarda bajo `wwwroot` y se sirve como archivo estático. El endpoint `GET /api/receipts/{id}/preview` sí exige sesión.
2. **CSRF no obligatorio**: `CsrfValidationMiddleware` solo valida cuando llega la cabecera; una petición sin `X-CSRF-TOKEN` pasa. Con token inválido responde 403.
3. **Llaves por defecto versionadas**: `appsettings.json` contiene un secreto JWT y una llave AES por defecto; el commit de secretos solo retiró la cadena de conexión.
4. **Cifrado AES con llave fija**: los conversores de EF (`EncryptedStringConverter`) usan una llave derivada de una constante del código e ignoran `EncryptionSettings:MasterKey`.
5. **PIN de recuperación**: se genera y se guarda con hash, pero no se entrega por ningún canal; además sigue sin usar tras el restablecimiento por el administrador.
6. **Documentación de la API**: Scalar queda abierta en el entorno `Development` (comportamiento esperado, a tener en cuenta al desplegar).

**Funcionales y visuales**

1. Falta `/vite.svg` (no existe `frontend/public`): el logo aparece roto en el login y en el menú lateral.
2. La pestaña Membresías del contador llama a `GET /api/locations` y recibe 403 (solo produce errores en consola).
3. El calendario muestra "Sede #1" en los entrenamientos en lugar del nombre de la sede.
4. El formulario de entrenamiento no permite elegir sede ni entrenador: guarda la sede 1 y al usuario creador como entrenador.
5. En el ingreso manual, la opción de membresía se lee "Plan Plan Básico".
6. En MariaDB (XAMPP), `Database.Migrate()` falla en silencio y el esquema se crea con `EnsureCreated()`; no queda tabla `__EFMigrationsHistory`. Las columnas posteriores a `InitialCreate` dependen de las guardas de `Program.cs`.
7. La serie mensual y las tendencias de `microservicio2` son valores fijos, no datos reales.
8. Una subida mayor de 6 MB recibe un corte de conexión en lugar de un 400 legible. Solo ocurre si se salta la validación del navegador.
9. `docs/ciclo-vida/02_test.md` sigue documentando `npm run test:ui`, retirado en `029e52e1`; `README.md` aún muestra los MVP 2 y 3 como pendientes.

### G.4 Funcionalidades incorporadas el 2026-11-11

- **Límite de comprobantes de 5 MB** (`c1028e40`): `FileUploadValidator.DefaultMaxFileSizeBytes`, `StorageSettings:MaxFileSizeMB` y `MAX_UPLOAD_FILE_SIZE_MB` en React. El cuerpo de la petición admite 6 MB para que un archivo de entre 5 y 6 MB reciba un 400 con mensaje.
- **Cancelación de membresía por el titular** (`fb637936`): `POST /api/members/me/memberships/{id}/cancel`, solo para membresías propias en estado `ACTIVA` o `PENDIENTE`. La membresía queda `SUSPENDIDA` y el administrador o el contador pueden reactivarla. No se creó un estado `CANCELADA` para no alterar gráficas, filtros ni reportes.
- **Convocatoria y aceptación de torneos** (`4ace2f2f`, cumple `RF-10`):
  - El administrador o el entrenador convocan desde "Convocar Deportista"; `POST /api/registrations` crea la inscripción siempre en `PENDIENTE`.
  - El miembro responde desde "Convocatorias Pendientes": `POST /api/members/me/registrations/{id}/accept` la deja `CONFIRMADA` y `/decline` la deja `CANCELADA`.
  - **`RN-03`**: para aceptar, la membresía más reciente del miembro debe estar `ACTIVA`.
  - El personal conserva la opción de corregir el estado a mano desde "Estado".
  - Se retiró la autoinscripción directa del miembro, que devolvía 403.
- **Docker para WSL 2 / Ubuntu** (`bc2d647e`): `docker-compose.yml` incluye `ms1` y `ms2`, los puertos publicados son configurables en `.env` y `/api/microservices/status` lee las URLs de configuración. Guía: `docs/ciclo-vida/07_docker_wsl_ubuntu.md`.

### G.5 Pendientes

1. **Seguridad** (G.3.2): proteger los comprobantes, hacer obligatoria la validación CSRF, sacar del repositorio las llaves por defecto y usar la llave AES configurada. Requieren decisión del responsable del producto.
2. **Docker**: construir y levantar las imágenes siguiendo la guía; hasta ahora solo se validó la configuración.
3. **Dependencias**: la auditoría del 2026-11-11 no encontró paquetes NuGet vulnerables. En npm quedan `follow-redirects` (alta; se corrige con `npm audit fix` sin cambios incompatibles), `zod` (alta; exige la versión 4) y, solo en herramientas de desarrollo, `tinypool` vía `vitest` (crítica; exige `vitest` 5).
4. **Hallazgos funcionales y visuales** de G.3.2.
5. **Recuperación de contraseña por correo** (Firebase), al desplegar.
6. **Conjunto de datos de prueba** para la base local.
7. **Decisiones de producto abiertas**: `DEC-004` (sede/grupo), `DEC-005`, `DEC-006`, `DEC-007`, `DEC-008`, `DEC-010` y el envío por WhatsApp (`DEC-001`).
8. **Publicación**: hay 25 commits locales sin subir a `origin/Requerimientos_en_Automatico`, contando el de este documento; no se ha hecho `git push`.

### G.6 Estado operativo al 2026-11-11 (histórico; el vigente está en H.6)

- **Rama**: `Requerimientos_en_Automatico`. **Código**: `e8023b9b`. Árbol de trabajo limpio.
- **Balance de pruebas automatizadas (186 en verde)**:
  - **Backend (.NET 10 / xUnit)**: `dotnet build` 0 errores y 0 advertencias · `dotnet test` **123/123** (24 archivos).
  - **Frontend (React 19 / Vitest)**: `tsc --noEmit` 0 errores · `vitest run` **54/54** (15 archivos) · `eslint` 0 errores y 109 advertencias por `any` · `vite build` correcto.
  - **Microservicios (Node / TypeScript)**: `tsc --noEmit` 0 errores · `npm run test` **9/9**.
- **Prueba en navegador**: regresión completa sobre `e8023b9b` sin errores en el log de la API.
- **Lección registrada**: las suites estaban en verde mientras cuatro flujos principales estaban rotos, porque los dobles de prueba reproducían un contrato que la API no cumple. Las pruebas nuevas usan el contrato real y conviene repetir la prueba en navegador tras cada cambio de contrato.

---

## H. Actualización del 12 de noviembre de 2026

Pedido del responsable del producto: "Los comprobantes sí o sí los debe poder visualizar el contador, admin y el miembro que lo envía. Revisa lo de las llaves por defecto en el repositorio; si es algo delicado, soluciónalo. Corrige las vulnerabilidades de las dependencias. Y los fallos menores como el logo roto del login, menú, y sede 1 en el calendario." Al retomar la tarea pidió además incluir la decisión y la solución de los fallos menores.

Esta sección es el estado vigente. El código corresponde al commit `999a3697`; este documento y la guía de pruebas se registran en el commit siguiente.

### H.1 Commits y hallazgos que resuelven

| Commit | Cambio | Hallazgo resuelto |
| :-- | :-- | :-- |
| `1ba36b07` | ADMIN y CONTADOR ven cualquier comprobante y el MIEMBRO solo los de sus pagos, siempre con sesión. Los archivos pasan de `wwwroot` a `App_Data/comprobantes` y la API ya no sirve archivos estáticos. Visor con `<dialog>` nativo en los tres roles. | Seguridad 1 (G.3.2) |
| `d1e167cd` | `appsettings.json` ya no trae llaves; las de desarrollo quedan solo en `appsettings.Development.json`. Fuera de Development la API no arranca si `JwtSettings:Secret` o `EncryptionSettings:MasterKey` faltan, son cortas o son valores publicados. AES usa la llave configurada; la llave fija anterior solo descifra filas viejas. | Seguridad 3 y 4 (G.3.2) |
| `a9945065` | zod 4.6.7, Vitest 5.1.0, `@hookform/resolvers` 7 y `react-hook-form` 7.92. `npm audit` queda en 0 en frontend y microservicios. | Pendiente G.5.3 |
| `5ff3423c` | La API entrega `SedeNombre` y el calendario lo muestra; si falta, "Sede por confirmar". | Funcional 3 (G.3.2) |
| `4a789470` | Logotipo propio en `src/assets/sportify-logo.svg`, importado desde el código en el login y el menú lateral y usado como favicon. | Funcional 1 (G.3.2) |
| `1ceb032b` | `useUsersViewModel` pide las sedes solo para el ADMIN; el contador abre Membresías sin el 403. | Funcional 2 (G.3.2) |
| `999a3697` | El formulario de entrenamientos pide la sede y el entrenador responsable (H.2). | Funcional 4 (G.3.2) |
| (siguiente) | Este plan y `docs/ciclo-vida/02_test.md` pasan a Vitest 5. | Funcional 9 (G.3.2), salvo el README |

### H.2 Decisión y solución de los fallos menores

**Logotipo.** No existía `frontend/public`, así que `/vite.svg` daba 404 en el login, el menú y el favicon. Se creó un logotipo propio en `src/assets` y se importa desde el código: si el archivo falta, la compilación falla en lugar de publicar una imagen rota. Las imágenes declaran `width` y `height` para no mover el diseño al cargar.

**"Sede #1" en el calendario.** El calendario armaba el lugar con el identificador interno. Ahora la API envía el nombre de la sede.

**403 del contador en Membresías.** La pantalla reutiliza el directorio de usuarios, que también pedía las sedes, y `/api/locations` es solo del ADMIN. Se decidió no abrir ese permiso: el contador no necesita las sedes en esa vista, así que el frontend ya no las pide para él.

**Sede y entrenador en el formulario de entrenamientos.** Antes cada sesión se guardaba con la sede 1 y con el usuario conectado como entrenador, también cuando era el ADMIN. Decisión: incorporarlo a esta tarea, con estas reglas:
1. Nuevo `GET /api/trainings/form-options` (ADMIN y ENTRENADOR) con solo `id` y `nombre` de las sedes activas y de los entrenadores activos. No se reutiliza `/api/locations` porque es solo del ADMIN y además expone direcciones y teléfonos.
2. El ENTRENADOR siempre crea a su nombre: el servidor toma el id del token, no el del cuerpo. Solo el ADMIN elige o cambia el responsable.
3. El servidor valida que la sede exista y esté activa y que el responsable sea un usuario activo con rol ENTRENADOR. Si no, responde 400 con un mensaje en español.
4. Al editar, la sede o el responsable que no cambian no se vuelven a validar. Así, las sesiones antiguas conservan los suyos, y el formulario los muestra con la nota "(inactiva)" o "(ya no es entrenador activo)".
5. Formulario: selectores obligatorios con la primera opción vacía y deshabilitada, mensaje de error con icono y texto junto a cada campo, y una columna "Sede y entrenador" en el listado. Si las opciones no cargan, el formulario lo dice y ofrece reintentar.

**Para revisar:**
- El entrenador puede editar cualquier sesión, como antes, y cambiarle la sede, pero no reasignarla.
- Las sesiones que el ADMIN creó antes de este cambio lo muestran a él como entrenador. Se corrigen editándolas.
- En el selector cerrado, una nota larga como "Pedro Coach (ya no es entrenador activo)" se corta; se lee completa al abrirlo.
- Otras decisiones de esta tarea: un pago ajeno responde 404 y no 403, para no revelar que existe. El entrenador no ve comprobantes (403). Las llaves de desarrollo publicadas solo se aceptan en Development, y la API lo avisa en el log.

### H.3 Prueba en navegador (2026-11-12)

Se hizo con Chromium automatizado, desde una copia temporal del proyecto, contra una base nueva `sportify_e2e`. La base `sportify_db` no se tocó.

| Recorrido | Resultado |
| :-- | :-- |
| Comprobantes (base nueva) | 19/19 pasos. El miembro titular, el contador y el admin ven el PNG y el PDF. Otro miembro recibe 404, el entrenador 403, y sin sesión o con token falso, 401. Cabeceras `nosniff`, `no-store`, `frame-ancestors 'none'` y `X-Frame-Options: DENY`. Las rutas estáticas antiguas responden 404. |
| Recorrido de pantallas (4 roles) | 30 rutas sin respuestas 4xx/5xx, errores de consola ni peticiones fallidas. Incluye Membresías del contador. |
| Flujo del administrador | 26/26 pasos. |
| Flujos de miembro, contador, entrenador y autenticación | 41/41 pasos. |
| Arreglos de esta tarea | 18/18 pasos. Logotipos cargados (login 28×28, menú 20×20) y favicon 200. Correo inválido explicado junto al campo sin llamar a la API. El servidor rechaza sede inexistente, miembro o entrenador inactivo como responsable, y sede o entrenador sin elegir. Crear, editar y recargar conservan sede y entrenador. Una sesión con entrenador ya inactivo lo conserva al editar otro dato. El calendario no muestra "Sede #". El entrenador no puede asignar ni reasignar a otro. El miembro recibe 403 en las opciones. Membresías del contador sin errores, y el ingreso manual valida y registra. |

**Hallazgos nuevos sin corregir:**
1. **Fechas en UTC**: los nombres de los reportes descargados (pagos, sedes, directorio y desempeño) y la fecha de inicio por defecto al asignar una membresía usan `toISOString()`. Después de las 7 p. m. (UTC-5) muestran el día siguiente. Archivos: `paymentService.ts`, `locationService.ts`, `useUsersViewModel.ts`, `useCoachViewModel.ts` y `MembershipsPage.tsx`. También la fecha de registro de los pagos y de las inscripciones hechos esa noche se vio como 13/11/2026; no se revisó si la causa está en la API o en la pantalla.
2. El hallazgo funcional 8 de G.3.2 se repitió: el archivo de 6 MB recibe un corte de conexión en lugar de un 400.

### H.4 Pendientes

1. **Antes del próximo despliegue en Render**: el servicio debe tener `JwtSettings__Secret` y `EncryptionSettings__MasterKey`; sin ellas, la API no arranca.
2. **Seguridad**: la validación CSRF no es obligatoria; el PIN de recuperación no se entrega (depende del correo con Firebase); Scalar queda abierta en Development.
3. **Funcionales**: el texto "Plan Plan Básico"; `Migrate()` falla sin avisar en MariaDB; datos fijos en `microservicio2`; corte de conexión con más de 6 MB; fechas en UTC (H.3); `README.md` desactualizado.
4. **Docker**: construir y levantar las imágenes según la guía.
5. **CI**: Vitest 5 necesita Node `^22.12` o `>=24`; el workflow usa Node 22 y debe resolver una versión 22.12 o superior.
6. Recuperación de contraseña por correo (Firebase), conjunto de datos de prueba y decisiones de producto abiertas (`DEC-001`, `DEC-004` a `DEC-008` y `DEC-010`).
7. **Publicación**: hay 8 commits locales sin subir, contando el de este documento; no se ha hecho `git push`.

### H.5 Evidencias

Fuera del repositorio, en `PROYECTO\Evidencias_Prueba_Navegador_2026-11-12\`: capturas, registros por rol (los tokens de prueba se cambiaron por `[JWT eliminado]`) y los scripts del recorrido, entre ellos `12-fixes.mjs` y `13-form-visual.mjs`.

### H.6 Estado operativo vigente

- **Rama**: `Requerimientos_en_Automatico`. **Código**: `999a3697`. Árbol de trabajo limpio tras el commit de este documento.
- **Balance de pruebas automatizadas (273 en verde)**:
  - **Backend (.NET 10 / xUnit)**: `dotnet test` **174/174**. NuGet sin paquetes vulnerables.
  - **Frontend (React 19 / Vitest 5)**: `tsc --noEmit` 0 errores · `vitest run` **88/88** (19 archivos) · `eslint` 0 errores y 109 advertencias por `any` · `vite build` correcto (JS de 1.141,78 kB) · cobertura correcta · `npm audit` 0.
  - **Microservicios (Node / TypeScript)**: `tsc --noEmit` 0 errores · `npm run test` **11/11** · `npm audit` 0.
- **Prueba en navegador**: H.3, sin fallos.
