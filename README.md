# SPORTIFY CLUB MANAGER

## Plataforma web de gestión de clubes deportivos

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Metodología](https://img.shields.io/badge/Metodología-Cascada-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%2019.2%20%2B%20TypeScript-61DAFB)
![Backend](https://img.shields.io/badge/Backend-ASP.NET%20Core%20.NET%2010-512BD4)
![BD](https://img.shields.io/badge/BD-MySQL%208.x-4479A1)

---

## 📋 Descripción

**SPORTIFY CLUB MANAGER** es una plataforma web de gestión integral para clubes deportivos, desarrollada como proyecto académico. Permite administrar usuarios, membresías, pagos, comprobantes, entrenamientos, competencias y asistencia mediante una arquitectura moderna Cliente → API REST → lógica de negocio → acceso a datos → MySQL.

---

## 👥 Equipo

| Nombre        | Rol Principal                        |
|---------------|--------------------------------------|
| Duban         | Backend (ASP .NET Core, C#, MySQL)   |
| Carlos Andrés | Frontend (React, TypeScript) + QA    |

---

## 🏗️ Arquitectura

```
NAVEGADOR WEB
  React 19.2 + TypeScript + Tailwind CSS
  Pages / Components / ViewModels / Hooks
          │
          │  HTTPS / HTTP + JSON (REST API)
          ▼
  ASP .NET CORE WEB API (.NET 10 LTS)
  Controllers → Services → Repositories
  Entity Framework Core 10
          │
          ▼
        MySQL 8.x
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología       | Versión   | Uso                       |
|------------------|-----------|---------------------------|
| React            | 19.2      | Framework UI              |
| TypeScript       | Latest    | Tipado estático           |
| Vite             | Latest    | Bundler / Dev Server      |
| Tailwind CSS     | Latest    | Estilos                   |
| React Router     | Latest    | Navegación / Rutas        |
| Axios            | Latest    | Peticiones HTTP           |
| React Hook Form  | Latest    | Manejo de formularios     |
| Zod              | Latest    | Validación de esquemas    |

### Backend
| Tecnología                  | Versión   | Uso                            |
|-----------------------------|-----------|--------------------------------|
| C#                          | 13        | Lenguaje principal             |
| .NET                        | 10 LTS    | Plataforma (soporte hasta 2028)|
| ASP .NET Core Web API       | 10        | API REST                       |
| Entity Framework Core       | 10        | ORM                            |
| MySql.EntityFrameworkCore   | 10.0.x    | Proveedor MySQL oficial        |
| JWT Bearer Authentication   | Latest    | Autenticación                  |
| BCrypt / PasswordHasher     | Latest    | Hash de contraseñas            |
| QuestPDF                    | Latest    | Generación de reportes PDF     |

### Base de datos
| Tecnología  | Versión | Uso                           |
|-------------|---------|-------------------------------|
| MySQL       | 8.x     | Base de datos principal       |
| XAMPP       | Latest  | Entorno local de desarrollo   |
| phpMyAdmin  | Latest  | Administración visual MySQL   |

---

## 👤 Roles del sistema

| Rol           | Descripción                                                  |
|---------------|--------------------------------------------------------------|
| ADMIN         | Administra usuarios, sedes y competencias                    |
| CONTADOR      | Gestiona pagos, valida comprobantes, genera reportes         |
| ENTRENADOR    | Registra asistencia, entrenamientos y evaluaciones           |
| MIEMBRO       | Consulta su información, carga comprobantes, se inscribe     |

---

## 📦 MVPs (Minimum Viable Products)

### MVP 1
- ✅ Autenticación (Login, JWT, Logout)
- ✅ Usuarios y Roles
- ✅ Membresías
- ✅ Pagos y Comprobantes
- ✅ Asistencia

### MVP 2
- ⏳ Entrenamientos
- ⏳ Competencias
- ⏳ Inscripciones
- ⏳ Evaluaciones

### MVP 3
- ⏳ Reportes PDF avanzados
- ⏳ Dashboard con indicadores
- ⏳ Consultas personales
- ⏳ Mejoras UX

---

## 📁 Estructura del repositorio

```
SPORTIFY-CLUB-MANAGER/
├── README.md
├── .gitignore
├── LICENSE
│
├── docs/               # Documentación técnica y funcional
├── frontend/           # React + TypeScript + Tailwind
├── backend/            # ASP .NET Core + C#
├── database/           # Scripts SQL y diagramas
├── storage/            # Archivos físicos (comprobantes)
└── .github/            # Workflows CI/CD
```

---

## 🚀 Instalación rápida

### Requisitos previos
- Node.js 20+ 
- .NET 10 SDK
- XAMPP (MySQL 8.x)
- Git

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend/Sportify.Api
dotnet restore
dotnet run
```

### Base de datos
1. Iniciar XAMPP → MySQL
2. Ejecutar scripts en orden:
   - `database/scripts/01_create_database.sql`
   - `database/scripts/02_tables.sql`
   - `database/scripts/03_constraints.sql`
   - `database/scripts/04_seed.sql`

---

## 🔗 API Endpoints principales

| Método | Endpoint                          | Descripción               | Rol        |
|--------|-----------------------------------|---------------------------|------------|
| POST   | /api/auth/login                   | Iniciar sesión            | Todos      |
| POST   | /api/auth/forgot-password         | Solicitar recuperación    | Todos      |
| POST   | /api/auth/reset-password          | Resetear contraseña       | Todos      |
| GET    | /api/users                        | Listar usuarios           | ADMIN      |
| POST   | /api/users                        | Crear usuario             | ADMIN      |
| GET    | /api/memberships                  | Listar membresías         | ADMIN/CONT |
| POST   | /api/payments                     | Registrar pago            | MIEMBRO    |
| PATCH  | /api/payments/{id}/approve        | Aprobar pago              | CONTADOR   |
| POST   | /api/receipts                     | Subir comprobante         | MIEMBRO    |
| GET    | /api/receipts/{id}/preview        | Previsualizar comprobante | CONTADOR   |
| GET    | /api/reports/payments/pdf         | Reporte PDF pagos         | CONTADOR   |

---

## 📄 Licencia

Proyecto académico — Nuevas Tecnologías 2026
