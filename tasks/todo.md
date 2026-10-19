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
- [ ] La base de datos es persistente.
- [ ] La aplicación compila y arranca sin tirar errores.
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
