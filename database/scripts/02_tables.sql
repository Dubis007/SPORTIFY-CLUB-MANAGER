-- ============================================================
-- SPORTIFY CLUB MANAGER
-- Script 02: Creación de Tablas
-- Autor: Equipo Sportify
-- Fecha: 2026
-- ============================================================

USE sportify_db;

-- -----------------------------------------------------------
-- Tabla: roles
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id          INT          NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(50)  NOT NULL COMMENT 'ADMIN | CONTADOR | ENTRENADOR | MIEMBRO',
    descripcion VARCHAR(255) NULL,
    CONSTRAINT PK_roles PRIMARY KEY (id),
    CONSTRAINT UQ_roles_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roles del sistema: ADMIN, CONTADOR, ENTRENADOR, MIEMBRO';

-- -----------------------------------------------------------
-- Tabla: usuarios
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id              INT          NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    correo          VARCHAR(150) NOT NULL COMMENT 'Identificador de login. Debe ser único.',
    contrasena_hash VARCHAR(255) NOT NULL COMMENT 'Hash BCrypt de la contraseña. NUNCA texto plano.',
    activo          BOOLEAN      NOT NULL DEFAULT TRUE COMMENT 'Borrado lógico (RN-06)',
    creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PK_usuarios PRIMARY KEY (id),
    CONSTRAINT UQ_usuarios_correo UNIQUE (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios del sistema. Borrado lógico mediante campo activo.';

-- -----------------------------------------------------------
-- Tabla: usuario_roles (N:M)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id INT NOT NULL,
    rol_id     INT NOT NULL,
    CONSTRAINT PK_usuario_roles PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT FK_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT FK_ur_rol     FOREIGN KEY (rol_id)     REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación muchos a muchos entre usuarios y roles';

-- -----------------------------------------------------------
-- Tabla: sedes
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sedes (
    id         INT          NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(150) NOT NULL,
    direccion  VARCHAR(300) NULL,
    activo     BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT PK_sedes PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sedes donde se realizan actividades del club';

-- -----------------------------------------------------------
-- Tabla: planes_membresia
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS planes_membresia (
    id             INT            NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100)   NOT NULL,
    descripcion    TEXT           NULL,
    precio         DECIMAL(10,2)  NOT NULL,
    duracion_dias  INT            NOT NULL COMMENT 'Duración del plan en días',
    activo         BOOLEAN        NOT NULL DEFAULT TRUE,
    CONSTRAINT PK_planes_membresia PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Planes de membresía disponibles: Mensual, Trimestral, Semestral, Anual';

-- -----------------------------------------------------------
-- Tabla: membresias
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS membresias (
    id           INT  NOT NULL AUTO_INCREMENT,
    usuario_id   INT  NOT NULL,
    plan_id      INT  NOT NULL,
    fecha_inicio DATE NULL,
    fecha_fin    DATE NULL,
    estado       ENUM('PENDIENTE','ACTIVA','VENCIDA','SUSPENDIDA') NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT PK_membresias    PRIMARY KEY (id),
    CONSTRAINT FK_mem_usuario   FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT FK_mem_plan      FOREIGN KEY (plan_id)    REFERENCES planes_membresia(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Membresías de miembros. Estado activado automáticamente al aprobar pago (RN-04).';

-- -----------------------------------------------------------
-- Tabla: pagos
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id           INT            NOT NULL AUTO_INCREMENT,
    usuario_id   INT            NOT NULL COMMENT 'Miembro que realiza el pago',
    membresia_id INT            NOT NULL,
    monto        DECIMAL(10,2)  NOT NULL,
    fecha_pago   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado       ENUM('PENDIENTE','APROBADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    comentario   TEXT           NULL COMMENT 'Obligatorio al rechazar (RN-05)',
    validado_por INT            NULL     COMMENT 'FK al CONTADOR que validó',
    activo       BOOLEAN        NOT NULL DEFAULT TRUE COMMENT 'Borrado lógico (RN-06)',
    CONSTRAINT PK_pagos         PRIMARY KEY (id),
    CONSTRAINT FK_pago_usuario  FOREIGN KEY (usuario_id)   REFERENCES usuarios(id),
    CONSTRAINT FK_pago_membresia FOREIGN KEY (membresia_id) REFERENCES membresias(id),
    CONSTRAINT FK_pago_contador FOREIGN KEY (validado_por)  REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pagos de membresías. Borrado lógico. Comentario obligatorio al rechazar.';

-- -----------------------------------------------------------
-- Tabla: comprobantes_pago
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS comprobantes_pago (
    id               INT          NOT NULL AUTO_INCREMENT,
    pago_id          INT          NOT NULL,
    nombre_original  VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo subido',
    nombre_archivo   VARCHAR(255) NOT NULL COMMENT 'Nombre único generado (UUID)',
    ruta             VARCHAR(500) NOT NULL COMMENT 'Ruta física en el servidor',
    tipo_mime        VARCHAR(100) NOT NULL COMMENT 'application/pdf | image/jpeg | image/png',
    tamano           INT          NOT NULL COMMENT 'Tamaño en bytes. Máx 5MB = 5,242,880',
    fecha_carga      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado           VARCHAR(50)  NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT PK_comprobantes     PRIMARY KEY (id),
    CONSTRAINT FK_comp_pago        FOREIGN KEY (pago_id) REFERENCES pagos(id),
    CONSTRAINT CHK_comp_tamano     CHECK (tamano <= 5242880)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Archivos de comprobante de pago. Máx 5MB. Solo JPG, PNG, PDF.';

-- -----------------------------------------------------------
-- Tabla: entrenamientos
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS entrenamientos (
    id             INT      NOT NULL AUTO_INCREMENT,
    entrenador_id  INT      NOT NULL COMMENT 'FK al usuario con rol ENTRENADOR',
    sede_id        INT      NULL,
    fecha          DATETIME NOT NULL,
    descripcion    TEXT     NULL,
    activo         BOOLEAN  NOT NULL DEFAULT TRUE COMMENT 'Borrado lógico (RN-06)',
    CONSTRAINT PK_entrenamientos    PRIMARY KEY (id),
    CONSTRAINT FK_entr_entrenador   FOREIGN KEY (entrenador_id) REFERENCES usuarios(id),
    CONSTRAINT FK_entr_sede         FOREIGN KEY (sede_id)       REFERENCES sedes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- Tabla: participantes_entrenamiento
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS participantes_entrenamiento (
    id                INT NOT NULL AUTO_INCREMENT,
    entrenamiento_id  INT NOT NULL,
    usuario_id        INT NOT NULL,
    CONSTRAINT PK_part_entr     PRIMARY KEY (id),
    CONSTRAINT FK_pe_entr       FOREIGN KEY (entrenamiento_id) REFERENCES entrenamientos(id),
    CONSTRAINT FK_pe_usuario    FOREIGN KEY (usuario_id)       REFERENCES usuarios(id),
    CONSTRAINT UQ_pe_par        UNIQUE (entrenamiento_id, usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- Tabla: asistencias
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS asistencias (
    id                INT      NOT NULL AUTO_INCREMENT,
    entrenamiento_id  INT      NOT NULL,
    usuario_id        INT      NOT NULL,
    asistio           BOOLEAN  NOT NULL DEFAULT FALSE,
    fecha_registro    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_asistencias   PRIMARY KEY (id),
    CONSTRAINT FK_asis_entr     FOREIGN KEY (entrenamiento_id) REFERENCES entrenamientos(id),
    CONSTRAINT FK_asis_usuario  FOREIGN KEY (usuario_id)       REFERENCES usuarios(id),
    CONSTRAINT UQ_asis          UNIQUE (entrenamiento_id, usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de asistencia. Solo el ENTRENADOR de la sesión puede registrar (RN-09).';

-- -----------------------------------------------------------
-- Tabla: competencias
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS competencias (
    id          INT          NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(200) NOT NULL,
    descripcion TEXT         NULL,
    fecha       DATE         NOT NULL,
    sede_id     INT          NULL,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE COMMENT 'Borrado lógico (RN-06)',
    creado_en   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_competencias  PRIMARY KEY (id),
    CONSTRAINT FK_comp_sede     FOREIGN KEY (sede_id) REFERENCES sedes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- Tabla: inscripciones_competencia
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS inscripciones_competencia (
    id                INT      NOT NULL AUTO_INCREMENT,
    competencia_id    INT      NOT NULL,
    usuario_id        INT      NOT NULL,
    fecha_inscripcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado            ENUM('PENDIENTE','CONFIRMADA','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT PK_inscripciones  PRIMARY KEY (id),
    CONSTRAINT FK_ins_competencia FOREIGN KEY (competencia_id) REFERENCES competencias(id),
    CONSTRAINT FK_ins_usuario     FOREIGN KEY (usuario_id)     REFERENCES usuarios(id),
    CONSTRAINT UQ_ins             UNIQUE (competencia_id, usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripciones a competencias. Requiere membresía activa (RN-03).';

-- -----------------------------------------------------------
-- Tabla: evaluaciones_competencia
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluaciones_competencia (
    id              INT            NOT NULL AUTO_INCREMENT,
    inscripcion_id  INT            NOT NULL,
    puntuacion      DECIMAL(5,2)   NULL,
    comentario      TEXT           NULL,
    evaluado_por    INT            NOT NULL COMMENT 'FK al ENTRENADOR evaluador',
    fecha           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_evaluaciones     PRIMARY KEY (id),
    CONSTRAINT FK_eval_inscripcion FOREIGN KEY (inscripcion_id) REFERENCES inscripciones_competencia(id),
    CONSTRAINT FK_eval_entrenador  FOREIGN KEY (evaluado_por)   REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- Tabla: password_reset_tokens
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id           INT          NOT NULL AUTO_INCREMENT,
    usuario_id   INT          NOT NULL,
    codigo_hash  VARCHAR(255) NOT NULL COMMENT 'Hash BCrypt del PIN de 6 dígitos',
    expiracion   DATETIME     NOT NULL COMMENT 'Expira 15 minutos después de la emisión',
    usado        BOOLEAN      NOT NULL DEFAULT FALSE,
    creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_prt           PRIMARY KEY (id),
    CONSTRAINT FK_prt_usuario   FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens temporales para recuperación de contraseña mediante PIN local.';
