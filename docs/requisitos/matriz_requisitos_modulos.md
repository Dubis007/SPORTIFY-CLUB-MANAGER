# Matriz de Requisitos vs Módulos – SPORTIFY CLUB MANAGER

## 1. Introducción

Este documento presenta la **Matriz de Trazabilidad de Requisitos Funcionales (RF)** del sistema **SPORTIFY CLUB MANAGER**. Su propósito es establecer la correspondencia directa entre cada requisito funcional identificado y los componentes técnicos del sistema (módulos backend, endpoints REST, tablas de base de datos, pantallas frontend, roles de usuario e historias de usuario asociadas).

Esta matriz permite:

- **Verificar la cobertura completa** de todos los requisitos durante el desarrollo.
- **Facilitar el rastreo** de cambios y su impacto en el sistema.
- **Servir como guía de referencia** para el equipo de desarrollo, QA y stakeholders.
- **Garantizar la alineación** entre las necesidades del negocio y la implementación técnica.

---

## 2. Control de Versiones

| Versión | Fecha | Autor | Cambios Realizados |
|:-------:|:----------:|-------|-------------------|
| 1.0 | 2026-08-01 | Equipo SPORTIFY | Versión inicial de la matriz |
| 1.1 | 2026-08-20 | Equipo SPORTIFY | Adición de RF-12 y RF-13 |
| 1.2 | 2026-09-01 | Equipo SPORTIFY | Revisión de roles y endpoints actualizados |

---

## 3. Matriz de Trazabilidad RF ↔ Módulos

> **📝 Nota:** Cada fila representa un Requisito Funcional (RF) y su mapeo completo hacia los componentes del sistema. Los endpoints siguen la convención REST. Las tablas de BD corresponden al modelo de datos definido en el DER.

| ID RF | Nombre RF | Módulo Backend | Endpoint Principal | Tabla(s) BD | Pantalla Frontend | Roles Involucrados | Historia de Usuario |
|:-----:|-----------|---------------|-------------------|-------------|-------------------|--------------------|---------------------|
| RF-01 | Autenticación | `AuthModule` | `/api/auth/login`<br>`/api/auth/forgot-password`<br>`/api/auth/reset-password` | `Users`<br>`PasswordResetToken` | `LoginPage`<br>`ForgotPasswordPage` | Todos | HU-ADMIN-01, HU-MIE-01 |
| RF-02 | Gestión de Usuarios | `UsersModule` | `/api/users`<br>(GET, POST, PUT, PATCH) | `Users`<br>`Roles`<br>`UserRoles` | `UserListPage`<br>`UserFormPage` | ADMIN | HU-ADMIN-01, HU-ADMIN-02 |
| RF-03 | Gestión de Roles | `RolesModule` | `/api/roles`<br>(GET, POST, PUT) | `Roles`<br>`Permissions`<br>`UserRoles` | `RolesPage` | ADMIN | HU-ADMIN-01 |
| RF-04 | Gestión de Membresías | `MembershipsModule` | `/api/memberships`<br>`/api/payment-plans` | `PlanMembresia`<br>`Membresia` | `MembershipsPage`<br>`PlansPage` | ADMIN, MIEMBRO | HU-ADMIN-03, HU-MIE-01 |
| RF-05 | Gestión de Pagos | `PaymentsModule` | `/api/payments`<br>(GET, POST, PATCH) | `Pago` | `PaymentsPage`<br>`PaymentFormPage` | CONTADOR, MIEMBRO | HU-CONT-01, HU-CONT-02, HU-CONT-03, HU-MIE-01 |
| RF-06 | Gestión de Comprobantes | `ReceiptsModule` | `/api/receipts`<br>(POST, GET) | `ComprobantePago` | `ReceiptUploadPage` | MIEMBRO, CONTADOR | HU-MIE-02, HU-CONT-04 |
| RF-07 | Registro de Asistencia | `AttendanceModule` | `/api/attendance`<br>(GET, POST) | `Asistencia`<br>`ParticipanteEntrenamiento` | `AttendancePage` | ENTRENADOR | HU-ENT-02 |
| RF-08 | Gestión de Entrenamientos | `TrainingModule` | `/api/training`<br>(GET, POST, PUT, DELETE) | `Entrenamiento`<br>`ParticipanteEntrenamiento` | `TrainingListPage`<br>`TrainingFormPage` | ADMIN, ENTRENADOR | HU-ENT-01 |
| RF-09 | Gestión de Competencias | `CompetitionsModule` | `/api/competitions`<br>(GET, POST, PUT, DELETE) | `Competencia` | `CompetitionsPage`<br>`CompetitionFormPage` | ADMIN | HU-ADMIN-05 |
| RF-10 | Inscripciones a Competencias | `RegistrationsModule` | `/api/registrations`<br>(GET, POST, DELETE) | `InscripcionCompetencia` | `RegistrationsPage` | MIEMBRO, ADMIN | HU-MIE-03 |
| RF-11 | Evaluaciones de Desempeño | `EvaluationsModule` | `/api/evaluations`<br>(GET, POST, PUT) | `EvaluacionCompetencia` | `EvaluationsPage` | ENTRENADOR, MIEMBRO | HU-ENT-03, HU-MIE-05 |
| RF-12 | Reportes del Sistema | `ReportsModule` | `/api/reports`<br>(GET) | Múltiples | `ReportsPage` | ADMIN, CONTADOR | HU-ADMIN-04, HU-CONT-05 |
| RF-13 | Consultas Personales | `MemberDashboardModule` | `/api/users/me`<br>`/api/payments/my`<br>`/api/memberships/my` | `Users`<br>`Pago`<br>`Membresia`<br>`InscripcionCompetencia` | `MemberDashboardPage` | MIEMBRO | HU-MIE-04, HU-MIE-05 |

---

## 4. Cobertura de Roles por RF

> **⚠️ Importante:** La tabla siguiente muestra qué roles del sistema tienen acceso a cada Requisito Funcional. ✅ indica acceso permitido, ❌ indica sin acceso.

| ID RF | Nombre RF | ADMIN | CONTADOR | ENTRENADOR | MIEMBRO |
|:-----:|-----------|:-----:|:--------:|:----------:|:-------:|
| RF-01 | Autenticación | ✅ | ✅ | ✅ | ✅ |
| RF-02 | Gestión de Usuarios | ✅ | ❌ | ❌ | ❌ |
| RF-03 | Gestión de Roles | ✅ | ❌ | ❌ | ❌ |
| RF-04 | Gestión de Membresías | ✅ | ❌ | ❌ | ✅ |
| RF-05 | Gestión de Pagos | ❌ | ✅ | ❌ | ✅ |
| RF-06 | Gestión de Comprobantes | ❌ | ✅ | ❌ | ✅ |
| RF-07 | Registro de Asistencia | ❌ | ❌ | ✅ | ❌ |
| RF-08 | Gestión de Entrenamientos | ✅ | ❌ | ✅ | ❌ |
| RF-09 | Gestión de Competencias | ✅ | ❌ | ❌ | ❌ |
| RF-10 | Inscripciones a Competencias | ✅ | ❌ | ❌ | ✅ |
| RF-11 | Evaluaciones de Desempeño | ❌ | ❌ | ✅ | ✅ |
| RF-12 | Reportes del Sistema | ✅ | ✅ | ❌ | ❌ |
| RF-13 | Consultas Personales | ❌ | ❌ | ❌ | ✅ |

### 4.1 Resumen de Accesos por Rol

| Rol | Total RF con Acceso | RFs Permitidos |
|-----|:-------------------:|----------------|
| **ADMIN** | 8 | RF-01, RF-02, RF-03, RF-04, RF-08, RF-09, RF-10, RF-12 |
| **CONTADOR** | 4 | RF-01, RF-05, RF-06, RF-12 |
| **ENTRENADOR** | 4 | RF-01, RF-07, RF-08, RF-11 |
| **MIEMBRO** | 7 | RF-01, RF-04, RF-05, RF-06, RF-10, RF-11, RF-13 |

---

## 5. Pruebas de Aceptación por RF

> **💡 Tip:** Cada criterio de aceptación debe ser verificado antes de considerar el RF como implementado. Las pruebas E2E simulan flujos de usuario completos en entorno de integración.

| ID RF | Criterio de Aceptación Principal | Prueba Relacionada | Tipo de Prueba |
|:-----:|----------------------------------|-------------------|:--------------:|
| RF-01 | El sistema autentica correctamente al usuario con credenciales válidas y rechaza las inválidas. El token JWT debe expirar según la configuración definida. | `auth.e2e-spec.ts`<br>`auth.service.spec.ts` | E2E / Unitaria |
| RF-02 | El administrador puede crear, editar, desactivar y listar usuarios. Los cambios se reflejan en tiempo real en la vista de lista. | `users.e2e-spec.ts`<br>`users.controller.spec.ts` | E2E / Unitaria |
| RF-03 | El administrador puede asignar y revocar roles a usuarios. Los permisos se actualizan inmediatamente sin necesidad de re-login. | `roles.e2e-spec.ts` | E2E |
| RF-04 | El sistema registra y actualiza membresías correctamente. El miembro visualiza su membresía activa y la fecha de vencimiento. | `memberships.e2e-spec.ts`<br>`memberships.service.spec.ts` | E2E / Integración |
| RF-05 | El contador puede registrar pagos y el miembro puede visualizar su historial. Los pagos pendientes generan alertas en el dashboard. | `payments.e2e-spec.ts`<br>`payments.service.spec.ts` | E2E / Unitaria |
| RF-06 | El miembro puede subir un comprobante de pago. El contador recibe la notificación y puede aprobar o rechazar el comprobante. | `receipts.e2e-spec.ts` | E2E |
| RF-07 | El entrenador registra asistencia de participantes en un entrenamiento. El sistema guarda la fecha, hora y estado de asistencia. | `attendance.e2e-spec.ts`<br>`attendance.service.spec.ts` | E2E / Unitaria |
| RF-08 | El administrador y entrenador pueden crear, modificar y eliminar entrenamientos. Los participantes asignados reciben notificación. | `training.e2e-spec.ts` | E2E |
| RF-09 | El administrador puede gestionar el ciclo completo de una competencia (crear, publicar, cerrar). Los datos se persisten correctamente. | `competitions.e2e-spec.ts`<br>`competitions.service.spec.ts` | E2E / Unitaria |
| RF-10 | El miembro puede inscribirse y desinscribirse de competencias disponibles. El sistema valida cupos disponibles antes de confirmar la inscripción. | `registrations.e2e-spec.ts` | E2E |
| RF-11 | El entrenador puede registrar evaluaciones de desempeño. El miembro puede consultar sus evaluaciones históricas desde su dashboard. | `evaluations.e2e-spec.ts`<br>`evaluations.service.spec.ts` | E2E / Integración |
| RF-12 | El sistema genera reportes exportables (PDF/CSV) de pagos, asistencias y membresías. Los datos coinciden con los registros de la BD. | `reports.e2e-spec.ts` | E2E / Integración |
| RF-13 | El miembro accede a su dashboard personal con información consolidada de membresía, pagos e inscripciones activas actualizadas. | `member-dashboard.e2e-spec.ts` | E2E |

---

## 6. Glosario

| Término | Descripción |
|---------|-------------|
| **RF** | Requisito Funcional |
| **HU** | Historia de Usuario |
| **BD** | Base de Datos |
| **E2E** | Prueba de extremo a extremo (End-to-End) |
| **JWT** | JSON Web Token – mecanismo de autenticación stateless |
| **REST** | Representational State Transfer – estilo arquitectónico de APIs |
| **ADMIN** | Rol de Administrador del sistema |
| **CONTADOR** | Rol de Contador / Gestor financiero |
| **ENTRENADOR** | Rol de Entrenador deportivo |
| **MIEMBRO** | Rol de Miembro / Atleta del club |

---

*Documento generado el: 2026-09-01 | Proyecto: SPORTIFY CLUB MANAGER | Versión: 1.2*
