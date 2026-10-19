# Implementation Plan: Fase 3 - Seguridad y Escalabilidad

## Overview
Implementar estandares del mercado para asegurar la API contra ataques comunes (Rate Limiting, Security Headers, Global Exception Handling) y preparar la aplicacion para despliegues a gran escala y alto trafico (DbContext Pooling, Response Compression, Health Checks).

## Architecture Decisions
- **Rate Limiting:** Se utilizara la API nativa de Rate Limiting de .NET 8/10 en lugar de librerias de terceros, aplicando politicas estrictas en endpoints de autenticacion.
- **Global Exception Handling:** Se implementara el nuevo middleware IExceptionHandler introducido en versiones recientes de .NET para centralizar el manejo de errores y evitar fugar detalles internos al frontend en produccion.
- **DbContext Pooling:** Se cambiara AddDbContext a AddDbContextPool para reutilizar instancias del contexto y mejorar drasticamente el rendimiento en escenarios de alto flujo.

## Task List

### Phase 3.1: Seguridad (Hardening)
- [ ] Task 7: Implementar Global Exception Handler.
- [ ] Task 8: Configurar Rate Limiting para Autenticacion.
- [ ] Task 9: Implementar Security Headers y revisar politica CORS.

### Checkpoint: Seguridad
- [ ] El frontend funciona correctamente sin bloqueos CORS indebidos.
- [ ] Los errores 500 no muestran stack traces al cliente.

### Phase 3.2: Escalabilidad y Rendimiento
- [ ] Task 10: Habilitar DbContext Pooling.
- [ ] Task 11: Configurar Response Compression (Gzip/Brotli).
- [ ] Task 12: Implementar Health Checks.

### Checkpoint: Escalabilidad
- [ ] La aplicacion compila exitosamente.
- [ ] /api/health devuelve estado HTTP 200 (Healthy).

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Bloqueo a usuarios legítimos por Rate Limit | Alto | Configurar límites generosos (ej. 10 intentos por minuto) en Login, solo para mitigar fuerza bruta bruta. |
| Problemas CORS con el frontend | Medio | Mantener permitidos los métodos y orígenes estrictos de Vite (localhost:5173), pero restringir el resto. |
