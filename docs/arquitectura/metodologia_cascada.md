# Metodología Cascada — SPORTIFY CLUB MANAGER

## Resumen de fases

El proyecto sigue la **Metodología en Cascada** con **8 fases** secuenciales, combinada con una **estrategia MVP incremental** y **arquitectura por capas** con **MVVM ligero en frontend**.

```
FASE 0 — Inicio y Planificación
    ↓
FASE 1 — Levantamiento y Análisis de Requisitos  
    ↓
FASE 2 — Diseño Funcional
    ↓
FASE 3 — Diseño Técnico
    ↓
FASE 4 — Construcción MVP 1
    ↓
FASE 5 — Construcción MVP 2
    ↓
FASE 6 — Construcción MVP 3
    ↓
FASE 7 — Pruebas
    ↓
FASE 8 — Despliegue y Mantenimiento
```

---

## FASE 0 — Inicio y Planificación

### Objetivo
Definir cómo se realizará el proyecto: equipo, herramientas, alcance, metodología, cronograma.

### Actividades
- [x] Definir equipo (Duban - Backend, Carlos Andrés - Frontend/QA)
- [x] Definir roles y responsabilidades
- [x] Definir alcance del sistema
- [x] Identificar restricciones (localhost, XAMPP, académico)
- [x] Definir stack tecnológico (React 19.2, .NET 10, MySQL 8.x)
- [x] Definir metodología (Cascada + MVP incremental)
- [x] Definir repositorio Git/GitHub
- [x] Definir entorno de desarrollo (XAMPP)

### Resultados
- ✅ Plan del proyecto
- ✅ Cronograma y responsabilidades
- ✅ Stack tecnológico definido
- ✅ Repositorio configurado

---

## FASE 1 — Levantamiento y Análisis de Requisitos

### Objetivo
Documentar completamente las necesidades del sistema con base en el IEEE 830.

### Actividades
- Analizar el problema y objetivo del sistema
- Identificar usuarios y roles (ADMIN, CONTADOR, ENTRENADOR, MIEMBRO)
- Elaborar historias de usuario
- Especificar 13 Requisitos Funcionales (RF-01 a RF-13)
- Especificar 6 Requisitos No Funcionales (RNF-01 a RNF-06)
- Identificar restricciones y dependencias
- Definir reglas de negocio (RN-01 a RN-10)

### Entregables
- Catálogo de Requisitos → `docs/requisitos/RF_catalogo.md`
- Historias de Usuario → `docs/requisitos/historias_usuario.md`
- Reglas de Negocio → `docs/requisitos/reglas_negocio.md`
- Casos de Uso → `docs/casos-uso/`
- Matriz Requisito → Módulo → `docs/requisitos/matriz_requisitos_modulos.md`

---

## FASE 2 — Diseño Funcional

### Objetivo
Definir el comportamiento del sistema antes de programarlo.

### Entregables
- Diagrama de casos de uso → `docs/diagramas/casos_uso.md`
- Diagramas de actividad → `docs/diagramas/actividades/`
- Diagramas de secuencia → `docs/diagramas/secuencias/`
- Wireframes de pantallas → `docs/diagramas/wireframes/`
- Mapa de navegación → `docs/diagramas/navegacion.md`
- Matriz de permisos por rol → `docs/arquitectura/matriz_permisos.md`

### Matriz de Permisos (Resumen)

| Funcionalidad   | ADMIN | CONTADOR | ENTRENADOR | MIEMBRO |
|-----------------|-------|----------|------------|---------|
| Usuarios        | ✅    |          |            |         |
| Sedes           | ✅    |          |            |         |
| Competencias    | ✅    |          |            |         |
| Membresías      | ✅    | ✅       |            |         |
| Pagos           |       | ✅       |            | ✅ (propio) |
| Comprobantes    |       | ✅ (ver) |            | ✅ (cargar) |
| Asistencia      |       |          | ✅         |         |
| Entrenamientos  | ✅    |          | ✅         |         |
| Evaluaciones    |       |          | ✅         |         |
| Inscripciones   |       |          |            | ✅      |
| Reportes        | ✅    | ✅       | ✅         |         |
| Mi perfil       |       |          |            | ✅      |

---

## FASE 3 — Diseño Técnico

### Objetivo
Diseñar en detalle la arquitectura, base de datos y estructura del código.

### Actividades

#### Base de Datos
- Diseño del ERD completo
- Definición de tablas, PK, FK
- Índices y restricciones
- Relaciones entre entidades

#### Backend
- Definir Controllers, Services, Repositories
- Definir Entities, DTOs, Validators
- Diseñar Middleware, Authentication, Authorization
- Especificar todos los Endpoints

#### Frontend
- Definir Pages, Components, Layouts
- Definir Hooks, ViewModels, Services
- Diseñar Routes, Guards, State management

### Entregables
- Diagrama ERD → `docs/base-datos/erd.md`
- Especificación de Endpoints → `docs/arquitectura/endpoints_api.md`
- Decisión técnica → `docs/arquitectura/decision_tecnica.md`

---

## FASE 4 — Construcción MVP 1

### Objetivo
Implementar la funcionalidad central del sistema.

### Módulos

#### Módulo 1 — Autenticación
- [ ] Login con correo + contraseña + JWT
- [ ] Logout
- [ ] Protección de rutas por rol
- [ ] Cambio de contraseña
- [ ] Recuperación mediante PIN local

#### Módulo 2 — Usuarios
- [ ] Listar usuarios (paginado)
- [ ] Crear usuario con rol
- [ ] Editar usuario
- [ ] Activar/desactivar usuario (borrado lógico)
- [ ] Asignar rol

#### Módulo 3 — Membresías
- [ ] CRUD de planes de membresía
- [ ] Crear membresía para miembro
- [ ] Consultar estado de membresía
- [ ] Renovación de membresía

#### Módulo 4 — Pagos
- [ ] Registrar pago (MIEMBRO)
- [ ] Cargar comprobante (MIEMBRO)
- [ ] Listar pagos con filtros (CONTADOR)
- [ ] Visualizar comprobante (CONTADOR)
- [ ] Aprobar pago → activa membresía (CONTADOR)
- [ ] Rechazar pago con comentario (CONTADOR)

#### Módulo 5 — Asistencia
- [ ] Crear sesión de entrenamiento
- [ ] Registrar asistencia (ENTRENADOR)
- [ ] Marcar asistió / No asistió
- [ ] Consultar historial de asistencia

---

## FASE 5 — Construcción MVP 2

### Módulos

#### Módulo 6 — Entrenamientos
- [ ] CRUD de entrenamientos (ENTRENADOR/ADMIN)
- [ ] Asignar participantes
- [ ] Consultar agenda de entrenamientos

#### Módulo 7 — Competencias
- [ ] CRUD de competencias (ADMIN)
- [ ] Gestión de sedes

#### Módulo 8 — Inscripciones
- [ ] Inscribirse a competencia (MIEMBRO con membresía activa)
- [ ] Confirmar/cancelar inscripción (ADMIN)
- [ ] Validación RN-03 (membresía activa)

#### Módulo 9 — Evaluaciones
- [ ] Registrar evaluación de desempeño (ENTRENADOR)
- [ ] Consultar evaluaciones (MIEMBRO, ADMIN)

---

## FASE 6 — Construcción MVP 3

### Módulos

#### Módulo 10 — Reportes PDF
- [ ] Reporte de pagos por período (QuestPDF)
- [ ] Reporte de miembros activos
- [ ] Reporte de asistencia
- [ ] Reporte de competencias e inscripciones
- [ ] Reporte de rendimiento/evaluaciones

#### Módulo 11 — Dashboard
- [ ] Dashboard por rol con indicadores clave
- [ ] Gráficas básicas

#### Módulo 12 — Consultas Personales del Miembro
- [ ] Mi membresía actual
- [ ] Mi historial de pagos
- [ ] Mis inscripciones
- [ ] Mis evaluaciones

#### Mejoras UX
- [ ] Notificaciones de vencimiento de membresía
- [ ] Mejoras de responsividad
- [ ] Optimizaciones de rendimiento

---

## FASE 7 — Pruebas

### Estrategia de Pruebas

| Tipo de Prueba      | Herramienta          | Responsable |
|--------------------|----------------------|-------------|
| Unitarias backend  | xUnit + Moq          | Duban       |
| Integración API    | xUnit + TestServer   | Duban       |
| UI / Funcionales   | Manual               | Carlos      |
| Responsividad      | DevTools             | Carlos      |
| Rendimiento API    | Postman / k6         | Ambos       |
| Seguridad          | Manual + OWASP       | Ambos       |
| Aceptación         | Manual por RF        | Ambos       |

### Criterios de Aceptación de Rendimiento
- **RNF-02:** Tiempo de respuesta de API < 2 segundos en red local

---

## FASE 8 — Despliegue y Mantenimiento

### Entorno Inicial (MVP)
```
XAMPP local
   ↓
MySQL 8.x
   ↓
ASP .NET Core → localhost:5000
   ↓
React/Vite → localhost:5173
```

### Evolución Futura
```
XAMPP
   ↓
Servidor Linux/Windows dedicado
   ↓
Cloud (Azure / AWS)
   ↓
MySQL administrado
   ↓
Docker / Contenedores
```

---

## Roadmap General

### BLOQUE A — Fundaciones
| Fase   | Contenido             | Estado |
|--------|-----------------------|--------|
| FASE 0 | Planificación         | ✅     |
| FASE 1 | Requisitos            | ✅     |
| FASE 2 | Diseño funcional      | 🔄     |
| FASE 3 | Diseño técnico        | 🔄     |

### BLOQUE B — MVP 1
| Módulo          | Estado |
|-----------------|--------|
| Autenticación   | ⏳     |
| Usuarios        | ⏳     |
| Membresías      | ⏳     |
| Pagos           | ⏳     |
| Comprobantes    | ⏳     |
| Asistencia      | ⏳     |

### BLOQUE C — MVP 2
| Módulo          | Estado |
|-----------------|--------|
| Entrenamientos  | ⏳     |
| Competencias    | ⏳     |
| Inscripciones   | ⏳     |
| Evaluaciones    | ⏳     |

### BLOQUE D — MVP 3
| Módulo              | Estado |
|---------------------|--------|
| Reportes PDF        | ⏳     |
| Dashboard           | ⏳     |
| Consultas personales| ⏳     |
| Mejoras UX          | ⏳     |

### BLOQUE E — Calidad
| Actividad     | Estado |
|---------------|--------|
| Pruebas       | ⏳     |
| Seguridad     | ⏳     |
| Rendimiento   | ⏳     |
| Correcciones  | ⏳     |

### BLOQUE F — Entrega
| Actividad     | Estado |
|---------------|--------|
| Documentación | ⏳     |
| Instalación   | ⏳     |
| Demostración  | ⏳     |
| Presentación  | ⏳     |
