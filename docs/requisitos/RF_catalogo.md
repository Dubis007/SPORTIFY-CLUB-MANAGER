# Catálogo de Requisitos — SPORTIFY CLUB MANAGER

Este documento especifica los requisitos extraídos del documento IEEE 830 para el MVP del sistema.

## Requisitos Funcionales (RF)

| ID | Nombre | Descripción | Actores |
|----|--------|-------------|---------|
| **RF-01** | Autenticación | El sistema debe permitir el inicio de sesión con correo y contraseña, y generar un JWT. Debe incluir mecanismo de recuperación mediante PIN. | Todos |
| **RF-02** | Gestión de Usuarios | El sistema debe permitir crear, editar, listar y desactivar usuarios (borrado lógico). | ADMIN |
| **RF-03** | Gestión de Roles | El sistema debe manejar 4 roles fijos (ADMIN, CONTADOR, ENTRENADOR, MIEMBRO) y proteger el acceso a rutas y endpoints según estos. | Sistema |
| **RF-04** | Gestión de Membresías | El sistema debe permitir asignar planes de membresía, registrar fechas de inicio/fin y controlar el estado (Activa, Vencida, etc.). | ADMIN, CONTADOR |
| **RF-05** | Gestión de Pagos | El sistema debe permitir registrar pagos de membresías y proveer un mecanismo para que sean aprobados o rechazados. Al aprobarse, se debe activar la membresía (RN-04). | MIEMBRO, CONTADOR |
| **RF-06** | Gestión de Comprobantes | El sistema debe permitir cargar un archivo de comprobante de pago (JPG, PNG, PDF; máx 5MB) y previsualizarlo sin necesidad de descarga. | MIEMBRO, CONTADOR |
| **RF-07** | Registro de Asistencia | El sistema debe permitir registrar la asistencia de los miembros a las sesiones de entrenamiento. | ENTRENADOR |
| **RF-08** | Gestión de Entrenamientos | El sistema debe permitir crear y gestionar sesiones de entrenamiento asociadas a una sede y entrenador. | ADMIN, ENTRENADOR |
| **RF-09** | Gestión de Competencias | El sistema debe permitir crear y gestionar competencias deportivas. | ADMIN |
| **RF-10** | Inscripciones a Competencias | El sistema debe permitir a un miembro inscribirse a una competencia, validando que su membresía esté activa (RN-03). | MIEMBRO |
| **RF-11** | Evaluaciones de Desempeño | El sistema debe permitir registrar puntuaciones y comentarios de desempeño para los miembros en una competencia. | ENTRENADOR |
| **RF-12** | Reportes | El sistema debe generar reportes en formato PDF (pagos, miembros activos, asistencia) generados desde el backend. | ADMIN, CONTADOR |
| **RF-13** | Consultas Personales | El sistema debe permitir al miembro consultar su estado de membresía, historial de pagos, asistencias e inscripciones. | MIEMBRO |

---

## Requisitos No Funcionales (RNF)

| ID | Nombre | Descripción |
|----|--------|-------------|
| **RNF-01** | Seguridad | Contraseñas con hash BCrypt. Autenticación vía JWT. Ningún secreto en texto plano. Autorización estricta por endpoints en backend. |
| **RNF-02** | Rendimiento | El tiempo de respuesta estándar de la API debe ser inferior a 2 segundos en una red local. |
| **RNF-03** | Usabilidad | La interfaz frontend (React + Tailwind) debe ser limpia, responsiva y separar claramente las vistas según el rol del usuario autenticado. |
| **RNF-04** | Mantenibilidad | Arquitectura por capas en el Backend, patrón MVVM ligero en el Frontend. |
| **RNF-05** | Compatibilidad | Previsualización de archivos PDF, JPG y PNG de forma nativa en navegadores modernos (Chrome, Firefox, Edge). |
| **RNF-06** | Escalabilidad | Frontend (React) y Backend (ASP.NET Core) desacoplados a través de API REST JSON para permitir futuro despliegue en la nube independiente. |