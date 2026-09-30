-- ============================================================
-- SPORTIFY CLUB MANAGER
-- Script 03: Índices y Restricciones adicionales
-- ============================================================

USE sportify_db;

-- Índices para autenticación rápida
CREATE INDEX idx_usuarios_correo  ON usuarios(correo);
CREATE INDEX idx_usuarios_activo  ON usuarios(activo);

-- Índices para consultas de membresía
CREATE INDEX idx_membresias_usuario   ON membresias(usuario_id);
CREATE INDEX idx_membresias_estado    ON membresias(estado);
CREATE INDEX idx_membresias_fecha_fin ON membresias(fecha_fin);

-- Índices para consultas de pagos
CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_pagos_estado  ON pagos(estado);
CREATE INDEX idx_pagos_fecha   ON pagos(fecha_pago);

-- Índices para asistencias
CREATE INDEX idx_asistencias_entrenamiento ON asistencias(entrenamiento_id);
CREATE INDEX idx_asistencias_usuario       ON asistencias(usuario_id);

-- Índices para competencias e inscripciones
CREATE INDEX idx_competencias_fecha          ON competencias(fecha);
CREATE INDEX idx_competencias_activo         ON competencias(activo);
CREATE INDEX idx_inscripciones_competencia   ON inscripciones_competencia(competencia_id);
CREATE INDEX idx_inscripciones_usuario       ON inscripciones_competencia(usuario_id);

-- Índice para tokens de recuperación
CREATE INDEX idx_prt_usuario     ON password_reset_tokens(usuario_id);
CREATE INDEX idx_prt_expiracion  ON password_reset_tokens(expiracion);
