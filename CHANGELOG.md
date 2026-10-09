# Registro de cambios

Todos los cambios relevantes del proyecto Sportify Club Manager se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las entradas más recientes van arriba.

## [2026-10-08] Suite de pruebas unitarias core

### Añadido
- **Backend (`Sportify.Tests`):** paquete `Moq` 4.21.0. xUnit 2.9.3 ya estaba instalado.
- `backend/Sportify.Tests/Services/PaymentServiceTests.cs`: 3 pruebas unitarias de `PaymentService`, con `IPaymentRepository` simulado mediante Moq:
  - `CreateAsync` crea el pago en estado `PENDIENTE` y llama una vez al repositorio.
  - `ApproveAsync` aprueba un pago pendiente, guarda el aprobador y activa la membresía asociada.
  - `RejectAsync` con un comentario de menos de 10 caracteres lanza `InvalidOperationException` (RN-05) y no toca el repositorio.
- Resultado de `dotnet test`: 3 de 3 pruebas superadas.

### Eliminado
- `backend/Sportify.Tests/UnitTest1.cs`: era una prueba vacía de plantilla.

## [2026-10-05] Dashboard Admin en tiempo real e interceptor global de errores

### Añadido
- **Backend:** endpoint `GET /api/dashboard/stats` (solo ADMIN) en `backend/Sportify.Api/Controllers/DashboardController.cs`, con el DTO `backend/Sportify.Application/DTOs/Dashboard/DashboardStatsDto.cs`. Devuelve:
  - KPIs: usuarios activos, membresías activas, ingresos aprobados del mes actual (UTC) y pagos pendientes.
  - Series de los últimos 6 meses, incluido el actual: ingresos aprobados y nuevos usuarios. Los meses sin datos van en 0.
  - Membresías por estado, con un valor por cada `EstadoMembresia`.
  - Todo se agrupa en la base de datos (`GROUP BY`). Los pagos con borrado lógico no cuentan.
- **Frontend:**
  - Dependencias `recharts` (gráficas) y `react-hot-toast` (notificaciones).
  - `services/api/dashboardService.ts` y los tipos `DashboardStats`, `IngresoMensual`, `UsuariosMensual` y `MembresiasPorEstado` en `models/index.ts`.
  - `viewmodels/useAdminDashboardViewModel.ts`: consulta las métricas cada 30 s. Se pausa con la pestaña oculta y refresca al volver. Evita peticiones superpuestas y conserva los últimos datos si una actualización falla.
  - `<Toaster position="top-right" />` en `App.tsx`.
  - `apiClient.ts`: nueva función `setUnauthorizedHandler()`.

### Cambiado
- `pages/admin/DashboardPage.tsx`: ya no usa datos inventados (`setTimeout` con valores fijos).
  - KPIs reales.
  - Indicador "En vivo · Actualizado hace X s" y botón Actualizar.
  - Gráficas: ingresos por mes y nuevos usuarios por mes (barras de una serie) y membresías por estado (barras horizontales con la paleta de estados y etiqueta + cantidad en cada barra).
  - El spinner usa Tailwind, porque la clase `spinner-border` de Bootstrap no estaba cargada y no se veía.
  - El `alert()` de los reportes PDF pasó a `toast.error` (los 5xx ya los avisa el interceptor).
- **Interceptor de axios (`services/api/apiClient.ts`):**
  - **401:** cierra la sesión y navega a `/login` con React Router, sin recargar, y muestra el toast "Tu sesión expiró". Si fallan varias peticiones a la vez, redirige una sola vez. Los 401 de `/api/auth/*` se ignoran, porque ahí significan credenciales inválidas.
  - **5xx:** muestra un toast de error con el `message` del backend (`ExceptionHandlingMiddleware`), o un texto genérico si no hay. Usa un `id` fijo para que los errores repetidos no se apilen.
  - Siempre rechaza la promesa, así que los `catch` existentes siguen funcionando.
- `context/AuthContext.tsx`: registra el manejador de 401 (`logout` + `navigate('/login')`). `logout` ahora usa `useCallback`.

### Corregido
- **Contraseña incorrecta en el login:** antes el 401 hacía `window.location.href = '/login'`, la página se recargaba y se perdía el mensaje "Credenciales inválidas". Ahora el mensaje se muestra.
- **Recargar una página protegida mandaba al login aunque hubiera sesión:** `AuthContext` leía `localStorage` en un `useEffect`, después del primer render de `ProtectedRoute`. Ahora lee la sesión al crear el estado.

### Verificación
- Backend: `dotnet build` con 0 errores y sin advertencias nuevas (siguen las 18 de antes).
- Frontend: `npx tsc --noEmit` sin errores y `npm run build` OK. El aviso de chunk mayor a 500 kB ya existía; el bundle pasó a 264 kB gzip por Recharts.
- `GET /api/dashboard/stats` con datos de prueba en MariaDB 10.4 (XAMPP):
  - KPIs, series y conteos por estado iguales a `COUNT`/`SUM`/`GROUP BY` hechos directamente en SQL.
  - Meses sin datos en 0. No cuentan los pagos borrados ni los de hace 7 meses.
  - CONTADOR, MIEMBRO y ENTRENADOR reciben 403; sin token, 401.
- Interceptor: se ejecutó el `apiClient.ts` real en Node (empaquetado con esbuild, con `react-hot-toast` sustituido para registrar las llamadas). Pasaron 11 de 11 comprobaciones:
  - Contraseña incorrecta: 401 con el mensaje "Credenciales inválidas", sin redirección.
  - Token alterado con 3 peticiones a la vez: un solo cierre de sesión.
  - Después de iniciar sesión de nuevo, la redirección vuelve a funcionar.
  - Sin manejador registrado se usa la recarga de respaldo.
  - 500 y 503 muestran el toast con su mensaje; 401, 404 y 409 no.
  - Un 500 real del backend (instancia apuntando a una base inexistente) devuelve `{ statusCode, message, timestamp }`, el formato que lee el interceptor.
- **Pendiente: revisión visual en el navegador** (gráficas, toasts, redirección). No había herramientas de navegador en esta sesión.
- Fuera de alcance: los demás `alert()` de error por pantalla siguen igual. En un 5xx se verán el toast y además su alert.

## [2026-10-05] Rendimiento: paginación de Evaluaciones y Pagos

### Añadido
- `backend/Sportify.Application/DTOs/Common/PaginationParams.cs`: parámetros `page` y `pageSize` por query string. Por defecto página 1 de 10; `page < 1` pasa a 1 y `pageSize` queda entre 1 y 100.
- `backend/Sportify.Application/DTOs/Common/PagedResult.cs`: respuesta paginada genérica (`items`, `page`, `pageSize`, `totalCount`, `totalPages`).
- `backend/Sportify.Application/DTOs/Payments/PaymentSummaryDto.cs` y endpoint `GET /api/payments/summary` (ADMIN, CONTADOR): pagos pendientes y recaudo aprobado, calculados en la base de datos.
- `frontend/src/components/Pagination.tsx`: control reutilizable con Anterior/Siguiente, "Página X de Y", rango de registros y selector de tamaño (10/20/50).
- `frontend/src/models/index.ts`: tipos `PagedResult<T>` y `PaymentSummary`.

### Cambiado
- **API (cambio incompatible):** `GET /api/payments` y `GET /api/evaluations` ya no devuelven un arreglo, sino un `PagedResult`. Aceptan `?page=&pageSize=`.
- `GET /api/evaluations` acepta además el filtro opcional `evaluadoPorId`.
- `PaymentRepository.GetAllAsync` pasa a `GetPagedAsync(skip, take)`, con `CountAsync` + `OrderByDescending(FechaPago).ThenByDescending(Id).Skip().Take()`. Antes la consulta no tenía orden.
- `PaymentService` / `IPaymentService`: `GetAllAsync` pasa a `GetPagedAsync(PaginationParams)` y se agrega `GetSummaryAsync()`.
- `EvaluationsController.GetAll`: conteo + `Skip/Take` sobre un orden estable. Se quitan los `Include`, que no hacían falta porque la proyección `Select` ya trae los datos.
- `useAccountantViewModel` y `useEvaluationsViewModel` manejan `page`, `pageSize`, `totalCount` y `totalPages`. Al aprobar o rechazar un pago se recargan los totales. Un pago manual vuelve a la página 1. Si al eliminar una evaluación la página queda vacía, se retrocede una.
- `AdminPaymentsPage`, `AccountantDashboard` y `EvaluationsPage`: control de paginación debajo de la tabla. Las tarjetas de pendientes y recaudo usan el resumen del servidor.
- `EvaluationsPage`: el mensaje "Cargando..." solo aparece en la primera carga, para que la tabla no desaparezca al cambiar de página.
- `useCoachViewModel` / `CoachDashboard`: piden solo las 5 evaluaciones más recientes del entrenador (`evaluadoPorId`) y el total al servidor, en vez de descargar todas y filtrar en el navegador.

### Verificación
- Frontend: `npx tsc --noEmit` sin errores y `npm run build` OK.
- Backend (.NET SDK 10.0.401): `dotnet build backend/Sportify.slnx` con 0 errores. Las 18 advertencias son de referencias nulas (CS8602/CS8618); las dos de `EvaluationsController.cs:46-47` siguen el mismo patrón que ya existía en `GetOptions`. `dotnet test` 1/1 OK.
- API levantada contra MariaDB 10.4.32 (XAMPP), con 25 pagos visibles + 2 con borrado lógico y 12 evaluaciones (7 del entrenador y 5 del admin). Pasaron 20 de 20 comprobaciones:
  - `GET /api/payments`: por defecto página 1 de 10; `totalCount=25` y `totalPages=3`. Las 3 páginas suman 25 Ids sin repetir, en orden `FechaPago` desc y luego `Id` desc (incluye un empate de fecha). Una página fuera de rango devuelve una lista vacía. `page=0&pageSize=500` se ajusta a 1/100 y un `pageSize` negativo pasa a 10. Los pagos borrados no aparecen.
  - `GET /api/payments/summary`: `pendientes=8` y `totalAprobadoCOP=628000.00`, iguales a `COUNT`/`SUM` hechos directamente en SQL.
  - `GET /api/evaluations`: la paginación y el conteo son correctos, trae `usuarioNombre` y `competenciaNombre`, y el filtro `evaluadoPorId` funciona (3 → 7 y 1 → 5).
  - Permisos: MIEMBRO recibe 403 en pagos, resumen y evaluaciones; ENTRENADOR recibe 403 en el resumen.
  - El JSON usa los mismos nombres que los tipos `PagedResult<T>` y `PaymentSummary` del frontend.
- **Problemas encontrados que no son de este cambio (no se corrigieron):**
  - En MySQL 8 la API no logra crear la base: `SportifyDbContext.cs:40` usa `HasDefaultValueSql("UTC_TIMESTAMP()")` y MySQL 8 exige `(UTC_TIMESTAMP())`. En MariaDB/XAMPP sí funciona. El README dice "MySQL 8.x".
  - En `bin/` y `obj/` venían archivos generados en otra máquina (`C:\Users\duvan\...`) que impedían arrancar la API. Se arregla con `dotnet build --no-incremental`. Esas carpetas no deberían copiarse con el proyecto.

## [2026-10-05] Frontend: tipado estricto de roles con enum TypeScript

### Añadido
- `frontend/src/models/enums.ts`: enum `UserRole` (`ADMIN`, `CONTADOR`, `ENTRENADOR`, `MIEMBRO`; mismos valores que los roles del backend) y mapa `ROLE_HOME_ROUTES` con la ruta de inicio de cada rol.

### Cambiado
- `frontend/src/models/index.ts`: `User.rol` pasa de `string` a `UserRole`; se re-exportan los enums.
- `frontend/src/routes/RoleRoute.tsx`: la prop `roles` pasa de `string[]` a `UserRole[]`.
- `frontend/src/routes/AppRoutes.tsx`: las rutas protegidas usan `UserRole.*`; la redirección de `/` usa `ROLE_HOME_ROUTES`.
- `frontend/src/viewmodels/useLoginViewModel.ts`: la redirección después del login usa `ROLE_HOME_ROUTES`, la misma lógica que `AppRoutes`, en un solo sitio.
- `frontend/src/services/users/userService.ts`: `CreateUserDto.rolNombre` y `UpdateUserDto.rolNombre` pasan a `UserRole`.
- `frontend/src/viewmodels/useUsersViewModel.ts`: el rol por defecto es `UserRole.MIEMBRO`.
- `frontend/src/pages/admin/UsersPage.tsx`: el formulario, los colores del rol y las opciones del `<select>` usan `UserRole`.
- `frontend/src/pages/admin/MembershipsPage.tsx`: el filtro de miembros usa `UserRole.MIEMBRO`.

### Corregido
- 14 errores TS6133 que ya existían (imports y variables sin usar) e impedían que `npm run build` terminara:
  - Import de `React` sin usar en `layouts/*/index.tsx` (4), `pages/admin/CompetitionsPage.tsx`, `pages/admin/DashboardPage.tsx`, `pages/auth/LoginPage.tsx`, `pages/coach/CoachDashboard.tsx`, `routes/AppRoutes.tsx` y `routes/ProtectedRoute.tsx`.
  - Iconos sin usar: `Users` en `LocationsPage.tsx` y `DollarSign` en `PlansPage.tsx`.
  - `errors` sin usar en `TrainingsPage.tsx`; `newRegistration` sin usar en `useRegistrationsViewModel.ts`.

### Verificación
- `npx tsc --noEmit`: 0 errores.
- `npm run build`: OK (solo queda el aviso de Vite de que un chunk pesa más de 500 kB, que ya existía).
- Los únicos strings literales de rol en `src/` están en `models/enums.ts`.
- Un rol mal escrito (`roles={['ADMN']}`) ahora da error al compilar: `TS2820: Type '"ADMN"' is not assignable to type 'UserRole'`.
