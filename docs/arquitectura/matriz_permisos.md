# 🔐 Matriz de Permisos por Rol – SPORTIFY CLUB MANAGER

> **Versión:** 1.0.0  
> **Fecha:** 2026-09-01  
> **Sistema:** Role-Based Access Control (RBAC)  
> **Proyecto:** SPORTIFY CLUB MANAGER

---

## 1. Introducción

El sistema de permisos de **SPORTIFY CLUB MANAGER** está basado en el modelo **RBAC (Role-Based Access Control)**, un esquema estándar de control de acceso donde los privilegios se asignan a *roles*, y los *roles* se asignan a *usuarios*. Este enfoque garantiza:

- **Principio de mínimo privilegio:** cada usuario accede únicamente a los recursos que su rol requiere.
- **Separación de responsabilidades:** las funciones financieras, operativas y administrativas están claramente delimitadas.
- **Escalabilidad:** nuevos roles o permisos pueden incorporarse sin reescribir la lógica de negocio existente.
- **Auditabilidad:** cada acción queda vinculada a un rol y un usuario, facilitando el rastreo de operaciones sensibles.

La implementación técnica se apoya en **ASP.NET Core** con políticas de autorización declarativas (`[Authorize(Policy = "...")]`), claims de identidad JWT y validaciones de negocio en la capa de servicios.

---

## 2. Descripción de Roles

| Ícono | Rol | Descripción General |
|-------|-----|---------------------|
| 👑 | **ADMIN** | Administrador del sistema. Posee control total sobre usuarios, sedes, entrenamientos, competencias y reportes. Es el único que puede gestionar la estructura del sistema. |
| 💰 | **CONTADOR** | Responsable financiero del club. Gestiona y valida pagos, aprueba o rechaza comprobantes de pago y genera reportes financieros detallados. |
| 🏋️ | **ENTRENADOR** | Profesional de entrenamiento. Gestiona sus propias sesiones, registra y corrige asistencia de sus grupos, y realiza evaluaciones de desempeño a los miembros. |
| 🧑‍🤝‍🧑 | **MIEMBRO** | Usuario final del club. Puede registrar y visualizar sus propios pagos, subir comprobantes, inscribirse a competencias disponibles y consultar su información personal. |

---

## 3. Tabla Principal de Permisos

> **Leyenda de símbolos:**
> - ✅ **Permitido** — Acceso completo al recurso o acción.
> - ❌ **Denegado** — Acceso completamente restringido.
> - 🔒 **Condicional** — Acceso parcial sujeto a reglas de negocio (ver Sección 5).

---

### 🔑 AUTENTICACIÓN

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Login | ✅ | ✅ | ✅ | ✅ |
| Recuperar contraseña | ✅ | ✅ | ✅ | ✅ |
| Renovar token (refresh) | ✅ | ✅ | ✅ | ✅ |

---

### 👥 GESTIÓN DE USUARIOS

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver lista de todos los usuarios | ✅ | ❌ | ❌ | ❌ |
| Crear usuario | ✅ | ❌ | ❌ | ❌ |
| Editar datos de usuario | ✅ | ❌ | ❌ | ❌ |
| Activar / Desactivar usuario | ✅ | ❌ | ❌ | ❌ |
| Ver perfil propio | ✅ | ✅ | ✅ | ✅ |

---

### 🏷️ GESTIÓN DE ROLES

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver lista de roles | ✅ | ❌ | ❌ | ❌ |
| Crear / Editar roles | ✅ | ❌ | ❌ | ❌ |
| Asignar roles a usuarios | ✅ | ❌ | ❌ | ❌ |

---

### 📋 PLANES DE MEMBRESÍA

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver planes disponibles | ✅ | ✅ | ✅ | ✅ |
| Crear / Editar / Eliminar planes | ✅ | ❌ | ❌ | ❌ |

---

### 🪪 MEMBRESÍAS

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver todas las membresías | ✅ | ✅ | ❌ | ❌ |
| Ver propia membresía | ✅ | ❌ | ❌ | ✅ |
| Crear membresía para un miembro | ✅ | ❌ | ❌ | ❌ |

---

### 💳 PAGOS

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver todos los pagos | ✅ | ✅ | ❌ | ❌ |
| Ver pagos propios | ❌ | ❌ | ❌ | ✅ |
| Registrar un pago | ❌ | ❌ | ❌ | ✅ |
| Aprobar pago | ❌ | ✅ | ❌ | ❌ |
| Rechazar pago | ❌ | ✅ | ❌ | ❌ |

---

### 🧾 COMPROBANTES DE PAGO

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Subir comprobante | ❌ | ❌ | ❌ | 🔒 (propio) |
| Ver / Descargar comprobante | ✅ | ✅ | ❌ | 🔒 (propio) |

---

### 🏃 ENTRENAMIENTOS

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver todos los entrenamientos | ✅ | ❌ | ✅ | ✅ |
| Crear / Editar entrenamiento | ✅ | ❌ | ❌ | ❌ |
| Eliminar entrenamiento | ✅ | ❌ | ❌ | ❌ |
| Inscribir participantes a sesión | ✅ | ❌ | ❌ | ❌ |

---

### 📅 ASISTENCIA

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver asistencia global (todas las sesiones) | ✅ | ❌ | 🔒 (propia sesión) | ❌ |
| Registrar asistencia | ❌ | ❌ | 🔒 (propia sesión) | ❌ |
| Corregir registro de asistencia | ❌ | ❌ | 🔒 (propia sesión) | ❌ |

---

### 🏆 COMPETENCIAS

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver competencias | ✅ | ✅ | ✅ | ✅ |
| Crear / Editar / Eliminar competencia | ✅ | ❌ | ❌ | ❌ |
| Cambiar estado de competencia | ✅ | ❌ | ❌ | ❌ |

---

### 📝 INSCRIPCIONES A COMPETENCIAS

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver todas las inscripciones | ✅ | ❌ | ❌ | ❌ |
| Ver propias inscripciones | ❌ | ❌ | ❌ | ✅ |
| Inscribirse a una competencia | ❌ | ❌ | ❌ | 🔒 (no moroso) |
| Cancelar inscripción | ✅ | ❌ | ❌ | 🔒 (propia) |

---

### 📊 EVALUACIONES

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver evaluaciones | ✅ | ❌ | ✅ | 🔒 (propias) |
| Crear evaluación | ❌ | ❌ | ✅ | ❌ |
| Editar evaluación | ❌ | ❌ | 🔒 (propia) | ❌ |

---

### 🏟️ SEDES

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Ver sedes disponibles | ✅ | ✅ | ✅ | ✅ |
| Crear / Editar sedes | ✅ | ❌ | ❌ | ❌ |
| Activar / Desactivar sede | ✅ | ❌ | ❌ | ❌ |

---

### 📈 REPORTES

| Módulo / Acción | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|----------------|:--------:|:-----------:|:-------------:|:---------:|
| Reportes de pagos e ingresos | ✅ | ✅ | ❌ | ❌ |
| Reportes de membresías | ✅ | ❌ | ❌ | ❌ |
| Reportes de asistencia | ✅ | ❌ | ✅ | ❌ |
| Reportes de competencias | ✅ | ❌ | ❌ | ❌ |

---

## 4. Implementación Técnica

La autorización se implementa en capas complementarias dentro de la arquitectura **ASP.NET Core Web API**:

| Nivel | Mecanismo | Descripción |
|-------|-----------|-------------|
| **Controlador** | `[Authorize(Roles = "ADMIN")]` | Restricción de acceso por rol directamente sobre el endpoint. |
| **Política** | `[Authorize(Policy = "SoloContador")]` | Políticas definidas en `Program.cs` con lógica compuesta (múltiples roles + claims). |
| **Claim JWT** | `ClaimTypes.Role` | El token JWT emitido incluye el claim `role` con el nombre del rol asignado. |
| **Servicio** | Validación en capa de negocio | Para permisos condicionales (🔒), la verificación de propiedad del recurso se realiza en la capa de servicios antes de ejecutar la operación. |
| **Middleware** | `UseAuthentication()` / `UseAuthorization()` | Pipeline de ASP.NET Core que valida el token antes de llegar al controlador. |

### Ejemplos de Implementación

```csharp
// ✅ Solo ADMIN puede listar usuarios
[Authorize(Roles = "ADMIN")]
[HttpGet("usuarios")]
public async Task<IActionResult> GetUsuarios() { ... }

// ✅ ADMIN y CONTADOR pueden ver pagos
[Authorize(Policy = "AdminOContador")]
[HttpGet("pagos")]
public async Task<IActionResult> GetPagos() { ... }

// 🔒 MIEMBRO solo puede ver sus propios pagos (validación en servicio)
[Authorize(Roles = "MIEMBRO")]
[HttpGet("pagos/mios")]
public async Task<IActionResult> GetMisPagos()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    return Ok(await _pagoService.GetPagosPorUsuario(userId));
}

// 🔒 ENTRENADOR solo puede registrar asistencia en su propia sesión
[Authorize(Roles = "ENTRENADOR")]
[HttpPost("asistencia/{sesionId}")]
public async Task<IActionResult> RegistrarAsistencia(int sesionId)
{
    var entrenadorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!await _sesionService.EsDueñoDeSesion(entrenadorId, sesionId))
        return Forbid();
    // ...
}
```

### Configuración de Políticas en `Program.cs`

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOContador", policy =>
        policy.RequireRole("ADMIN", "CONTADOR"));

    options.AddPolicy("SoloAdmin", policy =>
        policy.RequireRole("ADMIN"));

    options.AddPolicy("AdminOEntrenador", policy =>
        policy.RequireRole("ADMIN", "ENTRENADOR"));

    options.AddPolicy("TodosLosRoles", policy =>
        policy.RequireRole("ADMIN", "CONTADOR", "ENTRENADOR", "MIEMBRO"));
});
```

---

## 5. Permisos Condicionales (🔒)

Los permisos marcados con 🔒 no dependen únicamente del rol, sino también de condiciones de negocio evaluadas en tiempo de ejecución:

| Condición | Descripción | Roles afectados |
|-----------|-------------|-----------------|
| **Recurso propio** | El usuario solo puede acceder o modificar un recurso si es el propietario registrado (ej.: su pago, su comprobante, su inscripción). | MIEMBRO, ENTRENADOR |
| **Propia sesión** | El entrenador solo puede registrar o corregir asistencia en sesiones de entrenamiento que él mismo gestiona. La validación compara el `entrenadorId` de la sesión con el `userId` del token. | ENTRENADOR |
| **No moroso** | Un miembro solo puede inscribirse a competencias si no posee pagos vencidos o membresía en estado `DEUDOR`. La verificación consulta el estado financiero antes de registrar la inscripción. | MIEMBRO |
| **Propia evaluación** | Un entrenador puede editar únicamente las evaluaciones que él mismo creó, no las de otros entrenadores. | ENTRENADOR |
| **Propia inscripción** | Un miembro puede cancelar únicamente las inscripciones que le pertenecen. | MIEMBRO |

> **Nota de implementación:** Todas las validaciones condicionales se centralizan en la **capa de servicios** (`Services/`) y **nunca** se delegan al cliente. La API devuelve `403 Forbidden` cuando la condición no se cumple, incluso si el rol base tiene acceso parcial.

---

## 6. Matriz de Reglas de Negocio por Rol

| Regla de Negocio | 👑 ADMIN | 💰 CONTADOR | 🏋️ ENTRENADOR | 🧑 MIEMBRO |
|-----------------|:--------:|:-----------:|:-------------:|:---------:|
| Puede gestionar usuarios del sistema | ✅ | ❌ | ❌ | ❌ |
| Puede aprobar o rechazar transacciones financieras | ❌ | ✅ | ❌ | ❌ |
| Solo puede registrar pagos propios | ❌ | ❌ | ❌ | ✅ |
| Sus pagos requieren comprobante para aprobación | ❌ | ❌ | ❌ | ✅ |
| Puede crear y asignar entrenamientos | ✅ | ❌ | ❌ | ❌ |
| Solo gestiona sus propias sesiones de entrenamiento | ❌ | ❌ | ✅ | ❌ |
| Puede inscribir miembros manualmente a competencias | ✅ | ❌ | ❌ | ❌ |
| Solo puede inscribirse si está al día con pagos | ❌ | ❌ | ❌ | ✅ |
| Puede desactivar usuarios o sedes del sistema | ✅ | ❌ | ❌ | ❌ |
| Puede cerrar o cancelar competencias | ✅ | ❌ | ❌ | ❌ |
| Genera reportes financieros para auditoría | ✅ | ✅ | ❌ | ❌ |
| Genera reportes de asistencia de sus sesiones | ✅ | ❌ | ✅ | ❌ |
| Accede al sistema de evaluación de miembros | ✅ | ❌ | ✅ | 🔒 (lectura) |
| Recibe notificaciones de pagos pendientes | ❌ | ✅ | ❌ | ✅ |
| Puede ver el historial completo del club | ✅ | 🔒 (financiero) | 🔒 (entrenamiento) | ❌ |

---

## 7. Resumen Visual por Rol

```
┌─────────────────────────────────────────────────────────────┐
│                    RESUMEN DE ACCESO POR ROL                │
├──────────────┬──────────────────────────────────────────────┤
│  👑 ADMIN    │ Acceso total al sistema. Sin restricciones.  │
│              │ Único que puede configurar estructura base.  │
├──────────────┼──────────────────────────────────────────────┤
│ 💰 CONTADOR  │ Dominio financiero: pagos, comprobantes      │
│              │ y reportes de ingresos. Sin acceso operativo.│
├──────────────┼──────────────────────────────────────────────┤
│ 🏋️ENTRENADOR │ Dominio operativo: sus sesiones, asistencia  │
│              │ y evaluaciones propias. Sin acceso financiero│
├──────────────┼──────────────────────────────────────────────┤
│  🧑 MIEMBRO  │ Solo su información personal: pagos propios, │
│              │ membresía, comprobantes e inscripciones.     │
└──────────────┴──────────────────────────────────────────────┘
```

---

*Documento generado para el proyecto **SPORTIFY CLUB MANAGER** — Arquitectura del Sistema.*  
*Última actualización: 2026-09-01 | Responsable: Equipo de Arquitectura Backend.*
