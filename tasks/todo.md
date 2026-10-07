## Task 1: Configurar EF Core Tools y generar Migración Inicial

**Description:** Eliminar la recreación destructiva de la base de datos y generar la primera migración oficial que represente el estado actual del esquema (Tablas: Usuarios, Pagos, Evaluaciones, etc.).

**Acceptance criteria:**
- [x] Eliminar `context.Database.EnsureDeleted()` de `Program.cs`.
- [x] Eliminar `context.Database.EnsureCreated()` de `Program.cs`.
- [x] Solucionar bug `GET_LOCK()` de EF Core creando la base de datos `sportify_db` manualmente vía ADO.NET antes de `context.Database.Migrate()`.
- [x] Ejecutar `dotnet ef migrations add InitialCreate` en el proyecto API (Generado exitosamente eludiendo el AppLocker temporalmente).

**Verification:**
- [x] Build succeeds: `dotnet build`
- [x] Se crea la carpeta `Migrations` con los scripts de C# correspondientes a las tablas existentes.

**Dependencies:** None

**Files likely touched:**
- `backend/Sportify.Api/Program.cs`
- `backend/Sportify.Api/Sportify.Api.csproj` (Si falta alguna tool)

**Estimated scope:** Small: 1-2 files

---

## Task 2: Implementar ejecución automática de migraciones en Startup

**Description:** Modificar el `Program.cs` para aplicar las migraciones pendientes automáticamente al iniciar la API usando un Service Scope, y mover la lógica de "Seeding" de roles para que ocurra después de la migración.

**Acceptance criteria:**
- [x] Implementar `context.Database.Migrate()` dentro de un bloque `using (var scope = app.Services.CreateScope())`.
- [x] Mover el seeding de Roles (si existe) para que se inserte de forma segura (`!context.Roles.Any()`).

**Verification:**
- [x] Build succeeds: `dotnet build`
- [x] Manual check: Arrancar la API (`dotnet run`) y verificar que los logs muestren las migraciones aplicándose, y que los datos (usuarios, roles) persistan entre reinicios.

**Dependencies:** Task 1

**Files likely touched:**
- `backend/Sportify.Api/Program.cs`

**Estimated scope:** Small: 1 file

---

## Checkpoint: Después de Tareas 1-2
- [x] La base de datos es persistente.
- [x] La aplicación compila y arranca sin tirar errores.
- [ ] Review with human before proceeding to Task 3.

---

## Task 3: Definir interfaces base

**Description:** Crear las carpetas de Servicios en el proyecto `.Domain` o `.Application` (según cómo esté estructurado el backend) y definir las interfaces `IUserService`, `IPaymentService`, `IEvaluationService`, etc.

**Acceptance criteria:**
- [x] Crear las interfaces vacías con firmas básicas (opcionalmente añadir los métodos a medida que los vayamos refactorizando).
- [x] Registrar los servicios en el contenedor de dependencias (`builder.Services.AddScoped<IUserService, UserService>()`) en `Program.cs`.

**Verification:**
- [x] Build succeeds: `dotnet build`

**Dependencies:** Checkpoint 1

**Files likely touched:**
- `backend/Sportify.Api/Program.cs`
- `backend/Sportify.Domain/Interfaces/` o `backend/Sportify.Api/Services/`

**Estimated scope:** Small: 3-5 files

---

## Task 4: Refactorizar UsersController hacia UserService

**Description:** Mover toda la lógica que dependa de `SportifyDbContext` en `UsersController` hacia la implementación de `UserService`.

**Acceptance criteria:**
- [x] `UsersController` ya no debe inyectar `SportifyDbContext`.
- [x] `UsersController` debe inyectar `IUserService`.
- [x] Todos los endpoints de usuarios (`Login`, `Register`, `GetAll`, etc.) deben delegar en el servicio.

**Verification:**
- [x] Build succeeds: `dotnet build`
- [x] Manual check: Iniciar sesión en el frontend para confirmar que el login sigue funcionando.

**Dependencies:** Task 3

**Files likely touched:**
- `backend/Sportify.Api/Controllers/UsersController.cs`
- `backend/Sportify.Api/Services/UserService.cs`

**Estimated scope:** Medium: 2-3 files

---

## Task 5: Refactorizar PaymentsController hacia PaymentService

**Description:** Mover las consultas de pagos y membresías desde el controlador hacia el `PaymentService`.

**Acceptance criteria:**
- [x] `PaymentsController` ya no debe inyectar `SportifyDbContext`.
- [x] `PaymentsController` debe inyectar `IPaymentService`.
- [x] La lógica de registrar un pago o listar pagos pasa al servicio.

**Verification:**
- [x] Build succeeds: `dotnet build`
- [x] Manual check: Entrar a la vista de pagos del frontend y verificar que carguen.

**Dependencies:** Task 3

**Files likely touched:**
- `backend/Sportify.Api/Controllers/PaymentsController.cs`
- `backend/Sportify.Api/Services/PaymentService.cs`

**Estimated scope:** Medium: 2-3 files

---

## Task 6: Refactorizar EvaluationsController y TrainingsController (y demás controladores)

**Description:** Mover la lógica de los controladores restantes hacia `EvaluationService` y `TrainingService`.

**Acceptance criteria:**
- [x] `EvaluationsController` no inyecta `SportifyDbContext`.
- [x] `TrainingsController` no inyecta `SportifyDbContext`.
- [x] La lógica CRUD de evaluaciones y entrenamientos se mueve a los servicios correspondientes.

**Verification:**
- [x] Build succeeds: `dotnet build`
- [x] Manual check: El panel de Entrenador (Coach) debe poder ver y guardar evaluaciones como antes.

**Dependencies:** Task 3

**Files likely touched:**
- `backend/Sportify.Api/Controllers/EvaluationsController.cs`
- `backend/Sportify.Api/Controllers/TrainingsController.cs`
- `backend/Sportify.Api/Services/...`

**Estimated scope:** Large: 4-6 files

---

## Checkpoint: Refactorización Completa
- [x] No existen referencias a `SportifyDbContext` en la carpeta `Controllers`.
- [x] Todo compila y los flujos del frontend funcionan correctamente.

---

## Task 7: Implementar Global Exception Handler

**Description:** Evitar que la aplicación devuelva un Stack Trace al frontend cuando ocurre una excepción no controlada. Implementar IExceptionHandler.

**Acceptance criteria:**
- [x] Crear clase GlobalExceptionHandler implementando IExceptionHandler.
- [x] Registrar en Program.cs (uilder.Services.AddExceptionHandler<GlobalExceptionHandler>() y pp.UseExceptionHandler()).
- [x] Estandarizar la respuesta de error con ProblemDetails.

**Verification:**
- [x] Build succeeds: dotnet build
- [x] Forzar un error y verificar que la respuesta es un JSON limpio sin el stack trace.

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Api/Middlewares/GlobalExceptionHandler.cs
- ackend/Sportify.Api/Program.cs

**Estimated scope:** Small: 2 files

---

## Task 8: Configurar Rate Limiting para Autenticación

**Description:** Prevenir ataques de fuerza bruta en los endpoints de Login.

**Acceptance criteria:**
- [x] Configurar Rate Limiting en Program.cs (AddRateLimiter).
- [x] Crear una política "AuthRateLimit" (ej. 10 peticiones por minuto).
- [x] Aplicar la política a UsersController.Login.

**Verification:**
- [x] Build succeeds: dotnet build

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Api/Program.cs
- ackend/Sportify.Api/Controllers/UsersController.cs

**Estimated scope:** Small: 2 files

---

## Task 9: Implementar Security Headers y revisar política CORS

**Description:** Añadir cabeceras de seguridad HTTP (HSTS, X-Content-Type-Options) y endurecer CORS.

**Acceptance criteria:**
- [x] Configurar HSTS (si no está activo) para producción.
- [x] Agregar middleware para inyectar X-Content-Type-Options: nosniff y X-Frame-Options: DENY.
- [x] Confirmar que CORS está limitado al origin del Frontend (Vite).

**Verification:**
- [x] Build succeeds: dotnet build

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Api/Program.cs

**Estimated scope:** Small: 1 file

---

## Checkpoint: Seguridad
- [x] El frontend funciona correctamente sin bloqueos CORS indebidos.
- [x] Los errores 500 no muestran stack traces al cliente.

---

## Task 10: Habilitar DbContext Pooling

**Description:** Mejorar el rendimiento de la base de datos reusando instancias del DbContext bajo alta carga.

**Acceptance criteria:**
- [x] Cambiar AddDbContext a AddDbContextPool en DependencyInjection.cs de Infrastructure.

**Verification:**
- [x] Build succeeds: dotnet build

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Infrastructure/DependencyInjection.cs

**Estimated scope:** Small: 1 file

---

## Task 11: Configurar Response Compression

**Description:** Comprimir las respuestas JSON grandes (ej. listados de usuarios o reportes) para ahorrar ancho de banda.

**Acceptance criteria:**
- [x] Agregar uilder.Services.AddResponseCompression().
- [x] Configurar proveedores Gzip y Brotli.
- [x] Habilitar middleware pp.UseResponseCompression().

**Verification:**
- [x] Build succeeds: dotnet build

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Api/Program.cs

**Estimated scope:** Small: 1 file

---

## Task 12: Implementar Health Checks

**Description:** Proveer un endpoint para que el Load Balancer o Docker/Kubernetes sepa si la API está viva.

**Acceptance criteria:**
- [x] Agregar AddHealthChecks() y validación de base de datos (AddMySql o verificar EntityFramework).
- [x] Mapear endpoint /api/health.

**Verification:**
- [x] Build succeeds: dotnet build

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Api/Program.cs

**Estimated scope:** Small: 1 file

---

## Checkpoint: Escalabilidad
- [x] La aplicación compila exitosamente.
- [x] /api/health devuelve estado HTTP 200 (Healthy).

---

## Task 13: Exponer URL del Comprobante en DTOs

**Description:** Modificar el PaymentDto para devolver la URL o ruta relativa del PDF subido, de modo que el frontend sepa dónde buscarlo.

**Acceptance criteria:**
- [x] Agregar propiedad ComprobanteUrl al PaymentDto.
- [x] Asegurar que PaymentRepository.GetAllAsync incluya (.Include(p => p.Comprobante)) al consultar pagos.
- [x] Mapear ComprobanteUrl = p.Comprobante?.RutaArchivo en PaymentService.

**Verification:**
- [ ] Build succeeds: dotnet build

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Application/DTOs/Payments/PaymentDto.cs
- ackend/Sportify.Application/Services/PaymentService.cs
- ackend/Sportify.Infrastructure/Repositories/PaymentRepository.cs

**Estimated scope:** Small: 3 files

---

## Task 14: Lógica de Renovación al Aprobar Pago

**Description:** Al aprobar un pago, la membresía debe sumar los días del plan de forma inteligente.

**Acceptance criteria:**
- [ ] En ApproveAsync, si pago.MembresiaId tiene valor, obtener la membresía (con su Plan incluido).
- [ ] Si FechaFin actual es mayor a DateTime.UtcNow, sumar los días a esa fecha.
- [ ] Si ya había expirado, la nueva FechaInicio es hoy, y la FechaFin es hoy + días.
- [x] Cambiar estado a ACTIVA.

**Verification:**
- [ ] Build succeeds: dotnet build

**Dependencies:** None

**Files likely touched:**
- ackend/Sportify.Application/Services/PaymentService.cs

**Estimated scope:** Small: 1 file

---

## Task 15: Componente PdfViewerModal (Frontend)

**Description:** Un modal reutilizable de React/Tailwind para incrustar el visor de PDF nativo.

**Acceptance criteria:**
- [x] Crear el componente que reciba isOpen, onClose, pdfUrl, y 	itle.
- [x] El cuerpo del modal debe usar <iframe src={pdfUrl} className="w-full h-96" />.

**Verification:**
- [x] Vite compila sin errores.

**Dependencies:** None

**Files likely touched:**
- rontend/src/components/common/PdfViewerModal.tsx

**Estimated scope:** Small: 1 file

---

## Task 16: Interfaz de Gestión de Comprobantes (Frontend)

**Description:** Agregar el botón de visualizar comprobante en la tabla y asegurar que el formulario soporta subida de archivos.

**Acceptance criteria:**
- [x] En AdminPaymentsPage.tsx y AccountantDashboard.tsx, si el pago tiene comprobanteUrl, mostrar botón "Ver".
- [x] Al hacer clic, abrir el PdfViewerModal.
- [x] El endpoint base debe apuntar al dominio correcto del servidor (o concatenarlo).

**Verification:**
- [x] Vite compila sin errores.

**Dependencies:** Task 13, Task 15

**Files likely touched:**
- rontend/src/pages/admin/AdminPaymentsPage.tsx
- rontend/src/pages/accountant/AccountantDashboard.tsx

**Estimated scope:** Medium: 3 files

---

## Checkpoint: Fase 2 Completada
- [x] Se puede visualizar el PDF haciendo clic en "Ver".
- [x] Las fechas de renovación avanzan dinámicamente.
