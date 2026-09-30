# Reglas de Negocio — SPORTIFY CLUB MANAGER

## Introducción

Las reglas de negocio definen las condiciones y restricciones bajo las cuales opera el sistema. Estas reglas son invariantes y deben ser aplicadas tanto en el **frontend** (para experiencia de usuario) como en el **backend** (como única fuente de verdad de seguridad).

---

## Catálogo de Reglas de Negocio

| ID    | Nombre                                    | Descripción                                                                                       | Módulos Afectados           |
|-------|-------------------------------------------|---------------------------------------------------------------------------------------------------|-----------------------------|
| RN-01 | Correo único por usuario activo           | Un correo electrónico no puede pertenecer a dos usuarios activos simultáneamente.                 | Auth, Usuarios              |
| RN-02 | Bloqueo de usuario inactivo               | Un usuario desactivado no puede autenticarse en el sistema.                                       | Auth                        |
| RN-03 | Restricción de inscripción por morosidad  | Un miembro con membresía vencida o estado moroso no puede inscribirse a competencias.             | Inscripciones, Competencias |
| RN-04 | Aprobación de pago activa membresía       | Al aprobar un pago, el sistema debe activar o renovar la membresía correspondiente automáticamente.| Pagos, Membresías           |
| RN-05 | Rechazo de pago requiere comentario       | Un pago solo puede rechazarse si se proporciona un comentario explicativo obligatorio.            | Pagos                       |
| RN-06 | Borrado lógico para registros críticos    | Los registros críticos (usuarios, pagos, membresías, competencias, entrenamientos) no se eliminan físicamente; se marcan como inactivos.| Todos los módulos |
| RN-07 | Control de usuarios exclusivo del ADMIN   | Solo el rol ADMIN puede crear, editar, activar y desactivar usuarios.                             | Usuarios                    |
| RN-08 | Validación de pagos exclusiva del CONTADOR| Solo el rol CONTADOR puede aprobar o rechazar pagos y visualizar comprobantes.                    | Pagos, Comprobantes         |
| RN-09 | Asistencia registrada por el ENTRENADOR   | Solo el ENTRENADOR responsable de una actividad puede registrar asistencia en ella.               | Asistencia, Entrenamientos  |
| RN-10 | Comprobantes cargados solo por el MIEMBRO | Solo el MIEMBRO puede cargar el comprobante de su propio pago.                                    | Comprobantes                |

---

## Detalle por Regla

### RN-01 — Correo único por usuario activo

**Condición:**
```
SELECT COUNT(*) FROM usuarios 
WHERE correo = :correo AND activo = true
```
Si COUNT > 0, rechazar el registro o actualización.

**Aplicación:**
- Backend: Validación en `UserService.CreateUser()` antes de insertar
- Base de datos: Índice UNIQUE en `usuarios.correo` (solo para activos mediante lógica de aplicación)
- Frontend: Mensaje de error descriptivo

---

### RN-02 — Bloqueo de usuario inactivo

**Condición:** Al intentar login:
```
IF usuario.activo = false → Retornar 401 Unauthorized con mensaje "Cuenta desactivada"
```

**Aplicación:**
- Backend: Validación en `AuthService.Login()` tras verificar contraseña
- No debe revelar si el correo existe o no (seguridad)

---

### RN-03 — Restricción de inscripción por morosidad

**Condición:** Antes de inscribir a un miembro en una competencia:
```
SELECT estado FROM membresias 
WHERE usuario_id = :id 
ORDER BY fecha_fin DESC 
LIMIT 1
```
Si `estado != 'ACTIVA'`, rechazar inscripción.

**Aplicación:**
- Backend: Validación en `RegistrationService.CreateRegistration()`
- Frontend: Deshabilitar botón de inscripción si membresía no está activa

---

### RN-04 — Aprobación de pago activa membresía

**Flujo al aprobar pago:**
1. Verificar que el pago está en estado `PENDIENTE`
2. Cambiar estado del pago a `APROBADO`
3. Buscar membresía asociada
4. Calcular nueva `fecha_fin` (fecha actual + días del plan)
5. Cambiar estado de la membresía a `ACTIVA`
6. Todo en una transacción de base de datos

```csharp
// Ejemplo de implementación en PaymentService
using var transaction = await _context.Database.BeginTransactionAsync();
pago.Estado = EstadoPago.APROBADO;
membresia.Estado = EstadoMembresia.ACTIVA;
membresia.FechaInicio = DateTime.Today;
membresia.FechaFin = DateTime.Today.AddDays(plan.DuracionDias);
await _context.SaveChangesAsync();
await transaction.CommitAsync();
```

---

### RN-05 — Rechazo de pago requiere comentario

**Validación:**
```
IF comentario == null || comentario.Trim() == "" → Error de validación
```

**Aplicación:**
- Backend: Validación en `RejectPaymentDto` con `[Required]` y `[MinLength(10)]`
- Frontend: Campo de comentario obligatorio en modal de rechazo

---

### RN-06 — Borrado lógico

**Implementación en todas las entidades críticas:**
```csharp
// En lugar de eliminar:
entidad.Activo = false;
entidad.ActualizadoEn = DateTime.UtcNow;
await _context.SaveChangesAsync();
```

**Entidades con borrado lógico:**
- `usuarios` → campo `activo`
- `pagos` → campo `activo`
- `membresias` → campo `estado`
- `competencias` → campo `activo`
- `entrenamientos` → campo `activo`
- `planes_membresia` → campo `activo`

---

### RN-07 a RN-10 — Control de acceso por rol

Implementado mediante atributos de autorización en ASP .NET Core:

```csharp
[Authorize(Roles = "ADMIN")]           // RN-07
public class UsersController { }

[Authorize(Roles = "CONTADOR")]        // RN-08
public class PaymentsController { }

[Authorize(Roles = "ENTRENADOR")]      // RN-09
public class AttendanceController { }

// RN-10: validado en lógica de negocio comparando usuario del JWT con pago.UsuarioId
```

---

## Matriz Regla → Implementación

| Regla | Backend (Service)       | Backend (Controller) | Frontend (UI)              | BD (Constraint)     |
|-------|-------------------------|----------------------|----------------------------|---------------------|
| RN-01 | UserService             | UsersController      | Mensaje de error           | Índice UNIQUE       |
| RN-02 | AuthService             | AuthController       | Mensaje "Cuenta inactiva"  | —                   |
| RN-03 | RegistrationService     | RegistrationsCtrl    | Botón deshabilitado        | —                   |
| RN-04 | PaymentService          | PaymentsController   | Toast "Membresía activada" | Transacción SQL     |
| RN-05 | PaymentService          | PaymentsController   | Campo obligatorio          | —                   |
| RN-06 | Todos los Services      | Todos los Controllers| No aplica                  | Columna `activo`    |
| RN-07 | UserService             | [Authorize(ADMIN)]   | Menú oculto               | —                   |
| RN-08 | PaymentService          | [Authorize(CONTADOR)]| Menú oculto               | —                   |
| RN-09 | AttendanceService       | [Authorize(ENTREN.)] | Menú oculto               | —                   |
| RN-10 | ReceiptService          | ReceiptsController   | Solo su pago               | —                   |
