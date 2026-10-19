# Implementation Plan: Fase 1 - Persistencia y Arquitectura

## Overview
Implementar la base crítica del backend para asegurar la integridad de los datos y limpiar la estructura del código. Esto corresponde a las tareas 1.1 (Persistencia con EF Core Migrations) y 1.2 (Patrón Repositorio / Servicios) del backlog.

## Architecture Decisions
- **Migrations en Startup:** Aplicaremos `context.Database.Migrate()` durante el arranque de la API (`Program.cs`) dentro de un Service Scope, garantizando que la base de datos siempre esté actualizada antes de recibir peticiones. Eliminaremos el destructivo `EnsureDeleted()`.
- **Servicios Específicos sobre Repositorio Genérico:** Para evitar sobreingeniería, en lugar de un `IRepository<T>` genérico complejo, crearemos Servicios de Dominio (ej. `IUserService`, `IPaymentService`) que encapsulen la lógica de negocio y las consultas a Entity Framework, dejando a los Controladores únicamente la responsabilidad de enrutar HTTP y devolver DTOs.

## Task List

### Phase 1: Persistencia (EF Core Migrations)
- [ ] Task 1: Configurar EF Core Tools y generar Migración Inicial.
- [ ] Task 2: Implementar ejecución automática de migraciones en Startup.

### Checkpoint: Persistencia
- [ ] La base de datos no se borra al reiniciar.
- [ ] La estructura de tablas coincide con las entidades.

### Phase 2: Arquitectura (Refactorización Core)
- [ ] Task 3: Definir interfaces base (`IUserService`, `IPaymentService`, etc.).
- [ ] Task 4: Refactorizar `UsersController` hacia `UserService`.
- [ ] Task 5: Refactorizar `PaymentsController` hacia `PaymentService`.
- [ ] Task 6: Refactorizar `EvaluationsController` y `TrainingsController` hacia sus respectivos servicios.

### Checkpoint: Complete
- [ ] Todo compila sin errores.
- [ ] Los endpoints siguen funcionando idéntico en el frontend.
- [ ] Los controladores ya no inyectan `SportifyDbContext` directamente.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Pérdida de datos por Migración | Alto | Asegurarnos de que el SQL Server local no tenga datos vitales antes de correr la migración inicial. |
| Endpoints rotos por refactor | Medio | Probar los endpoints críticos (Login, Pagos) después de mover cada controlador, no esperar al final. |

## Open Questions
- ¿Queremos mantener el "Seeding" de roles en el inicio del programa después de aplicar `Migrate()`? (Sí, moveremos la lógica de seeding a un método seguro post-migración).
