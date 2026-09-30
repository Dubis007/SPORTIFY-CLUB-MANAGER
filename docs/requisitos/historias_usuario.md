# 📋 Historias de Usuario – SPORTIFY CLUB MANAGER

> **Proyecto:** SPORTIFY CLUB MANAGER
> **Fecha de creación:** 2026-09-01
> **Metodología:** Desarrollo Ágil – SCRUM
> **Estado:** En construcción 🚧

---

## 📖 Introducción

Este documento recopila las **Historias de Usuario** del sistema **SPORTIFY CLUB MANAGER**, definidas bajo el enfoque de la metodología ágil **SCRUM**. Las historias de usuario describen funcionalidades desde la perspectiva del usuario final, con el objetivo de guiar el desarrollo incremental e iterativo del sistema.

Cada historia sigue el formato estándar ágil:

> _"Como **[ROL]**, quiero **[ACCIÓN]**, para **[BENEFICIO]**."_

Los **criterios de aceptación** son condiciones verificables que deben cumplirse para considerar una historia como completada (definición de "Done"). Este documento es un artefacto vivo que se actualiza conforme avance el proyecto.

---

## 🗂️ Control de Versiones

| Versión | Fecha       | Autor              | Descripción del cambio                          |
|---------|-------------|--------------------|-------------------------------------------------|
| 1.0     | 2026-09-01  | Equipo de proyecto | Versión inicial con historias de los 4 roles    |
| 1.1     | —           | —                  | Revisión y ajuste de criterios de aceptación    |
| 1.2     | —           | —                  | Incorporación de feedback del cliente           |

---

## 👥 Roles del Sistema

| Ícono | Rol          | Descripción                                                    |
|-------|--------------|----------------------------------------------------------------|
| 🔑    | ADMIN        | Administrador general del sistema y del club                   |
| 💰    | CONTADOR     | Responsable de la gestión y verificación de pagos              |
| 🏋️    | ENTRENADOR   | Responsable de sesiones de entrenamiento y evaluaciones        |
| 🏃    | MIEMBRO      | Deportista inscrito al club, usuario principal del sistema     |

---

---

## 🔑 ROL: ADMIN (Administrador)

> El **Administrador** es el usuario con mayor nivel de acceso al sistema. Gestiona usuarios, planes, reportes y eventos del club.

---

### HU-ADMIN-01 — Registrar nuevos usuarios

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ADMIN-01                                                             |
| **Rol**         | ADMIN                                                                   |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 1                                                                |

**Historia:**
> _Como **ADMIN**, quiero **registrar nuevos usuarios en el sistema**, para que **puedan acceder con sus credenciales**._

**Criterios de aceptación:**

- ✅ **CA-01:** El formulario valida que el correo electrónico sea único en el sistema; no se permite duplicados.
- ✅ **CA-02:** Al crear el usuario, se asigna obligatoriamente un rol (ADMIN, CONTADOR, ENTRENADOR o MIEMBRO).
- ✅ **CA-03:** El usuario recibe un correo electrónico de confirmación con sus credenciales iniciales.
- ✅ **CA-04:** El sistema muestra un mensaje de error claro si el correo ya existe en la base de datos.

---

### HU-ADMIN-02 — Activar y desactivar usuarios

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ADMIN-02                                                             |
| **Rol**         | ADMIN                                                                   |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 1                                                                |

**Historia:**
> _Como **ADMIN**, quiero **activar y desactivar usuarios**, para **controlar el acceso al sistema**._

**Criterios de aceptación:**

- ✅ **CA-01:** El cambio de estado (activo/inactivo) se refleja en tiempo real en el sistema.
- ✅ **CA-02:** Un usuario con estado **INACTIVO** no puede iniciar sesión; el sistema muestra un mensaje explicativo.
- ✅ **CA-03:** Cada acción de activación/desactivación queda registrada en el log del sistema con fecha, hora y el ADMIN que realizó la acción.

---

### HU-ADMIN-03 — Gestionar planes de membresía

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ADMIN-03                                                             |
| **Rol**         | ADMIN                                                                   |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 2                                                                |

**Historia:**
> _Como **ADMIN**, quiero **gestionar los planes de membresía (crear, editar, eliminar)**, para **mantener la oferta del club actualizada**._

**Criterios de aceptación:**

- ✅ **CA-01:** Cada plan puede configurarse con precio y duración variables (mensual, trimestral, anual, etc.).
- ✅ **CA-02:** No se permite eliminar un plan que tenga membresías activas asociadas; el sistema muestra advertencia.
- ✅ **CA-03:** Al editar un plan, los cambios no afectan a las membresías ya vigentes, solo a las nuevas.
- ✅ **CA-04:** Se listan todos los planes con su nombre, precio, duración y estado (activo/inactivo).

---

### HU-ADMIN-04 — Generar reportes del sistema en PDF

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ADMIN-04                                                             |
| **Rol**         | ADMIN                                                                   |
| **Prioridad**   | 🟡 Media                                                                |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 3                                                                |

**Historia:**
> _Como **ADMIN**, quiero **generar reportes del sistema en PDF**, para **tener evidencia de la operación del club**._

**Criterios de aceptación:**

- ✅ **CA-01:** El sistema permite seleccionar un rango de fechas personalizado para el reporte.
- ✅ **CA-02:** Se ofrecen al menos tres tipos de reporte: **pagos**, **asistencia** e **inscripciones**.
- ✅ **CA-03:** El PDF generado incluye el logo del club, fecha de generación, nombre del reporte y datos estructurados en tablas.
- ✅ **CA-04:** El archivo PDF se descarga automáticamente en el dispositivo del usuario.

---

### HU-ADMIN-05 — Gestionar competencias deportivas

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ADMIN-05                                                             |
| **Rol**         | ADMIN                                                                   |
| **Prioridad**   | 🟡 Media                                                                |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 3                                                                |

**Historia:**
> _Como **ADMIN**, quiero **gestionar competencias**, para **organizar eventos deportivos del club**._

**Criterios de aceptación:**

- ✅ **CA-01:** Al crear una competencia se definen: nombre, fecha, sede, cupos máximos y descripción.
- ✅ **CA-02:** El ADMIN puede abrir o cerrar las inscripciones de una competencia en cualquier momento.
- ✅ **CA-03:** Se puede consultar en todo momento la lista de miembros inscritos a cada competencia.
- ✅ **CA-04:** Cuando se alcanza el cupo máximo, las inscripciones se cierran automáticamente.

---
---

## 💰 ROL: CONTADOR

> El **Contador** es el encargado de la gestión financiera del club: revisión, aprobación y rechazo de pagos, y generación de reportes contables.

---

### HU-CONT-01 — Ver pagos pendientes de aprobación

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-CONT-01                                                              |
| **Rol**         | CONTADOR                                                                |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 1                                                                |

**Historia:**
> _Como **CONTADOR**, quiero **ver todos los pagos pendientes de aprobación**, para **procesarlos oportunamente**._

**Criterios de aceptación:**

- ✅ **CA-01:** La lista de pagos pendientes es filtrable por rango de fechas y por nombre/documento del miembro.
- ✅ **CA-02:** Cada registro indica visualmente si el pago tiene un comprobante adjunto o no.
- ✅ **CA-03:** La lista está paginada correctamente (máximo 20 registros por página) y muestra el total de pendientes.

---

### HU-CONT-02 — Aprobar un pago con comprobante verificado

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-CONT-02                                                              |
| **Rol**         | CONTADOR                                                                |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 2                                                                |

**Historia:**
> _Como **CONTADOR**, quiero **aprobar un pago con comprobante verificado**, para **que la membresía del miembro se active**._

**Criterios de aceptación:**

- ✅ **CA-01:** El botón de aprobación solo está habilitado si el pago tiene un comprobante adjunto y válido.
- ✅ **CA-02:** Al aprobar el pago, la membresía del miembro se activa automáticamente con la fecha de inicio correspondiente.
- ✅ **CA-03:** El miembro recibe una notificación (correo o notificación interna) informando que su pago fue aprobado y su membresía está activa.

---

### HU-CONT-03 — Rechazar un pago con comentario obligatorio

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-CONT-03                                                              |
| **Rol**         | CONTADOR                                                                |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 2                                                                |

**Historia:**
> _Como **CONTADOR**, quiero **rechazar un pago con un comentario obligatorio**, para **informar al miembro el motivo del rechazo**._

**Criterios de aceptación:**

- ✅ **CA-01:** El campo de comentario/motivo de rechazo es **obligatorio**; no es posible rechazar sin completarlo.
- ✅ **CA-02:** El pago rechazado queda registrado con estado **RECHAZADO** y el comentario del contador.
- ✅ **CA-03:** El miembro puede consultar en su perfil el motivo del rechazo asociado a ese pago.

---

### HU-CONT-04 — Ver y descargar comprobante de pago

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-CONT-04                                                              |
| **Rol**         | CONTADOR                                                                |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 2                                                                |

**Historia:**
> _Como **CONTADOR**, quiero **ver y descargar el comprobante de pago adjunto**, para **verificar su autenticidad**._

**Criterios de aceptación:**

- ✅ **CA-01:** Los formatos de comprobante aceptados son: **JPG**, **PNG** y **PDF**.
- ✅ **CA-02:** El comprobante puede previsualizarse directamente en el navegador sin necesidad de descargarlo.
- ✅ **CA-03:** Existe un botón de descarga que permite guardar el comprobante en el dispositivo del contador.

---

### HU-CONT-05 — Generar reportes financieros por período

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-CONT-05                                                              |
| **Rol**         | CONTADOR                                                                |
| **Prioridad**   | 🟡 Media                                                                |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 3                                                                |

**Historia:**
> _Como **CONTADOR**, quiero **generar reportes financieros de pagos por período**, para **rendición de cuentas**._

**Criterios de aceptación:**

- ✅ **CA-01:** El reporte puede filtrarse por estado de pago (PENDIENTE, APROBADO, RECHAZADO) y por rango de fechas.
- ✅ **CA-02:** El reporte se exporta en formato **PDF** e incluye totales por estado y el total general del período.
- ✅ **CA-03:** El reporte incluye: fecha de pago, nombre del miembro, plan, monto y estado de cada transacción.

---
---

## 🏋️ ROL: ENTRENADOR

> El **Entrenador** gestiona sus sesiones de entrenamiento, registra asistencia y evalúa el desempeño de los miembros a su cargo.

---

### HU-ENT-01 — Ver sesiones de entrenamiento asignadas

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ENT-01                                                              |
| **Rol**         | ENTRENADOR                                                              |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 2                                                                |

**Historia:**
> _Como **ENTRENADOR**, quiero **ver mis sesiones de entrenamiento asignadas**, para **planificar mi agenda**._

**Criterios de aceptación:**

- ✅ **CA-01:** Las sesiones pueden visualizarse en formato de calendario por semana o por mes.
- ✅ **CA-02:** Al seleccionar una sesión se muestran los detalles: sede, tipo de entrenamiento, hora y duración.
- ✅ **CA-03:** Se visualiza la lista de participantes inscritos a cada sesión.

---

### HU-ENT-02 — Registrar asistencia a entrenamientos

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ENT-02                                                              |
| **Rol**         | ENTRENADOR                                                              |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 2                                                                |

**Historia:**
> _Como **ENTRENADOR**, quiero **registrar la asistencia de los miembros a mis entrenamientos**, para **llevar control de participación**._

**Criterios de aceptación:**

- ✅ **CA-01:** Se muestra la lista de participantes inscritos con un checkbox de presencia (Presente / Ausente).
- ✅ **CA-02:** Un entrenador solo puede registrar asistencia de las sesiones que están asignadas a él.
- ✅ **CA-03:** La asistencia solo puede registrarse **una vez** por sesión; intentos posteriores muestran un aviso.

---

### HU-ENT-03 — Registrar evaluaciones de desempeño

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ENT-03                                                              |
| **Rol**         | ENTRENADOR                                                              |
| **Prioridad**   | 🟡 Media                                                                |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 3                                                                |

**Historia:**
> _Como **ENTRENADOR**, quiero **registrar evaluaciones de desempeño de los miembros**, para **hacer seguimiento de su progreso**._

**Criterios de aceptación:**

- ✅ **CA-01:** La evaluación incluye un puntaje numérico del **1 al 10** para distintos aspectos (resistencia, técnica, actitud).
- ✅ **CA-02:** Existe un campo de texto libre de **observaciones** para comentarios cualitativos del entrenador.
- ✅ **CA-03:** El miembro evaluado puede consultar su evaluación desde su perfil en el sistema.

---

### HU-ENT-04 — Ver historial de asistencia de miembros

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-ENT-04                                                              |
| **Rol**         | ENTRENADOR                                                              |
| **Prioridad**   | 🟡 Media                                                                |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 3                                                                |

**Historia:**
> _Como **ENTRENADOR**, quiero **ver el historial de asistencia de cada miembro**, para **identificar patrones de participación**._

**Criterios de aceptación:**

- ✅ **CA-01:** El historial puede filtrarse por período (semana, mes, rango personalizado).
- ✅ **CA-02:** El sistema calcula y muestra automáticamente el **porcentaje de asistencia** en el período seleccionado.
- ✅ **CA-03:** Se diferencia visualmente entre sesiones asistidas, ausencias justificadas y ausencias sin justificar.

---
---

## 🏃 ROL: MIEMBRO

> El **Miembro** es el deportista inscrito al club. Gestiona sus pagos, se inscribe a eventos y consulta su progreso.

---

### HU-MIE-01 — Registrar pago de membresía

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-MIE-01                                                              |
| **Rol**         | MIEMBRO                                                                 |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 1                                                                |

**Historia:**
> _Como **MIEMBRO**, quiero **registrar el pago de mi membresía**, para **mantener mi acceso activo al club**._

**Criterios de aceptación:**

- ✅ **CA-01:** Al registrar el pago, el miembro selecciona el plan de membresía al que corresponde el pago.
- ✅ **CA-02:** El miembro ingresa el monto pagado y la fecha de pago.
- ✅ **CA-03:** El pago queda en estado **PENDIENTE** hasta que el Contador lo revise y apruebe o rechace.

---

### HU-MIE-02 — Cargar comprobante de pago

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-MIE-02                                                              |
| **Rol**         | MIEMBRO                                                                 |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 1                                                                |

**Historia:**
> _Como **MIEMBRO**, quiero **cargar mi comprobante de pago en imagen o PDF**, para **que el contador pueda verificarlo**._

**Criterios de aceptación:**

- ✅ **CA-01:** Los formatos aceptados son **JPG**, **PNG** y **PDF**, con un tamaño máximo de **5 MB** por archivo.
- ✅ **CA-02:** Un miembro solo puede cargar y ver su propio comprobante; no tiene acceso a los de otros miembros.
- ✅ **CA-03:** El archivo se almacena de forma segura en el servidor y solo es accesible para el miembro y el Contador.

---

### HU-MIE-03 — Inscribirse a competencias disponibles

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-MIE-03                                                              |
| **Rol**         | MIEMBRO                                                                 |
| **Prioridad**   | 🟡 Media                                                                |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 3                                                                |

**Historia:**
> _Como **MIEMBRO**, quiero **inscribirme a competencias disponibles**, para **participar en eventos del club**._

**Criterios de aceptación:**

- ✅ **CA-01:** Solo pueden inscribirse los miembros que **no tengan pagos morosos** pendientes de aprobación.
- ✅ **CA-02:** Si la competencia ha alcanzado su cupo máximo, el botón de inscripción se deshabilita con mensaje informativo.
- ✅ **CA-03:** Al inscribirse exitosamente, el miembro recibe una confirmación por correo o notificación en el sistema.

---

### HU-MIE-04 — Ver historial de pagos y su estado

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-MIE-04                                                              |
| **Rol**         | MIEMBRO                                                                 |
| **Prioridad**   | 🔴 Alta                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 2                                                                |

**Historia:**
> _Como **MIEMBRO**, quiero **ver mi historial de pagos y el estado de cada uno**, para **hacer seguimiento de mis obligaciones financieras**._

**Criterios de aceptación:**

- ✅ **CA-01:** La lista muestra cada pago con su estado: **PENDIENTE** 🕐, **APROBADO** ✅ o **RECHAZADO** ❌.
- ✅ **CA-02:** Si un pago fue rechazado, el miembro puede ver el motivo/comentario registrado por el Contador.
- ✅ **CA-03:** Cada registro muestra la fecha de pago, la fecha de aprobación/rechazo y el plan asociado.

---

### HU-MIE-05 — Ver evaluaciones de desempeño

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| **ID**          | HU-MIE-05                                                              |
| **Rol**         | MIEMBRO                                                                 |
| **Prioridad**   | 🟢 Baja                                                                 |
| **Estado**      | 📝 Pendiente                                                            |
| **Sprint**      | Sprint 4                                                                |

**Historia:**
> _Como **MIEMBRO**, quiero **ver mis evaluaciones de desempeño registradas por mi entrenador**, para **conocer mi progreso deportivo**._

**Criterios de aceptación:**

- ✅ **CA-01:** Las evaluaciones se muestran en un historial ordenado cronológicamente (más reciente primero).
- ✅ **CA-02:** Cada evaluación muestra el puntaje numérico obtenido y las observaciones del entrenador.
- ✅ **CA-03:** El miembro puede identificar el entrenador que realizó la evaluación y la fecha de registro.

---
---

## 📊 Tabla de Priorización Global

> La prioridad se define con base en el valor de negocio, la urgencia y las dependencias entre historias.
>
> 🔴 **Alta** | 🟡 **Media** | 🟢 **Baja**

| ID            | Rol         | Historia (Resumen)                              | Prioridad   | Sprint   | Estado       |
|---------------|-------------|--------------------------------------------------|-------------|----------|--------------|
| HU-ADMIN-01   | ADMIN       | Registrar nuevos usuarios                        | 🔴 Alta     | Sprint 1 | 📝 Pendiente |
| HU-ADMIN-02   | ADMIN       | Activar y desactivar usuarios                    | 🔴 Alta     | Sprint 1 | 📝 Pendiente |
| HU-ADMIN-03   | ADMIN       | Gestionar planes de membresía                    | 🔴 Alta     | Sprint 2 | 📝 Pendiente |
| HU-ADMIN-04   | ADMIN       | Generar reportes del sistema en PDF              | 🟡 Media    | Sprint 3 | 📝 Pendiente |
| HU-ADMIN-05   | ADMIN       | Gestionar competencias deportivas                | 🟡 Media    | Sprint 3 | 📝 Pendiente |
| HU-CONT-01    | CONTADOR    | Ver pagos pendientes de aprobación               | 🔴 Alta     | Sprint 1 | 📝 Pendiente |
| HU-CONT-02    | CONTADOR    | Aprobar un pago con comprobante verificado       | 🔴 Alta     | Sprint 2 | 📝 Pendiente |
| HU-CONT-03    | CONTADOR    | Rechazar un pago con comentario obligatorio      | 🔴 Alta     | Sprint 2 | 📝 Pendiente |
| HU-CONT-04    | CONTADOR    | Ver y descargar comprobante de pago              | 🔴 Alta     | Sprint 2 | 📝 Pendiente |
| HU-CONT-05    | CONTADOR    | Generar reportes financieros por período         | 🟡 Media    | Sprint 3 | 📝 Pendiente |
| HU-ENT-01     | ENTRENADOR  | Ver sesiones de entrenamiento asignadas          | 🔴 Alta     | Sprint 2 | 📝 Pendiente |
| HU-ENT-02     | ENTRENADOR  | Registrar asistencia a entrenamientos            | 🔴 Alta     | Sprint 2 | 📝 Pendiente |
| HU-ENT-03     | ENTRENADOR  | Registrar evaluaciones de desempeño              | 🟡 Media    | Sprint 3 | 📝 Pendiente |
| HU-ENT-04     | ENTRENADOR  | Ver historial de asistencia de miembros          | 🟡 Media    | Sprint 3 | 📝 Pendiente |
| HU-MIE-01     | MIEMBRO     | Registrar pago de membresía                      | 🔴 Alta     | Sprint 1 | 📝 Pendiente |
| HU-MIE-02     | MIEMBRO     | Cargar comprobante de pago                       | 🔴 Alta     | Sprint 1 | 📝 Pendiente |
| HU-MIE-03     | MIEMBRO     | Inscribirse a competencias disponibles           | 🟡 Media    | Sprint 3 | 📝 Pendiente |
| HU-MIE-04     | MIEMBRO     | Ver historial de pagos y su estado               | 🔴 Alta     | Sprint 2 | 📝 Pendiente |
| HU-MIE-05     | MIEMBRO     | Ver evaluaciones de desempeño                    | 🟢 Baja     | Sprint 4 | 📝 Pendiente |

---

## 📈 Resumen Estadístico

| Prioridad     | Cantidad de Historias |
|---------------|----------------------|
| 🔴 Alta       | 12                   |
| 🟡 Media      | 6                    |
| 🟢 Baja       | 1                    |
| **Total**     | **19**               |

| Rol           | Cantidad de Historias |
|---------------|-----------------------|
| 🔑 ADMIN      | 5                     |
| 💰 CONTADOR   | 5                     |
| 🏋️ ENTRENADOR | 4                     |
| 🏃 MIEMBRO    | 5                     |
| **Total**     | **19**                |

---

## 📝 Notas y Convenciones

- **Estado inicial:** Todas las historias inician con estado `📝 Pendiente`. Los estados posibles son: `📝 Pendiente`, `🔄 En desarrollo`, `✅ Completada`, `🚫 Cancelada`.
- **Dependencias:** Las historias de Sprint 1 son prerrequisito para las de Sprints posteriores. En particular, HU-ADMIN-01 es base para todos los roles.
- **Revisión:** Este documento debe ser revisado al inicio de cada Sprint en la reunión de _Sprint Planning_.
- **Actualización:** Cualquier modificación debe registrarse en la tabla de Control de Versiones con autor y descripción del cambio.

---

*📄 Documento generado el 2026-09-01 | SPORTIFY CLUB MANAGER – Equipo de Desarrollo*