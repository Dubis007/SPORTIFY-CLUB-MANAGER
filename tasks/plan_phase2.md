# Implementation Plan: Fase 2 - Renovaciones y Gestión de Comprobantes de Pago

## Overview
Implementar la lógica funcional core de la aplicación: El ciclo de vida de las membresías. Esto incluye subir, almacenar y previsualizar los comprobantes de pago (PDF/Imágenes) en el frontend mediante modales, y ajustar la lógica en el backend para que la aprobación de un pago extienda correctamente la fecha de expiración de la membresía.

## Architecture Decisions
- **Storage de Archivos:** Se usará el sistema de archivos local (wwwroot/receipts) configurado con pp.UseStaticFiles() en .NET.
- **Visualización de PDF:** En React, usaremos un componente modal genérico que internamente renderice un <iframe src={pdfUrl}> nativo, aprovechando el visor integrado del navegador (ligero y sin dependencias pesadas).
- **Lógica de Renovación:** Cuando el Contador o Admin aprueba un pago (ApproveAsync), si este pago corresponde a una renovación de membresía, se debe sumar la duración del plan (DuracionDias) a la FechaFin actual (si sigue activa) o desde hoy (si ya expiró).

## Task List

### Backend Tasks (Subagente Backend)
- [ ] Task 1: Modificar PaymentDto y PaymentRepository para incluir los datos del Comprobante (URL o Ruta).
- [ ] Task 2: Modificar PaymentService.ApproveAsync para que al aprobar un pago, se extienda la FechaFin de la membresía basada en los días del PlanMembresia.

### Frontend Tasks (Subagente Frontend)
- [ ] Task 3: Crear componente PdfViewerModal en rontend/src/components/common/.
- [ ] Task 4: Actualizar AdminPaymentsPage (y/o Dashboard de Contador) para incluir un botón "Ver Comprobante" que abra el modal.
- [ ] Task 5: Actualizar el formulario de carga manual para enviar el PDF vía multipart/form-data.

## Checkpoint: Renovaciones y Comprobantes
- [ ] Se sube un pago con PDF, el archivo se guarda y la API lo devuelve en el listado.
- [ ] Al hacer clic en "Ver Comprobante" en la tabla, se abre un modal con el documento.
- [ ] Al aprobar el pago, la membresía del usuario extiende su FechaFin correctamente.
