-- =============================================================================
-- 06_rls_policies.sql
-- Row Level Security (RLS) directo en Base de Datos para Sportify Club Manager
-- Soporta aislamiento por TenantId (SedeId) y por UsuarioId según rol activo.
-- =============================================================================

USE sportify_db;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_set_rls_context //
CREATE PROCEDURE sp_set_rls_context(
    IN p_tenant_id INT,
    IN p_user_id INT,
    IN p_role VARCHAR(50)
)
BEGIN
    SET @sportify_rls_enabled = 1;
    SET @sportify_tenant_id = p_tenant_id;
    SET @sportify_user_id = p_user_id;
    SET @sportify_user_role = UPPER(COALESCE(p_role, 'MIEMBRO'));
END //

DROP PROCEDURE IF EXISTS sp_clear_rls_context //
CREATE PROCEDURE sp_clear_rls_context()
BEGIN
    SET @sportify_rls_enabled = 0;
    SET @sportify_tenant_id = NULL;
    SET @sportify_user_id = NULL;
    SET @sportify_user_role = NULL;
END //

DELIMITER ;

-- Vista con RLS para Usuarios (aislada por TenantId / SedeId)
CREATE OR REPLACE SQL SECURITY DEFINER VIEW v_rls_usuarios AS
SELECT
    u.Id,
    u.Nombre,
    u.Apellido,
    u.Correo,
    u.Activo,
    u.SedeId,
    u.FechaNacimiento,
    u.CreadoEn
FROM Usuarios u
WHERE COALESCE(@sportify_rls_enabled, 0) = 0
   OR (@sportify_tenant_id IS NULL OR u.SedeId = @sportify_tenant_id);

-- Vista con RLS para Pagos (aislada por TenantId y por UsuarioId cuando el rol es MIEMBRO)
CREATE OR REPLACE SQL SECURITY DEFINER VIEW v_rls_pagos AS
SELECT
    p.Id,
    p.UsuarioId,
    p.MembresiaId,
    p.MontoCOP,
    p.Estado,
    p.FechaPago,
    p.FechaAprobacion,
    p.AprobadoPorId
FROM Pagos p
INNER JOIN Usuarios u ON u.Id = p.UsuarioId
WHERE p.EliminadoEn IS NULL
  AND (
      COALESCE(@sportify_rls_enabled, 0) = 0
      OR (
          (@sportify_tenant_id IS NULL OR u.SedeId = @sportify_tenant_id)
          AND (@sportify_user_role <> 'MIEMBRO' OR @sportify_user_id IS NULL OR p.UsuarioId = @sportify_user_id)
      )
  );

-- Vista con RLS para Membresias
CREATE OR REPLACE SQL SECURITY DEFINER VIEW v_rls_membresias AS
SELECT
    m.Id,
    m.UsuarioId,
    m.PlanMembresiaId,
    m.FechaInicio,
    m.FechaFin,
    m.Estado
FROM Membresias m
INNER JOIN Usuarios u ON u.Id = m.UsuarioId
WHERE COALESCE(@sportify_rls_enabled, 0) = 0
   OR (
       (@sportify_tenant_id IS NULL OR u.SedeId = @sportify_tenant_id)
       AND (@sportify_user_role <> 'MIEMBRO' OR @sportify_user_id IS NULL OR m.UsuarioId = @sportify_user_id)
   );

-- Vista con RLS para Entrenamientos (aislada por SedeId)
CREATE OR REPLACE SQL SECURITY DEFINER VIEW v_rls_entrenamientos AS
SELECT
    e.Id,
    e.SedeId,
    e.EntrenadorId,
    e.Titulo,
    e.Descripcion,
    e.FechaHora,
    e.FechaFin,
    e.CapacidadMaxima,
    e.Estado
FROM Entrenamientos e
WHERE e.EliminadoEn IS NULL
  AND (
      COALESCE(@sportify_rls_enabled, 0) = 0
      OR (@sportify_tenant_id IS NULL OR e.SedeId = @sportify_tenant_id)
  );
