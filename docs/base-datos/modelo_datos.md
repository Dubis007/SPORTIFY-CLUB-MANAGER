# Modelo de Datos - SPORTIFY CLUB MANAGER

> **Sistema de Gestion de Clubes Deportivos**
> Documento tecnico de referencia para el diseno y estructura de la base de datos.

---

## Control de Versiones

| Version | Fecha       | Autor           | Descripcion                                      |
|---------|-------------|-----------------|--------------------------------------------------|
| 1.0.0   | 2026-09-01  | Equipo Tecnico  | Version inicial del modelo de datos              |
| 1.1.0   | 2026-09-01  | Equipo Tecnico  | Incorporacion de entidades de evaluaciones       |
| 1.2.0   | 2026-09-01  | Equipo Tecnico  | Revision de relaciones y convenciones finales    |

---

## 1. Introduccion

### 1.1 Proposito del Documento

Este documento describe el modelo de datos completo del sistema **SPORTIFY CLUB MANAGER**, incluyendo todas las entidades, sus atributos, relaciones y restricciones de integridad referencial.

### 1.2 Tecnologias Utilizadas

| Componente             | Tecnologia                  |
|------------------------|-----------------------------|
| Motor de base de datos | **PostgreSQL 16**           |
| ORM                    | **Entity Framework Core 8** |
| Lenguaje de backend    | C# / .NET 8                 |
| Identificadores        | UUID v4 (tipo `uuid`)       |

### 1.3 Principios de Diseno

- **Borrado logico**: Las entidades criticas implementan `IsDeleted (bool)` y `DeletedAt (timestamp)` en lugar de eliminacion fisica. Esto preserva la integridad historica y la trazabilidad.
- **Auditoria de cambios**: Todas las entidades principales incluyen los campos `CreatedAt (timestamp, DEFAULT NOW())` y `UpdatedAt (timestamp)` para seguimiento temporal.
- **Herencia por tabla (TPT)**: Las entidades derivadas de `Users` (`Members`, `Trainers`, `Counters`, `Admins`) utilizan la estrategia *Table Per Type*, compartiendo el `Id` como clave primaria y foranea simultaneamente.
- **Normalizacion**: El diseno sigue la **3FN** (Tercera Forma Normal) para evitar redundancia.

---

## 2. Diagrama de Entidades y Relaciones

### 2.1 Vista General de Relaciones

```
+-----------------------------------------------------------------------+
|                        USUARIOS Y SEGURIDAD                           |
|                                                                       |
|  Users ----------< UserRoles >---------- Roles                        |
|    |                                        |                         |
|    |                                   RolPermiso                     |
|    |                                        |                         |
|    |                                   Permissions                    |
|    |                                                                   |
|    |  PasswordResetTokens -----------------------------(N:1 -> Users)  |
+----+------------------------------------------------------------------+
     |
     |   [Herencia TPT]
     +----------------------------------------------------------------+
     |                                                                |
     v                                                                v
  Members                                                         Trainers
     |                                                                |
     +--< Memberships >-- PaymentPlans                                +--< Trainings
     |         |                                                      |        |
     |         +--< Payments ---- PaymentReceipts                     |        +--< TrainingParticipants >-- Members
     |                                                                |        |
     |                                                                |        +--< Attendances (Training + Member)
     |                                                                |
     +--< CompetitionRegistrations >-- Competitions --------< CompetitionEvaluations
                                             |                           |
                                         Locations <--- Trainings        +-- Trainers
```

### 2.2 Relaciones Clave

| Entidad Origen          | Relacion | Entidad Destino            | Descripcion                                   |
|-------------------------|----------|----------------------------|-----------------------------------------------|
| `Users`                 | 1:N      | `UserRoles`                | Un usuario puede tener multiples roles        |
| `Roles`                 | M:N      | `Permissions`              | Via tabla intermedia `RolPermiso`             |
| `Members`               | 1:N      | `Memberships`              | Un miembro puede tener multiples membresias   |
| `Memberships`           | 1:N      | `Payments`                 | Una membresia genera multiples pagos          |
| `Payments`              | 1:1      | `PaymentReceipts`          | Un pago tiene a lo sumo un comprobante        |
| `Trainers`              | 1:N      | `Trainings`                | Un entrenador dirige multiples entrenamientos |
| `Trainings`             | M:N      | `Members`                  | Via `TrainingParticipants`                    |
| `Competitions`          | M:N      | `Members`                  | Via `CompetitionRegistrations`                |
| `Locations`             | 1:N      | `Trainings`                | Una sede alberga multiples entrenamientos     |
| `Locations`             | 1:N      | `Competitions`             | Una sede alberga multiples competencias       |

---

## 3. Entidades del Sistema

---

## Modulo: Usuarios y Seguridad

---

### 3.1 `Users` - Usuarios

**Descripcion:** Entidad central del sistema. Representa a cualquier persona con acceso a la plataforma, independientemente de su rol. Sirve como base para las entidades derivadas `Members`, `Trainers`, `Counters` y `Admins` mediante herencia TPT.

#### Campos

| Campo          | Tipo SQL        | Restriccion                            | Descripcion                                          |
|----------------|-----------------|----------------------------------------|------------------------------------------------------|
| `Id`           | `uuid`          | `PK`, `DEFAULT gen_random_uuid()`      | Identificador unico del usuario                      |
| `Nombre`       | `varchar(100)`  | `NOT NULL`                             | Nombre(s) del usuario                                |
| `Apellido`     | `varchar(100)`  | `NOT NULL`                             | Apellido(s) del usuario                              |
| `Email`        | `varchar(200)`  | `NOT NULL`, `UNIQUE`                   | Correo electronico, usado como credencial de acceso  |
| `PasswordHash` | `varchar(500)`  | `NOT NULL`                             | Hash seguro de la contrasena (bcrypt/argon2)         |
| `IsActive`     | `boolean`       | `NOT NULL`, `DEFAULT true`             | Indica si la cuenta esta habilitada                  |
| `IsDeleted`    | `boolean`       | `NOT NULL`, `DEFAULT false`            | Borrado logico                                       |
| `CreatedAt`    | `timestamp`     | `NOT NULL`, `DEFAULT NOW()`            | Fecha y hora de creacion del registro                |
| `UpdatedAt`    | `timestamp`     | `nullable`                             | Fecha y hora de la ultima actualizacion              |
| `DeletedAt`    | `timestamp`     | `nullable`                             | Fecha y hora del borrado logico                      |
| `SedeId`       | `uuid`          | `FK -> Locations.Id`, `nullable`       | Sede principal a la que pertenece el usuario         |

#### Relaciones

- **1 Usuario -> N `UserRoles`**: Un usuario puede tener asignados multiples roles.
- **1 Usuario -> 0-1 `Members`**: El usuario puede ser un miembro del club.
- **1 Usuario -> 0-1 `Trainers`**: El usuario puede ser un entrenador.
- **1 Usuario -> 0-1 `Counters`**: El usuario puede ser un contador.
- **1 Usuario -> 0-1 `Admins`**: El usuario puede ser un administrador.

---

### 3.2 `Roles` - Roles del Sistema

**Descripcion:** Define los roles disponibles dentro de la plataforma. Cada rol agrupa un conjunto de permisos y determina las acciones que puede realizar un usuario.

#### Campos

| Campo         | Tipo SQL       | Restriccion                           | Descripcion                                                                 |
|---------------|----------------|---------------------------------------|-----------------------------------------------------------------------------|
| `Id`          | `uuid`         | `PK`, `DEFAULT gen_random_uuid()`     | Identificador unico del rol                                                 |
| `Nombre`      | `varchar(50)`  | `NOT NULL`, `UNIQUE`                  | Nombre del rol. Valores: `ADMIN`, `CONTADOR`, `ENTRENADOR`, `MIEMBRO`       |
| `Descripcion` | `varchar(200)` | `nullable`                            | Descripcion detallada del proposito del rol                                 |
| `IsActive`    | `boolean`      | `NOT NULL`, `DEFAULT true`            | Indica si el rol esta habilitado en el sistema                              |

#### Relaciones

- **1 Rol -> N `UserRoles`**: Un rol puede estar asignado a multiples usuarios.
- **N Roles <-> N `Permissions`**: Relacion muchos a muchos via tabla intermedia `RolPermiso`.

---

### 3.3 `Permissions` - Permisos

**Descripcion:** Representa una accion especifica o acceso a un modulo del sistema. Los permisos se asignan a roles para controlar el acceso granular a las funcionalidades.

#### Campos

| Campo         | Tipo SQL        | Restriccion                         | Descripcion                                           |
|---------------|-----------------|-------------------------------------|-------------------------------------------------------|
| `Id`          | `uuid`          | `PK`, `DEFAULT gen_random_uuid()`   | Identificador unico del permiso                       |
| `Nombre`      | `varchar(100)`  | `NOT NULL`, `UNIQUE`                | Nombre tecnico del permiso (ej. `payments.approve`)   |
| `Descripcion` | `varchar(200)`  | `nullable`                          | Descripcion legible del permiso                       |
| `Modulo`      | `varchar(50)`   | `NOT NULL`                          | Modulo al que pertenece (ej. `pagos`, `membresias`)   |

#### Relaciones

- **N `Permissions` <-> N `Roles`**: Relacion muchos a muchos via tabla intermedia `RolPermiso`.

---

### 3.4 `UserRoles` - Asignacion Usuario-Rol

**Descripcion:** Tabla intermedia que implementa la relacion muchos a muchos entre usuarios y roles. Registra quien asigno el rol y cuando.

#### Campos

| Campo        | Tipo SQL    | Restriccion                          | Descripcion                                      |
|--------------|-------------|--------------------------------------|--------------------------------------------------|
| `UserId`     | `uuid`      | `PK`, `FK -> Users.Id`               | Referencia al usuario                            |
| `RoleId`     | `uuid`      | `PK`, `FK -> Roles.Id`               | Referencia al rol asignado                       |
| `AssignedAt` | `timestamp` | `NOT NULL`, `DEFAULT NOW()`          | Fecha y hora en que se realizo la asignacion     |
| `AssignedBy` | `uuid`      | `FK -> Users.Id`, `nullable`         | Usuario administrador que realizo la asignacion  |

> **Clave primaria compuesta**: (`UserId`, `RoleId`)

#### Relaciones

- Tabla intermedia M:N entre `Users` y `Roles`.

---

### 3.5 `PasswordResetTokens` - Tokens de Restablecimiento

**Descripcion:** Almacena los tokens temporales generados cuando un usuario solicita restablecer su contrasena. Cada token es de un solo uso y tiene expiracion.

#### Campos

| Campo       | Tipo SQL        | Restriccion                         | Descripcion                                          |
|-------------|-----------------|-------------------------------------|------------------------------------------------------|
| `Id`        | `uuid`          | `PK`, `DEFAULT gen_random_uuid()`   | Identificador unico del token                        |
| `UserId`    | `uuid`          | `NOT NULL`, `FK -> Users.Id`        | Usuario al que pertenece el token                    |
| `Token`     | `varchar(500)`  | `NOT NULL`, `UNIQUE`                | Token seguro generado (hash aleatorio)               |
| `ExpiresAt` | `timestamp`     | `NOT NULL`                          | Fecha y hora de expiracion del token                 |
| `IsUsed`    | `boolean`       | `NOT NULL`, `DEFAULT false`         | Indica si el token ya fue utilizado                  |
| `CreatedAt` | `timestamp`     | `NOT NULL`, `DEFAULT NOW()`         | Fecha y hora de generacion del token                 |

#### Relaciones

- **N `PasswordResetTokens` -> 1 `Users`**: Multiples tokens pueden pertenecer a un mismo usuario (historial).


---

## Modulo: Estructura del Club

---

### 3.6 `Locations` - Sedes

**Descripcion:** Representa las sedes o instalaciones fisicas del club deportivo. Una sede puede albergar entrenamientos, competencias y usuarios.

#### Campos

| Campo       | Tipo SQL        | Restriccion                         | Descripcion                                   |
|-------------|-----------------|-------------------------------------|-----------------------------------------------|
| `Id`        | `uuid`          | `PK`, `DEFAULT gen_random_uuid()`   | Identificador unico de la sede                |
| `Nombre`    | `varchar(150)`  | `NOT NULL`                          | Nombre de la sede (ej. "Sede Norte")          |
| `Direccion` | `varchar(300)`  | `nullable`                          | Direccion fisica de la sede                   |
| `Ciudad`    | `varchar(100)`  | `nullable`                          | Ciudad donde se ubica la sede                 |
| `Telefono`  | `varchar(20)`   | `nullable`                          | Numero de contacto de la sede                 |
| `IsActive`  | `boolean`       | `NOT NULL`, `DEFAULT true`          | Indica si la sede esta operativa              |
| `CreatedAt` | `timestamp`     | `NOT NULL`, `DEFAULT NOW()`         | Fecha de registro de la sede en el sistema    |

#### Relaciones

- **1 Sede -> N `Users`**: Una sede puede tener multiples usuarios asignados.
- **1 Sede -> N `Trainings`**: Una sede alberga multiples entrenamientos.
- **1 Sede -> N `Competitions`**: Una sede alberga multiples competencias.

---

### 3.7 `Members` - Miembros

**Descripcion:** Extiende la entidad `Users` mediante herencia TPT. Representa a los miembros activos del club que pueden inscribirse en planes, entrenamientos y competencias.

#### Campos

| Campo             | Tipo SQL        | Restriccion                                         | Descripcion                                       |
|-------------------|-----------------|-----------------------------------------------------|---------------------------------------------------|
| `Id`              | `uuid`          | `PK`, `FK -> Users.Id`                              | Mismo `Id` del usuario base (herencia TPT)        |
| `FechaNacimiento` | `date`          | `nullable`                                          | Fecha de nacimiento del miembro                   |
| `Telefono`        | `varchar(20)`   | `nullable`                                          | Numero de telefono de contacto del miembro        |
| `Direccion`       | `varchar(300)`  | `nullable`                                          | Direccion residencial del miembro                 |
| `FechaIngreso`    | `date`          | `NOT NULL`, `DEFAULT CURRENT_DATE`                  | Fecha en que el miembro se unio al club           |
| `Estado`          | `varchar(20)`   | `NOT NULL`, `CHECK IN (ACTIVO, INACTIVO, MOROSO)`   | Estado actual del miembro en el club              |

#### Relaciones

- **1 Miembro -> N `Memberships`**: Un miembro puede tener multiples membresias a lo largo del tiempo.
- **1 Miembro -> N `Payments`**: Un miembro puede tener multiples pagos registrados.
- **1 Miembro -> N `TrainingParticipants`**: Un miembro puede inscribirse en multiples entrenamientos.
- **1 Miembro -> N `CompetitionRegistrations`**: Un miembro puede inscribirse en multiples competencias.
- **1 Miembro -> N `CompetitionEvaluations`**: Un miembro puede recibir multiples evaluaciones.

---

### 3.8 `Trainers` - Entrenadores

**Descripcion:** Extiende `Users` mediante herencia TPT. Representa al personal tecnico encargado de dirigir entrenamientos y registrar evaluaciones de miembros.

#### Campos

| Campo             | Tipo SQL        | Restriccion                         | Descripcion                                         |
|-------------------|-----------------|-------------------------------------|-----------------------------------------------------|
| `Id`              | `uuid`          | `PK`, `FK -> Users.Id`              | Mismo `Id` del usuario base (herencia TPT)          |
| `Especialidad`    | `varchar(100)`  | `NOT NULL`                          | Disciplina o area de especializacion del entrenador |
| `Certificaciones` | `text`          | `nullable`                          | Descripcion de certificaciones y titulos obtenidos  |
| `FechaContrato`   | `date`          | `NOT NULL`                          | Fecha de inicio del contrato con el club            |

#### Relaciones

- **1 Entrenador -> N `Trainings`**: Un entrenador dirige multiples sesiones de entrenamiento.
- **1 Entrenador -> N `CompetitionEvaluations`**: Un entrenador registra evaluaciones de miembros.

---

### 3.9 `Counters` - Contadores

**Descripcion:** Extiende `Users` mediante herencia TPT. Representa al personal contable encargado de aprobar o rechazar los pagos registrados en el sistema.

#### Campos

| Campo            | Tipo SQL       | Restriccion                         | Descripcion                                       |
|------------------|----------------|-------------------------------------|---------------------------------------------------|
| `Id`             | `uuid`         | `PK`, `FK -> Users.Id`              | Mismo `Id` del usuario base (herencia TPT)        |
| `NumeroLicencia` | `varchar(50)`  | `nullable`                          | Numero de licencia profesional del contador       |
| `FechaContrato`  | `date`         | `NOT NULL`                          | Fecha de inicio del contrato con el club          |

#### Relaciones

- **1 Contador -> N `Payments`** *(campo `AprobadoPor`)*: Un contador puede aprobar o rechazar multiples pagos.

---

### 3.10 `Admins` - Administradores

**Descripcion:** Extiende `Users` mediante herencia TPT. Representa a los administradores del sistema con acceso completo a la gestion del club.

#### Campos

| Campo   | Tipo SQL        | Restriccion                         | Descripcion                                        |
|---------|-----------------|-------------------------------------|----------------------------------------------------|
| `Id`    | `uuid`          | `PK`, `FK -> Users.Id`              | Mismo `Id` del usuario base (herencia TPT)         |
| `Cargo` | `varchar(100)`  | `nullable`                          | Cargo o titulo del administrador dentro del club   |

---

## Modulo: Membresias y Pagos

---

### 3.11 `PaymentPlans` - Planes de Membresia

**Descripcion:** Define los planes de membresia disponibles para los miembros. Cada plan especifica una duracion, precio y condiciones. Admite borrado logico para preservar el historial.

#### Campos

| Campo          | Tipo SQL          | Restriccion                         | Descripcion                                                |
|----------------|-------------------|-------------------------------------|------------------------------------------------------------|
| `Id`           | `uuid`            | `PK`, `DEFAULT gen_random_uuid()`   | Identificador unico del plan                               |
| `Nombre`       | `varchar(100)`    | `NOT NULL`                          | Nombre del plan (ej. "Plan Mensual", "Plan Anual")         |
| `Descripcion`  | `text`            | `nullable`                          | Descripcion detallada de los beneficios del plan           |
| `Precio`       | `decimal(10, 2)`  | `NOT NULL`, `CHECK (> 0)`           | Precio del plan en la moneda local                         |
| `DurationDays` | `integer`         | `NOT NULL`, `CHECK (> 0)`           | Duracion del plan expresada en dias                        |
| `IsActive`     | `boolean`         | `NOT NULL`, `DEFAULT true`          | Indica si el plan esta disponible para nuevas membresias   |
| `IsDeleted`    | `boolean`         | `NOT NULL`, `DEFAULT false`         | Borrado logico del plan                                    |
| `CreatedAt`    | `timestamp`       | `NOT NULL`, `DEFAULT NOW()`         | Fecha de creacion del plan                                 |

#### Relaciones

- **1 Plan -> N `Memberships`**: Un plan puede estar asociado a multiples membresias activas o historicas.

---

### 3.12 `Memberships` - Membresias

**Descripcion:** Registra la suscripcion activa o historica de un miembro a un plan de membresia especifico, con su periodo de vigencia.

#### Campos

| Campo         | Tipo SQL       | Restriccion                                          | Descripcion                                  |
|---------------|----------------|------------------------------------------------------|----------------------------------------------|
| `Id`          | `uuid`         | `PK`, `DEFAULT gen_random_uuid()`                    | Identificador unico de la membresia          |
| `MemberId`    | `uuid`         | `NOT NULL`, `FK -> Members.Id`                       | Miembro titular de la membresia              |
| `PlanId`      | `uuid`         | `NOT NULL`, `FK -> PaymentPlans.Id`                  | Plan al que corresponde la membresia         |
| `FechaInicio` | `date`         | `NOT NULL`                                           | Fecha de inicio de vigencia                  |
| `FechaFin`    | `date`         | `NOT NULL`                                           | Fecha de fin de vigencia                     |
| `Estado`      | `varchar(20)`  | `NOT NULL`, `CHECK IN (ACTIVA, VENCIDA, SUSPENDIDA)` | Estado actual de la membresia                |
| `IsDeleted`   | `boolean`      | `NOT NULL`, `DEFAULT false`                          | Borrado logico                               |
| `CreatedAt`   | `timestamp`    | `NOT NULL`, `DEFAULT NOW()`                          | Fecha de creacion del registro               |

#### Relaciones

- **N `Memberships` -> 1 `Members`**: Multiples membresias historicas pertenecen a un miembro.
- **N `Memberships` -> 1 `PaymentPlans`**: Multiples membresias pueden corresponder al mismo plan.
- **1 Membresia -> N `Payments`**: Una membresia puede tener multiples pagos asociados.


---

### 3.13 `Payments` - Pagos

**Descripcion:** Registra cada transaccion de pago realizada por un miembro. Los pagos requieren aprobacion por parte de un contador antes de considerarse validos.

#### Campos

| Campo             | Tipo SQL          | Restriccion                                                              | Descripcion                                     |
|-------------------|-------------------|--------------------------------------------------------------------------|-------------------------------------------------|
| `Id`              | `uuid`            | `PK`, `DEFAULT gen_random_uuid()`                                        | Identificador unico del pago                    |
| `MembershipId`    | `uuid`            | `NOT NULL`, `FK -> Memberships.Id`                                       | Membresia a la que corresponde el pago          |
| `MemberId`        | `uuid`            | `NOT NULL`, `FK -> Members.Id`                                           | Miembro que realizo el pago                     |
| `Monto`           | `decimal(10, 2)`  | `NOT NULL`, `CHECK (> 0)`                                                | Monto pagado                                    |
| `FechaPago`       | `date`            | `NOT NULL`                                                               | Fecha en que se realizo el pago                 |
| `MetodoPago`      | `varchar(20)`     | `NOT NULL`, `CHECK IN (EFECTIVO, TRANSFERENCIA, TARJETA, OTRO)`          | Metodo de pago utilizado                        |
| `Estado`          | `varchar(20)`     | `NOT NULL`, `DEFAULT PENDIENTE`, `CHECK IN (PENDIENTE, APROBADO, RECHAZADO)` | Estado de validacion del pago              |
| `Comentario`      | `text`            | `nullable`                                                               | Observaciones adicionales o motivo de rechazo   |
| `AprobadoPor`     | `uuid`            | `FK -> Users.Id`, `nullable`                                             | Contador que aprobo o rechazo el pago           |
| `FechaAprobacion` | `timestamp`       | `nullable`                                                               | Fecha y hora de la aprobacion o rechazo         |
| `IsDeleted`       | `boolean`         | `NOT NULL`, `DEFAULT false`                                              | Borrado logico                                  |
| `CreatedAt`       | `timestamp`       | `NOT NULL`, `DEFAULT NOW()`                                              | Fecha de creacion del registro                  |

#### Relaciones

- **N `Payments` -> 1 `Memberships`**: Los pagos se asocian a una membresia especifica.
- **N `Payments` -> 1 `Members`**: Los pagos pertenecen a un miembro.
- **1 `Payment` -> 0-1 `PaymentReceipts`**: Un pago puede tener adjunto un comprobante.

---

### 3.14 `PaymentReceipts` - Comprobantes de Pago

**Descripcion:** Almacena la referencia al archivo de comprobante adjunto por el miembro al registrar un pago (imagen, PDF, etc.). Relacion uno a uno con `Payments`.

#### Campos

| Campo           | Tipo SQL        | Restriccion                              | Descripcion                                               |
|-----------------|-----------------|------------------------------------------|-----------------------------------------------------------|
| `Id`            | `uuid`          | `PK`, `DEFAULT gen_random_uuid()`        | Identificador unico del comprobante                       |
| `PaymentId`     | `uuid`          | `NOT NULL`, `FK -> Payments.Id`, `UNIQUE`| Pago al que pertenece el comprobante (relacion 1:1)       |
| `NombreArchivo` | `varchar(300)`  | `NOT NULL`                               | Nombre original del archivo subido                        |
| `RutaArchivo`   | `varchar(500)`  | `NOT NULL`                               | Ruta de almacenamiento en el servidor o bucket            |
| `TipoArchivo`   | `varchar(50)`   | `nullable`                               | MIME type del archivo (ej. `image/jpeg`, `application/pdf`) |
| `TamanoBytes`   | `bigint`        | `nullable`                               | Tamano del archivo en bytes                               |
| `IsDeleted`     | `boolean`       | `NOT NULL`, `DEFAULT false`              | Borrado logico                                            |
| `CreadoEn`      | `timestamp`     | `NOT NULL`, `DEFAULT NOW()`              | Fecha y hora de carga del comprobante                     |

#### Relaciones

- **1 `PaymentReceipts` -> 1 `Payments`**: Un comprobante pertenece a exactamente un pago.

---

## Modulo: Actividades Deportivas

---

### 3.15 `Trainings` - Entrenamientos

**Descripcion:** Representa una sesion de entrenamiento programada en una sede y dirigida por un entrenador. Controla el cupo, el horario y el estado de la sesion.

#### Campos

| Campo          | Tipo SQL       | Restriccion                                                           | Descripcion                                           |
|----------------|----------------|-----------------------------------------------------------------------|-------------------------------------------------------|
| `Id`           | `uuid`         | `PK`, `DEFAULT gen_random_uuid()`                                     | Identificador unico del entrenamiento                 |
| `Tipo`         | `varchar(100)` | `NOT NULL`                                                            | Tipo de entrenamiento (ej. "Funcional", "Yoga")       |
| `Descripcion`  | `text`         | `nullable`                                                            | Descripcion detallada de la sesion                    |
| `Fecha`        | `date`         | `NOT NULL`                                                            | Fecha programada del entrenamiento                    |
| `HoraInicio`   | `time`         | `NOT NULL`                                                            | Hora de inicio de la sesion                           |
| `HoraFin`      | `time`         | `NOT NULL`                                                            | Hora de finalizacion de la sesion                     |
| `SedeId`       | `uuid`         | `NOT NULL`, `FK -> Locations.Id`                                      | Sede donde se realiza el entrenamiento                |
| `EntrenadorId` | `uuid`         | `NOT NULL`, `FK -> Trainers.Id`                                       | Entrenador responsable de la sesion                   |
| `CupoMaximo`   | `integer`      | `NOT NULL`, `DEFAULT 20`, `CHECK (> 0)`                               | Numero maximo de participantes                        |
| `Estado`       | `varchar(20)`  | `NOT NULL`, `CHECK IN (PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO)`  | Estado actual del entrenamiento                       |
| `IsDeleted`    | `boolean`      | `NOT NULL`, `DEFAULT false`                                           | Borrado logico                                        |
| `CreatedAt`    | `timestamp`    | `NOT NULL`, `DEFAULT NOW()`                                           | Fecha de creacion del registro                        |

#### Relaciones

- **N `Trainings` -> 1 `Locations`**: Cada entrenamiento se realiza en una sede.
- **N `Trainings` -> 1 `Trainers`**: Cada entrenamiento es dirigido por un entrenador.
- **1 Entrenamiento -> N `TrainingParticipants`**: Un entrenamiento puede tener multiples inscritos.
- **1 Entrenamiento -> N `Attendances`**: Se registra asistencia por cada miembro inscrito.
- **1 Entrenamiento -> N `CompetitionEvaluations`**: Un entrenamiento puede ser contexto de evaluaciones.

---

### 3.16 `TrainingParticipants` - Participantes de Entrenamiento

**Descripcion:** Tabla intermedia que registra la inscripcion de un miembro a una sesion de entrenamiento especifica. Implementa la relacion muchos a muchos entre `Trainings` y `Members`.

#### Campos

| Campo              | Tipo SQL    | Restriccion                         | Descripcion                                    |
|--------------------|-------------|-------------------------------------|------------------------------------------------|
| `Id`               | `uuid`      | `PK`, `DEFAULT gen_random_uuid()`   | Identificador unico de la inscripcion          |
| `TrainingId`       | `uuid`      | `NOT NULL`, `FK -> Trainings.Id`    | Entrenamiento al que se inscribe               |
| `MemberId`         | `uuid`      | `NOT NULL`, `FK -> Members.Id`      | Miembro que se inscribe                        |
| `FechaInscripcion` | `timestamp` | `NOT NULL`, `DEFAULT NOW()`         | Fecha y hora en que se realizo la inscripcion  |

> **Restriccion UNIQUE**: (`TrainingId`, `MemberId`) - Un miembro no puede inscribirse dos veces a la misma sesion.

#### Relaciones

- Tabla intermedia M:N entre `Trainings` y `Members`.

---

### 3.17 `Attendances` - Asistencias

**Descripcion:** Registra si un miembro asistio o no a una sesion de entrenamiento. Es registrada por el entrenador o un administrador al momento o despues del entrenamiento.

#### Campos

| Campo           | Tipo SQL    | Restriccion                         | Descripcion                                            |
|-----------------|-------------|-------------------------------------|--------------------------------------------------------|
| `Id`            | `uuid`      | `PK`, `DEFAULT gen_random_uuid()`   | Identificador unico del registro de asistencia         |
| `TrainingId`    | `uuid`      | `NOT NULL`, `FK -> Trainings.Id`    | Entrenamiento al que refiere el registro               |
| `MemberId`      | `uuid`      | `NOT NULL`, `FK -> Members.Id`      | Miembro cuya asistencia se registra                    |
| `Asistio`       | `boolean`   | `NOT NULL`                          | `true` si asistio, `false` si estuvo ausente           |
| `FechaRegistro` | `timestamp` | `NOT NULL`, `DEFAULT NOW()`         | Fecha y hora en que se registro la asistencia          |
| `RegistradoPor` | `uuid`      | `NOT NULL`, `FK -> Users.Id`        | Usuario que registro la asistencia                     |

> **Restriccion UNIQUE**: (`TrainingId`, `MemberId`) - Solo se admite un registro de asistencia por miembro por sesion.

#### Relaciones

- **N `Attendances` -> 1 `Trainings`**: Multiples asistencias referencian un entrenamiento.
- **N `Attendances` -> 1 `Members`**: Multiples asistencias pertenecen a un miembro.


---

### 3.18 `Competitions` - Competencias

**Descripcion:** Representa un evento competitivo organizado por el club, ya sea interno o externo. Permite gestionar inscripciones, cupos y evaluacion de resultados.

#### Campos

| Campo         | Tipo SQL       | Restriccion                                                          | Descripcion                                          |
|---------------|----------------|----------------------------------------------------------------------|------------------------------------------------------|
| `Id`          | `uuid`         | `PK`, `DEFAULT gen_random_uuid()`                                    | Identificador unico de la competencia                |
| `Nombre`      | `varchar(200)` | `NOT NULL`                                                           | Nombre de la competencia                             |
| `Descripcion` | `text`         | `nullable`                                                           | Descripcion detallada del evento                     |
| `Fecha`       | `date`         | `NOT NULL`                                                           | Fecha programada del evento                          |
| `SedeId`      | `uuid`         | `NOT NULL`, `FK -> Locations.Id`                                     | Sede donde se realiza la competencia                 |
| `CupoMaximo`  | `integer`      | `nullable`, `CHECK (> 0)`                                            | Numero maximo de participantes (null = sin limite)   |
| `Modalidad`   | `varchar(100)` | `nullable`                                                           | Modalidad deportiva del evento (ej. "Individual")    |
| `Estado`      | `varchar(20)`  | `NOT NULL`, `CHECK IN (ABIERTA, CERRADA, EN_CURSO, FINALIZADA)`      | Estado actual de la competencia                      |
| `IsDeleted`   | `boolean`      | `NOT NULL`, `DEFAULT false`                                          | Borrado logico                                       |
| `CreatedAt`   | `timestamp`    | `NOT NULL`, `DEFAULT NOW()`                                          | Fecha de creacion del registro                       |

#### Relaciones

- **N `Competitions` -> 1 `Locations`**: Cada competencia se realiza en una sede.
- **1 Competencia -> N `CompetitionRegistrations`**: Una competencia puede tener multiples inscripciones.
- **1 Competencia -> N `CompetitionEvaluations`**: Una competencia puede generar multiples evaluaciones.

---

### 3.19 `CompetitionRegistrations` - Inscripciones a Competencia

**Descripcion:** Tabla intermedia que registra la inscripcion de un miembro a una competencia. Permite gestionar el estado de la inscripcion y su posible cancelacion.

#### Campos

| Campo              | Tipo SQL       | Restriccion                                                     | Descripcion                                   |
|--------------------|----------------|-----------------------------------------------------------------|-----------------------------------------------|
| `Id`               | `uuid`         | `PK`, `DEFAULT gen_random_uuid()`                               | Identificador unico de la inscripcion         |
| `CompetitionId`    | `uuid`         | `NOT NULL`, `FK -> Competitions.Id`                             | Competencia a la que se inscribe              |
| `MemberId`         | `uuid`         | `NOT NULL`, `FK -> Members.Id`                                  | Miembro que se inscribe                       |
| `FechaInscripcion` | `timestamp`    | `NOT NULL`, `DEFAULT NOW()`                                     | Fecha y hora de la inscripcion                |
| `Estado`           | `varchar(20)`  | `NOT NULL`, `CHECK IN (ACTIVA, CANCELADA)`, `DEFAULT ACTIVA`    | Estado de la inscripcion                      |
| `CanceladaEn`      | `timestamp`    | `nullable`                                                      | Fecha y hora de cancelacion (si aplica)       |

> **Restriccion UNIQUE**: (`CompetitionId`, `MemberId`) - Un miembro no puede inscribirse dos veces a la misma competencia.

#### Relaciones

- Tabla intermedia M:N entre `Competitions` y `Members`.

---

### 3.20 `CompetitionEvaluations` - Evaluaciones

**Descripcion:** Registra la evaluacion de rendimiento de un miembro en el contexto de un entrenamiento o una competencia. Es registrada por un entrenador y sirve como historial de progreso deportivo.

#### Campos

| Campo             | Tipo SQL          | Restriccion                                        | Descripcion                                             |
|-------------------|-------------------|----------------------------------------------------|-------------------------------------------------------------|
| `Id`              | `uuid`            | `PK`, `DEFAULT gen_random_uuid()`                  | Identificador unico de la evaluacion                    |
| `MemberId`        | `uuid`            | `NOT NULL`, `FK -> Members.Id`                     | Miembro evaluado                                        |
| `TrainingId`      | `uuid`            | `FK -> Trainings.Id`, `nullable`                   | Entrenamiento en el que se realizo la evaluacion        |
| `CompetitionId`   | `uuid`            | `FK -> Competitions.Id`, `nullable`                | Competencia en la que se realizo la evaluacion          |
| `EntrenadorId`    | `uuid`            | `NOT NULL`, `FK -> Trainers.Id`                    | Entrenador que registra la evaluacion                   |
| `Puntaje`         | `decimal(4, 1)`   | `NOT NULL`, `CHECK (>= 1.0 AND <= 10.0)`           | Puntaje asignado en escala del 1 al 10                  |
| `Observaciones`   | `text`            | `nullable`                                         | Comentarios cualitativos del entrenador                 |
| `FechaEvaluacion` | `date`            | `NOT NULL`                                         | Fecha en que se realizo la evaluacion                   |
| `CreatedAt`       | `timestamp`       | `NOT NULL`, `DEFAULT NOW()`                        | Fecha de creacion del registro                          |

> **Restriccion de integridad**: Al menos uno de `TrainingId` o `CompetitionId` debe ser no nulo.
> Se recomienda implementar como: `CHECK (TrainingId IS NOT NULL OR CompetitionId IS NOT NULL)`

#### Relaciones

- **N `CompetitionEvaluations` -> 1 `Members`**: Un miembro puede tener multiples evaluaciones.
- **N `CompetitionEvaluations` -> 1 `Trainers`**: Un entrenador registra multiples evaluaciones.
- **N `CompetitionEvaluations` -> 0-1 `Trainings`**: Opcionalmente vinculada a un entrenamiento.
- **N `CompetitionEvaluations` -> 0-1 `Competitions`**: Opcionalmente vinculada a una competencia.

---

## 4. Indices Recomendados

Los siguientes indices mejoran el rendimiento de las consultas mas frecuentes del sistema:

| Tabla                      | Campos Indexados                    | Tipo     | Justificacion                                           |
|----------------------------|-------------------------------------|----------|---------------------------------------------------------|
| `Users`                    | `Email`                             | `UNIQUE` | Busqueda de usuarios por email en login                 |
| `Users`                    | `SedeId`                            | `BTREE`  | Filtrar usuarios por sede                               |
| `Users`                    | `IsDeleted`, `IsActive`             | `BTREE`  | Filtros de borrado logico y estado                      |
| `Memberships`              | `MemberId`                          | `BTREE`  | Consultar membresias por miembro                        |
| `Memberships`              | `Estado`, `FechaFin`                | `BTREE`  | Detectar membresias vencidas o activas                  |
| `Payments`                 | `MemberId`                          | `BTREE`  | Historial de pagos por miembro                          |
| `Payments`                 | `Estado`                            | `BTREE`  | Filtrar pagos pendientes de aprobacion                  |
| `Payments`                 | `FechaPago`                         | `BTREE`  | Reportes por rango de fechas                            |
| `Trainings`                | `Fecha`, `SedeId`                   | `BTREE`  | Agenda de entrenamientos por sede y fecha               |
| `Trainings`                | `EntrenadorId`                      | `BTREE`  | Agenda del entrenador                                   |
| `Trainings`                | `Estado`                            | `BTREE`  | Filtrar entrenamientos activos o finalizados            |
| `TrainingParticipants`     | `TrainingId`, `MemberId`            | `UNIQUE` | Evitar duplicados y consultar inscritos                 |
| `Attendances`              | `TrainingId`, `MemberId`            | `UNIQUE` | Evitar duplicados y consultar asistencia                |
| `Competitions`             | `Fecha`, `Estado`                   | `BTREE`  | Filtrar competencias abiertas o proximas                |
| `CompetitionRegistrations` | `CompetitionId`, `MemberId`         | `UNIQUE` | Evitar inscripciones duplicadas                         |
| `CompetitionEvaluations`   | `MemberId`, `FechaEvaluacion`       | `BTREE`  | Historial de evaluaciones por miembro                   |
| `PasswordResetTokens`      | `Token`                             | `UNIQUE` | Validacion rapida del token                             |
| `PasswordResetTokens`      | `UserId`, `IsUsed`, `ExpiresAt`     | `BTREE`  | Verificar tokens vigentes por usuario                   |

---

## 5. Convenciones de Nomenclatura

### 5.1 Tablas

| Regla                          | Ejemplo                              |
|--------------------------------|--------------------------------------|
| Nombre en ingles, PascalCase   | `Users`, `PaymentPlans`              |
| Plural para colecciones        | `Payments`, `Memberships`            |
| Tablas intermedias M:N         | `UserRoles`, `TrainingParticipants`  |

### 5.2 Columnas

| Regla                                    | Ejemplo                                    |
|------------------------------------------|--------------------------------------------|
| PascalCase para todos los campos         | `FechaNacimiento`, `IsDeleted`             |
| Claves primarias: siempre `Id`           | `Id uuid PK`                               |
| Claves foraneas: `{Entidad}Id`           | `MemberId`, `SedeId`                       |
| Campos booleanos: prefijo `Is`           | `IsActive`, `IsDeleted`                    |
| Fechas de auditoria: sufijo `At`         | `CreatedAt`, `UpdatedAt`, `DeletedAt`      |

### 5.3 Enumeraciones

| Regla                                  | Ejemplo                                         |
|----------------------------------------|-------------------------------------------------|
| Valores en `UPPER_SNAKE_CASE`          | `ACTIVO`, `EN_CURSO`, `APROBADO`                |
| Almacenados como `varchar` + `CHECK`   | `CHECK Estado IN ('ACTIVO', 'INACTIVO')`        |

### 5.4 Indices y Restricciones

| Regla                                    | Ejemplo                                    |
|------------------------------------------|--------------------------------------------|
| Indices: `ix_{tabla}_{campo(s)}`         | `ix_payments_memberid`                     |
| Claves unicas: `uq_{tabla}_{campo}`      | `uq_users_email`                           |
| Claves foraneas: `fk_{tabla}_{ref}`      | `fk_memberships_members`                   |

---

## 6. Diagrama de Relaciones Simplificado

```
Users ──< UserRoles >── Roles ──< RolPermiso >── Permissions
  │
  ├─── Members ──< Memberships ──< Payments ──── PaymentReceipts
  │        │              ↑ N:1
  │        │         PaymentPlans ──────────────┘
  │        │
  │        ├──< TrainingParticipants >── Trainings ──< Attendances
  │        │
  │        └──< CompetitionRegistrations >── Competitions
  │
  ├─── Trainers ──< Trainings
  │
  ├─── Counters (aprueba Payments via AprobadoPor)
  │
  └─── Admins

Locations ←── Trainings
          ←── Competitions

CompetitionEvaluations (Member + Trainer + Training? + Competition?)
PasswordResetTokens ──> Users
```

---

## 7. Notas Tecnicas Adicionales

> [!NOTE]
> **Borrado logico**: Todas las entidades marcadas con `IsDeleted = true` deben ser excluidas automaticamente por los filtros globales de EF Core (`HasQueryFilter`). Nunca se deben eliminar registros fisicamente en produccion.

> [!IMPORTANT]
> **Herencia TPT**: Las tablas `Members`, `Trainers`, `Counters` y `Admins` comparten el `Id` de `Users`. Al crear un usuario de tipo especifico, se debe insertar en `Users` primero y luego en la tabla correspondiente dentro de la misma transaccion.

> [!TIP]
> **Auditoria automatica**: Utilizar un interceptor de EF Core (`SaveChangesInterceptor`) para actualizar automaticamente `UpdatedAt` en cada modificacion de entidad, sin necesidad de codigo manual en los servicios.

> [!WARNING]
> **Campo `AprobadoPor` en `Payments`**: Solo usuarios con rol `CONTADOR` o `ADMIN` deben poder modificar el estado de un pago. Esta logica debe validarse en la capa de aplicacion (no unicamente en base de datos).

---

*Documento generado para el proyecto **SPORTIFY CLUB MANAGER** - (c) 2026. Todos los derechos reservados.*
