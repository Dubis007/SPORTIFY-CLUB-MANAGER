-- ============================================================
-- SPORTIFY CLUB MANAGER
-- Script 04: Datos Semilla (Seed)
-- ============================================================

USE sportify_db;

-- -----------------------------------------------------------
-- Roles del sistema
-- -----------------------------------------------------------
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('ADMIN',      'Administrador del sistema. Gestiona usuarios, sedes y competencias.'),
('CONTADOR',   'Contador. Valida pagos y comprobantes. Genera reportes financieros.'),
('ENTRENADOR', 'Entrenador. Registra asistencia, entrenamientos y evaluaciones.'),
('MIEMBRO',    'Miembro del club. Se inscribe, paga y carga comprobantes.');

-- -----------------------------------------------------------
-- Usuario administrador inicial
-- Contraseña: Admin@12345
-- Hash BCrypt generado con cost factor 12
-- IMPORTANTE: Cambiar en producción
-- -----------------------------------------------------------
INSERT IGNORE INTO usuarios (nombre, apellido, correo, contrasena_hash, activo) VALUES
('Admin', 'Sportify', 'admin@sportify.com',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq4/K.e',
 TRUE);

-- Asignar rol ADMIN al administrador
INSERT IGNORE INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u, roles r
WHERE u.correo = 'admin@sportify.com' AND r.nombre = 'ADMIN';

-- -----------------------------------------------------------
-- Planes de membresía
-- -----------------------------------------------------------
INSERT IGNORE INTO planes_membresia (nombre, descripcion, precio, duracion_dias, activo) VALUES
('Mensual',    'Acceso completo al club durante 30 días.',      50.00,  30,  TRUE),
('Trimestral', 'Acceso completo al club durante 90 días.',     130.00,  90,  TRUE),
('Semestral',  'Acceso completo al club durante 180 días.',    240.00, 180,  TRUE),
('Anual',      'Acceso completo al club durante 365 días.',    450.00, 365,  TRUE);

-- -----------------------------------------------------------
-- Sede principal
-- -----------------------------------------------------------
INSERT IGNORE INTO sedes (nombre, direccion, activo) VALUES
('Sede Principal', 'Calle 100 # 15-30, Bogotá', TRUE),
('Sede Norte',     'Av. Boyacá # 72-15, Bogotá',  TRUE);
