-- ============================================================
-- SPORTIFY CLUB MANAGER
-- Script 05: Datos de Prueba
-- Solo para entorno de desarrollo/testing
-- NO ejecutar en producción
-- ============================================================

USE sportify_db;

-- -----------------------------------------------------------
-- Usuarios de prueba por rol
-- Todos con contraseña: Test@12345
-- Hash BCrypt: $2a$12$...
-- -----------------------------------------------------------
INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, activo) VALUES
-- Contador
('María',    'González',  'contador@sportify.com',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq4/K.e', TRUE),
-- Entrenador
('Carlos',   'Ramírez',   'entrenador@sportify.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq4/K.e', TRUE),
-- Miembros
('Juan',     'Pérez',     'juan@test.com',           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq4/K.e', TRUE),
('Ana',      'López',     'ana@test.com',            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq4/K.e', TRUE),
('Pedro',    'Martínez',  'pedro@test.com',          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq4/K.e', TRUE),
-- Usuario inactivo (para prueba de RN-02)
('Inactivo', 'Test',      'inactivo@test.com',       '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq4/K.e', FALSE);

-- Asignar roles
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r
WHERE u.correo = 'contador@sportify.com' AND r.nombre = 'CONTADOR';

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r
WHERE u.correo = 'entrenador@sportify.com' AND r.nombre = 'ENTRENADOR';

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r
WHERE u.correo IN ('juan@test.com','ana@test.com','pedro@test.com','inactivo@test.com')
  AND r.nombre = 'MIEMBRO';

-- -----------------------------------------------------------
-- Membresías de prueba
-- -----------------------------------------------------------
-- Membresía ACTIVA para Juan
INSERT INTO membresias (usuario_id, plan_id, fecha_inicio, fecha_fin, estado)
SELECT u.id, p.id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'ACTIVA'
FROM usuarios u, planes_membresia p
WHERE u.correo = 'juan@test.com' AND p.nombre = 'Mensual';

-- Membresía VENCIDA para Ana (para probar RN-03)
INSERT INTO membresias (usuario_id, plan_id, fecha_inicio, fecha_fin, estado)
SELECT u.id, p.id, DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'VENCIDA'
FROM usuarios u, planes_membresia p
WHERE u.correo = 'ana@test.com' AND p.nombre = 'Mensual';

-- Membresía PENDIENTE para Pedro
INSERT INTO membresias (usuario_id, plan_id, fecha_inicio, fecha_fin, estado)
SELECT u.id, p.id, NULL, NULL, 'PENDIENTE'
FROM usuarios u, planes_membresia p
WHERE u.correo = 'pedro@test.com' AND p.nombre = 'Trimestral';

-- -----------------------------------------------------------
-- Pagos de prueba
-- -----------------------------------------------------------
-- Pago APROBADO para Juan
INSERT INTO pagos (usuario_id, membresia_id, monto, fecha_pago, estado, validado_por)
SELECT u.id, m.id, 50.00, NOW(), 'APROBADO',
       (SELECT id FROM usuarios WHERE correo = 'contador@sportify.com')
FROM usuarios u
JOIN membresias m ON m.usuario_id = u.id
WHERE u.correo = 'juan@test.com';

-- Pago PENDIENTE para Pedro
INSERT INTO pagos (usuario_id, membresia_id, monto, fecha_pago, estado)
SELECT u.id, m.id, 130.00, NOW(), 'PENDIENTE'
FROM usuarios u
JOIN membresias m ON m.usuario_id = u.id
WHERE u.correo = 'pedro@test.com';

-- Pago RECHAZADO para Ana
INSERT INTO pagos (usuario_id, membresia_id, monto, fecha_pago, estado, comentario, validado_por)
SELECT u.id, m.id, 50.00, DATE_SUB(NOW(), INTERVAL 35 DAY), 'RECHAZADO',
       'El comprobante no corresponde al monto indicado.',
       (SELECT id FROM usuarios WHERE correo = 'contador@sportify.com')
FROM usuarios u
JOIN membresias m ON m.usuario_id = u.id
WHERE u.correo = 'ana@test.com';

-- -----------------------------------------------------------
-- Entrenamiento de prueba
-- -----------------------------------------------------------
INSERT INTO entrenamientos (entrenador_id, sede_id, fecha, descripcion, activo)
SELECT u.id, s.id, DATE_ADD(NOW(), INTERVAL 2 DAY), 'Sesión de cardio y resistencia', TRUE
FROM usuarios u, sedes s
WHERE u.correo = 'entrenador@sportify.com' AND s.nombre = 'Sede Principal';

-- -----------------------------------------------------------
-- Competencia de prueba
-- -----------------------------------------------------------
INSERT INTO competencias (nombre, descripcion, fecha, sede_id, activo)
SELECT 'Torneo Interno 2026', 'Primera competencia interna del año', DATE_ADD(CURDATE(), INTERVAL 30 DAY), s.id, TRUE
FROM sedes s WHERE s.nombre = 'Sede Principal';
