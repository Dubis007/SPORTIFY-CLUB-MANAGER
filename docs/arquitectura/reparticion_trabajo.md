# Repartición de Trabajo — SPORTIFY CLUB MANAGER

## Asignación por desarrollador

| Desarrollador | Rol Principal           | Tecnologías                                  |
|---------------|-------------------------|----------------------------------------------|
| **Duban**     | Backend Developer       | ASP .NET Core, C#, EF Core, MySQL, JWT       |
| **Carlos Andrés** | Frontend Developer + QA | React, TypeScript, Tailwind, Pruebas UI  |

---

## Duban — Backend

### Responsabilidades Principales

#### 🔧 Infraestructura y Configuración
- [ ] Configurar solución .NET con arquitectura por capas
- [ ] Configurar Entity Framework Core + MySQL
- [ ] Crear migraciones de base de datos
- [ ] Configurar autenticación JWT Bearer
- [ ] Configurar autorización por roles y políticas
- [ ] Configurar CORS para el frontend React
- [ ] Configurar Swagger/OpenAPI
- [ ] Middleware de manejo global de excepciones

#### 🔐 Módulo de Autenticación
- [ ] POST /api/auth/login → Verificar credenciales + generar JWT
- [ ] POST /api/auth/forgot-password → Generar PIN temporal
- [ ] POST /api/auth/reset-password → Validar PIN + actualizar contraseña

#### 👥 Módulo de Usuarios
- [ ] GET/POST/PUT /api/users
- [ ] PATCH /api/users/{id}/status (borrado lógico)
- [ ] GET /api/roles

#### 🏅 Módulo de Membresías
- [ ] CRUD /api/payment-plans
- [ ] CRUD /api/memberships
- [ ] Lógica de renovación y estados

#### 💰 Módulo de Pagos
- [ ] GET/POST /api/payments
- [ ] PATCH /api/payments/{id}/approve → RN-04 (activa membresía)
- [ ] PATCH /api/payments/{id}/reject → RN-05 (requiere comentario)

#### 📎 Módulo de Comprobantes
- [ ] POST /api/receipts (upload multipart)
- [ ] GET /api/receipts/{id}/preview
- [ ] Validación: extensión + MIME type + máx 5MB

#### 📋 Módulo de Asistencia
- [ ] POST /api/training (crear sesión)
- [ ] GET/POST /api/attendance

#### 🏆 Módulo de Competencias e Inscripciones
- [ ] CRUD /api/competitions
- [ ] POST /api/registrations → RN-03 (validar membresía activa)
- [ ] CRUD /api/evaluations

#### 📊 Módulo de Reportes
- [ ] GET /api/reports/payments/pdf (QuestPDF)
- [ ] GET /api/reports/members/pdf
- [ ] GET /api/reports/attendance/pdf

#### 🗄️ Base de Datos
- [ ] Diseño ERD completo
- [ ] Scripts SQL (tablas, constraints, seed, test data)
- [ ] Optimización de índices

#### 🧪 Pruebas Backend
- [ ] Pruebas unitarias de Services (xUnit + Moq)
- [ ] Pruebas de integración de Controllers

---

## Carlos Andrés — Frontend + QA

### Responsabilidades Principales

#### ⚙️ Configuración Frontend
- [ ] Crear proyecto Vite + React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar React Router
- [ ] Configurar Axios con interceptores JWT
- [ ] Configurar AuthContext
- [ ] Configurar rutas protegidas por rol

#### 🔐 Módulo de Autenticación UI
- [ ] LoginPage (formulario + Zod + React Hook Form)
- [ ] ForgotPasswordPage (paso 1: email, paso 2: PIN)
- [ ] Logout

#### 📐 Layouts por Rol
- [ ] AdminLayout (sidebar + header)
- [ ] AccountantLayout
- [ ] CoachLayout
- [ ] MemberLayout

#### 👑 Páginas de ADMIN
- [ ] Dashboard con estadísticas
- [ ] UsersPage (tabla + CRUD + toggle activo)
- [ ] CompetitionsPage
- [ ] LocationsPage

#### 🧮 Páginas de CONTADOR
- [ ] Dashboard contador
- [ ] PaymentsPage (filtros + aprobar/rechazar)
- [ ] ReceiptsPage (previsualización JPG/PNG/PDF)
- [ ] MembershipsPage
- [ ] ReportsPage (botones descarga PDF)

#### 💪 Páginas de ENTRENADOR
- [ ] Dashboard entrenador
- [ ] TrainingsPage
- [ ] AttendancePage (checklist de asistencia)
- [ ] EvaluationsPage

#### 🏃 Páginas de MIEMBRO
- [ ] Dashboard miembro (estado membresía)
- [ ] MyPaymentsPage (registrar pago + subir comprobante)
- [ ] MyMembershipPage
- [ ] RegistrationsPage (inscribirse a competencias)
- [ ] MyEvaluationsPage
- [ ] MyProfilePage

#### 🧩 Componentes Compartidos
- [ ] Button (variantes: primary, secondary, danger)
- [ ] Input con validación
- [ ] Modal reutilizable
- [ ] DataTable con paginación
- [ ] Toast/notificaciones
- [ ] LoadingSpinner
- [ ] ConfirmDialog
- [ ] FileUpload (arrastrar y soltar + validación)

#### ✅ QA y Pruebas
- [ ] Pruebas funcionales de todos los flujos
- [ ] Pruebas de responsividad (móvil, tablet, desktop)
- [ ] Pruebas de compatibilidad (Chrome, Firefox, Edge)
- [ ] Pruebas de validación de formularios
- [ ] Pruebas de carga de archivos
- [ ] Pruebas de rendimiento UI
- [ ] Documentación de bugs encontrados

---

## Responsabilidades Compartidas

| Actividad               | Duban | Carlos |
|-------------------------|-------|--------|
| Análisis de requisitos  | ✅    | ✅     |
| Diseño de base de datos | ✅    | ✅     |
| Diagramas de arquitectura| ✅   | ✅     |
| Casos de uso            | ✅    | ✅     |
| Control de versiones Git| ✅    | ✅     |
| Integración Frontend-API| ✅    | ✅     |
| Pruebas finales E2E     | ✅    | ✅     |
| Documentación del sistema| ✅   | ✅     |
| Presentación del proyecto| ✅   | ✅     |

---

## Flujo de Trabajo Git

### Estrategia de ramas

```
main ←─────────────────────────── releases estables
  └── develop ←──────────────────── integración
        ├── feature/auth-backend ── Duban
        ├── feature/users-backend── Duban
        ├── feature/auth-frontend── Carlos
        ├── feature/payments-ui ─── Carlos
        └── fix/login-error ─────── Carlos
```

### Proceso de integración
1. Desarrollar en rama `feature/[nombre]`
2. Hacer commit con mensaje descriptivo
3. Crear Pull Request a `develop`
4. Revisión de código (peer review)
5. Merge a `develop`
6. Prueba integrada
7. Merge a `main` cuando el MVP está completo

### Convención de commits
```
feat: nueva funcionalidad
fix: corrección de bug
chore: cambios de configuración
docs: cambios en documentación
refactor: refactorización sin cambio funcional
test: agregar o modificar pruebas
```
