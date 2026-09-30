# Modelo Entidad-Relación — SPORTIFY CLUB MANAGER

## Descripción

El modelo de datos está diseñado para soportar los 13 requisitos funcionales del sistema. Se utiliza **MySQL 8.x** con **Engine InnoDB** para soporte de transacciones y claves foráneas. Todos los registros críticos implementan **borrado lógico** mediante el campo `activo`.

---

## Diagrama ERD (Conceptual)

```
┌─────────────┐          ┌─────────────┐
│   USUARIO   │◄────────►│     ROL     │
│─────────────│  N:M via │─────────────│
│ id (PK)     │ usuario_ │ id (PK)     │
│ nombre      │  roles   │ nombre      │
│ apellido    │          │ descripcion │
│ correo      │          └─────────────┘
│ contrasena_ │
│  hash       │          ┌──────────────────────┐
│ activo      │          │  PASSWORD_RESET_TOKEN │
│ creado_en   │◄─────────│──────────────────────│
│ actualiza.. │          │ id (PK)              │
└──────┬──────┘          │ usuario_id (FK)      │
       │                 │ codigo_hash          │
       │                 │ expiracion           │
       ├────────────────►│ usado                │
       │                 │ creado_en            │
       │                 └──────────────────────┘
       │
       │     ┌────────────────┐     ┌─────────────────┐
       ├────►│   MEMBRESIA    │◄────│  PLAN_MEMBRESIA │
       │     │────────────────│     │─────────────────│
       │     │ id (PK)        │     │ id (PK)         │
       │     │ usuario_id (FK)│     │ nombre          │
       │     │ plan_id (FK)   │     │ descripcion     │
       │     │ fecha_inicio   │     │ precio          │
       │     │ fecha_fin      │     │ duracion_dias   │
       │     │ estado         │     │ activo          │
       │     └───────┬────────┘     └─────────────────┘
       │             │
       │             ▼
       │     ┌────────────────┐     ┌──────────────────────┐
       ├────►│     PAGO       │────►│   COMPROBANTE_PAGO   │
       │     │────────────────│     │──────────────────────│
       │     │ id (PK)        │     │ id (PK)              │
       │     │ usuario_id (FK)│     │ pago_id (FK)         │
       │     │ membresia_(FK) │     │ nombre_original       │
       │     │ monto          │     │ nombre_archivo        │
       │     │ fecha_pago     │     │ ruta                  │
       │     │ estado         │     │ tipo_mime             │
       │     │ comentario     │     │ tamano                │
       │     │ validado_por   │     │ fecha_carga           │
       │     │ activo         │     │ estado                │
       │     └────────────────┘     └──────────────────────┘
       │
       │     ┌──────────────────────────────────────────┐
       │     │            ENTRENAMIENTO                 │
       │     │──────────────────────────────────────────│
       ├────►│ id (PK)                                  │
       │     │ entrenador_id (FK → usuario)             │
       │     │ sede_id (FK)                             │
       │     │ fecha                                    │
       │     │ descripcion                              │
       │     │ activo                                   │
       │     └───┬──────────────────────────────────────┘
       │         │
       │         ├────►┌────────────────────────────────┐
       │         │     │   PARTICIPANTE_ENTRENAMIENTO   │
       │         │     │────────────────────────────────│
       │         │     │ id (PK)                        │
       │         │     │ entrenamiento_id (FK)          │
       │         │     │ usuario_id (FK)                │
       │         │     └────────────────────────────────┘
       │         │
       │         └────►┌──────────────────────────────┐
       │               │          ASISTENCIA           │
       │               │──────────────────────────────│
       ├──────────────►│ id (PK)                      │
       │               │ entrenamiento_id (FK)         │
       │               │ usuario_id (FK)               │
       │               │ asistio                       │
       │               │ fecha_registro               │
       │               └──────────────────────────────┘
       │
       │     ┌─────────────────────┐     ┌──────────────┐
       │     │    COMPETENCIA      │◄────│     SEDE     │
       │     │─────────────────────│     │──────────────│
       │     │ id (PK)             │     │ id (PK)      │
       │     │ nombre              │     │ nombre       │
       │     │ descripcion         │     │ direccion    │
       │     │ fecha               │     │ activo       │
       │     │ sede_id (FK)        │     └──────────────┘
       │     │ activo              │
       │     │ creado_en           │
       │     └──────┬──────────────┘
       │            │
       │            ▼
       │     ┌─────────────────────────────┐
       └────►│    INSCRIPCION_COMPETENCIA  │
             │─────────────────────────────│
             │ id (PK)                     │
             │ competencia_id (FK)         │
             │ usuario_id (FK)             │
             │ fecha_inscripcion           │
             │ estado                      │
             └──────┬──────────────────────┘
                    │
                    ▼
             ┌──────────────────────────────┐
             │    EVALUACION_COMPETENCIA    │
             │──────────────────────────────│
             │ id (PK)                      │
             │ inscripcion_id (FK)          │
             │ puntuacion                   │
             │ comentario                   │
             │ evaluado_por (FK → usuario)  │
             │ fecha                        │
             └──────────────────────────────┘
```

---

## Descripción de Tablas

### usuarios
| Campo             | Tipo           | Restricciones                | Descripción                    |
|-------------------|----------------|------------------------------|--------------------------------|
| id                | INT            | PK, AUTO_INCREMENT           | Identificador único            |
| nombre            | VARCHAR(100)   | NOT NULL                     | Nombre del usuario             |
| apellido          | VARCHAR(100)   | NOT NULL                     | Apellido del usuario           |
| correo            | VARCHAR(150)   | NOT NULL, UNIQUE             | Correo electrónico (login)     |
| contrasena_hash   | VARCHAR(255)   | NOT NULL                     | Hash BCrypt de la contraseña   |
| activo            | BOOLEAN        | DEFAULT TRUE                 | Borrado lógico                 |
| creado_en         | DATETIME       | DEFAULT NOW()                | Fecha de creación              |
| actualizado_en    | DATETIME       | DEFAULT NOW() ON UPDATE      | Fecha de última actualización  |

### roles
| Campo       | Tipo         | Restricciones    | Descripción             |
|-------------|--------------|------------------|-------------------------|
| id          | INT          | PK, AUTO_INCREMENT| Identificador único    |
| nombre      | VARCHAR(50)  | NOT NULL, UNIQUE | Nombre del rol (ADMIN, etc.) |
| descripcion | VARCHAR(255) | NULL             | Descripción del rol     |

### usuario_roles (N:M)
| Campo       | Tipo | Restricciones         |
|-------------|------|-----------------------|
| usuario_id  | INT  | FK → usuarios.id, PK |
| rol_id      | INT  | FK → roles.id, PK    |

### planes_membresia
| Campo          | Tipo           | Descripción                 |
|----------------|----------------|-----------------------------|
| id             | INT            | PK                          |
| nombre         | VARCHAR(100)   | Ej: "Mensual", "Anual"      |
| descripcion    | TEXT           | Descripción del plan        |
| precio         | DECIMAL(10,2)  | Precio del plan             |
| duracion_dias  | INT            | Duración en días            |
| activo         | BOOLEAN        | Borrado lógico              |

### membresias
| Campo         | Tipo     | Descripción                           |
|---------------|----------|---------------------------------------|
| id            | INT      | PK                                    |
| usuario_id    | INT      | FK → usuarios                        |
| plan_id       | INT      | FK → planes_membresia                |
| fecha_inicio  | DATE     | Inicio de la membresía               |
| fecha_fin     | DATE     | Vencimiento de la membresía          |
| estado        | ENUM     | ACTIVA, VENCIDA, SUSPENDIDA, PENDIENTE|

### pagos
| Campo         | Tipo           | Descripción                          |
|---------------|----------------|--------------------------------------|
| id            | INT            | PK                                   |
| usuario_id    | INT            | FK → usuarios (quien paga)           |
| membresia_id  | INT            | FK → membresias                     |
| monto         | DECIMAL(10,2)  | Monto del pago                       |
| fecha_pago    | DATETIME       | Cuándo se realizó el pago            |
| estado        | ENUM           | PENDIENTE, APROBADO, RECHAZADO       |
| comentario    | TEXT           | Comentario del CONTADOR (si rechaza) |
| validado_por  | INT            | FK → usuarios (el CONTADOR)          |
| activo        | BOOLEAN        | Borrado lógico                       |

### comprobantes_pago
| Campo           | Tipo         | Descripción                              |
|-----------------|--------------|------------------------------------------|
| id              | INT          | PK                                       |
| pago_id         | INT          | FK → pagos                              |
| nombre_original | VARCHAR(255) | Nombre original del archivo              |
| nombre_archivo  | VARCHAR(255) | Nombre único generado (UUID)             |
| ruta            | VARCHAR(500) | Ruta física en el servidor               |
| tipo_mime       | VARCHAR(100) | application/pdf, image/jpeg, image/png   |
| tamano          | INT          | Tamaño en bytes (máx 5MB = 5,242,880)    |
| fecha_carga     | DATETIME     | Cuándo se subió                          |
| estado          | VARCHAR(50)  | PENDIENTE, REVISADO                      |

### password_reset_tokens
| Campo       | Tipo         | Descripción                          |
|-------------|--------------|--------------------------------------|
| id          | INT          | PK                                   |
| usuario_id  | INT          | FK → usuarios                       |
| codigo_hash | VARCHAR(255) | Hash BCrypt del PIN de 6 dígitos     |
| expiracion  | DATETIME     | Expiración (15 minutos desde emisión)|
| usado       | BOOLEAN      | Si ya fue utilizado                  |
| creado_en   | DATETIME     | Fecha de creación                    |

---

## Estados y Enumeraciones

### Estado de Pago
```
PENDIENTE → APROBADO (activa membresía) [RN-04]
PENDIENTE → RECHAZADO (requiere comentario) [RN-05]
```

### Estado de Membresía
```
PENDIENTE → ACTIVA (cuando se aprueba el pago)
ACTIVA → VENCIDA (cuando pasa la fecha_fin)
ACTIVA → SUSPENDIDA (suspensión administrativa)
SUSPENDIDA → ACTIVA (reactivación)
```

### Estado de Inscripción
```
PENDIENTE → CONFIRMADA (por ADMIN)
PENDIENTE → CANCELADA (por MIEMBRO o ADMIN)
CONFIRMADA → CANCELADA
```

---

## Índices Recomendados

```sql
-- Rendimiento de autenticación
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Rendimiento de consultas de membresía
CREATE INDEX idx_membresias_usuario ON membresias(usuario_id);
CREATE INDEX idx_membresias_estado ON membresias(estado);
CREATE INDEX idx_membresias_fecha_fin ON membresias(fecha_fin);

-- Rendimiento de consultas de pagos
CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);

-- Rendimiento de asistencia
CREATE INDEX idx_asistencias_entrenamiento ON asistencias(entrenamiento_id);
CREATE INDEX idx_asistencias_usuario ON asistencias(usuario_id);

-- Rendimiento de competencias
CREATE INDEX idx_competencias_fecha ON competencias(fecha);
CREATE INDEX idx_inscripciones_competencia ON inscripciones_competencia(competencia_id);
```
