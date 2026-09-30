# Orden de Desarrollo — SPORTIFY CLUB MANAGER

## Filosofía

> **"No empiecen haciendo pantallas. Construyan primero los cimientos."**

El orden correcto de desarrollo es la diferencia entre un proyecto sólido y uno que colapsa durante la integración. Esta guía define el orden exacto en que deben construirse los componentes.

---

## Fase Inicial: Configuración del Entorno

### Paso 1 — Git / GitHub
```bash
git init
git remote add origin https://github.com/[usuario]/sportify-club-manager.git
git add .
git commit -m "chore: estructura inicial del proyecto"
git push -u origin main
```

**Ramas recomendadas:**
- `main` → Código estable / producción
- `develop` → Integración
- `feature/[nombre]` → Desarrollo de funcionalidades
- `fix/[nombre]` → Corrección de errores

---

### Paso 2 — Crear Solución .NET

```bash
# En /backend
dotnet new sln -n Sportify
dotnet new webapi -n Sportify.Api
dotnet new classlib -n Sportify.Application
dotnet new classlib -n Sportify.Domain
dotnet new classlib -n Sportify.Infrastructure
dotnet new xunit -n Sportify.Tests

dotnet sln add Sportify.Api/Sportify.Api.csproj
dotnet sln add Sportify.Application/Sportify.Application.csproj
dotnet sln add Sportify.Domain/Sportify.Domain.csproj
dotnet sln add Sportify.Infrastructure/Sportify.Infrastructure.csproj
dotnet sln add Sportify.Tests/Sportify.Tests.csproj
```

**Referencias entre proyectos:**
```
Sportify.Api → Sportify.Application + Sportify.Infrastructure
Sportify.Application → Sportify.Domain
Sportify.Infrastructure → Sportify.Application + Sportify.Domain
Sportify.Tests → todos
```

---

### Paso 3 — Configurar .NET 10

**Paquetes NuGet requeridos:**

```bash
# Sportify.Infrastructure
dotnet add package MySql.EntityFrameworkCore --version 10.0.*
dotnet add package Microsoft.EntityFrameworkCore.Design

# Sportify.Api
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package QuestPDF
dotnet add package Swashbuckle.AspNetCore

# Sportify.Application
dotnet add package FluentValidation
dotnet add package AutoMapper
```

---

### Paso 4 — Crear React + TypeScript

```bash
# En /frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom axios react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### Paso 5 — Configurar MySQL

1. Iniciar XAMPP → Apache + MySQL
2. Abrir phpMyAdmin → http://localhost/phpmyadmin
3. Ejecutar: `database/scripts/01_create_database.sql`

---

## Fase de Base de Datos

### Paso 6 — Diseñar ERD
- Diagramar entidades y relaciones
- Validar con el equipo
- Guardar en `docs/base-datos/erd.md`

### Paso 7 — Crear Entidades C#
En `Sportify.Domain/Entities/`:
```
1. Usuario.cs
2. Rol.cs
3. UsuarioRol.cs
4. Sede.cs
5. PlanMembresia.cs
6. Membresia.cs
7. Pago.cs
8. ComprobantePago.cs
9. Entrenamiento.cs
10. ParticipanteEntrenamiento.cs
11. Asistencia.cs
12. Competencia.cs
13. InscripcionCompetencia.cs
14. EvaluacionCompetencia.cs
15. PasswordResetToken.cs
```

### Paso 8 — Configurar EF Core
```csharp
// SportifyDbContext.cs
services.AddDbContext<SportifyDbContext>(options =>
    options.UseMySQL(connectionString));
```

### Paso 9 — Migraciones
```bash
dotnet ef migrations add InitialCreate --project Sportify.Infrastructure --startup-project Sportify.Api
dotnet ef database update --project Sportify.Infrastructure --startup-project Sportify.Api
```

### Paso 10 — Seed de Roles
```csharp
// En Program.cs o DataSeeder.cs
await SeedRoles(app); // ADMIN, CONTADOR, ENTRENADOR, MIEMBRO
await SeedAdminUser(app); // Usuario administrador inicial
await SeedMembershipPlans(app); // Planes: Mensual, Trimestral, Semestral, Anual
```

---

## Fase de Autenticación (Más Crítica)

### Paso 11 — Autenticación Backend
```
AuthController
    ↓
AuthService
    ↓
UserRepository (GetByEmail)
    ↓
BCrypt.Verify(password, hash)
    ↓
JwtTokenService.GenerateToken(user, roles)
```

### Paso 12 — JWT
```csharp
// Token claims:
new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
new Claim(JwtRegisteredClaimNames.Email, user.Correo),
new Claim(ClaimTypes.Role, rol),
new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
```

### Paso 13 — Autorización por Roles
```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("ADMIN"));
    options.AddPolicy("ContadorOnly", policy => policy.RequireRole("CONTADOR"));
    options.AddPolicy("EntrenadorOnly", policy => policy.RequireRole("ENTRENADOR"));
    options.AddPolicy("MiembroOnly", policy => policy.RequireRole("MIEMBRO"));
});
```

---

## Fase de Módulos (Orden de Implementación)

```
14. Usuarios      → CRUD + borrado lógico + asignación de roles
15. Membresías    → Planes + estados + fechas
16. Pagos         → Registro + estados + validaciones RN-04, RN-05
17. Comprobantes  → Upload multipart + validación MIME/tamaño + preview
18. Asistencia    → Sesiones + marcado por ENTRENADOR
19. Entrenamientos→ CRUD + participantes
20. Competencias  → CRUD + sedes
21. Inscripciones → RN-03 (validar membresía activa)
22. Evaluaciones  → Registro + consulta
23. Reportes      → QuestPDF para pagos, miembros, asistencia
24. Pruebas       → Unitarias + integración + UI
25. Integración   → E2E, ajustes finales, documentación
```

---

## Checklist de Desarrollo

### Backend por Módulo
Para cada módulo, seguir este orden:
- [ ] Entity en `Sportify.Domain/Entities/`
- [ ] Interfaz en `Sportify.Application/Interfaces/`
- [ ] DTOs en `Sportify.Application/DTOs/`
- [ ] Service en `Sportify.Application/Services/`
- [ ] Repository en `Sportify.Infrastructure/Repositories/`
- [ ] Controller en `Sportify.Api/Controllers/`
- [ ] Prueba unitaria en `Sportify.Tests/Unit/`
- [ ] Prueba de integración en `Sportify.Tests/Integration/`

### Frontend por Módulo
Para cada módulo, seguir este orden:
- [ ] Tipos en `src/models/`
- [ ] Service en `src/services/`
- [ ] ViewModel (Hook) en `src/viewmodels/`
- [ ] Componentes en `src/components/`
- [ ] Página en `src/pages/`
- [ ] Ruta en `src/routes/AppRoutes.tsx`
- [ ] Validación en `src/validations/`
- [ ] Prueba manual UI

---

## Seguridad — Lista de Verificación

- [ ] JWT Bearer configurado correctamente
- [ ] HTTPS habilitado en producción
- [ ] Contraseñas hasheadas con BCrypt (nunca SHA-256 simple)
- [ ] Validación de entrada en todos los endpoints
- [ ] Validación de archivos: extensión + MIME + tamaño (máx 5MB)
- [ ] Autorización por roles en todos los endpoints protegidos
- [ ] CORS configurado solo para origen del frontend
- [ ] Secretos en variables de entorno (NUNCA en Git)
- [ ] Borrado lógico implementado en entidades críticas
- [ ] Logs de errores habilitados
- [ ] Manejo centralizado de excepciones
- [ ] No revelar información sensible en mensajes de error

### Variables de Entorno Requeridas
```
DB_CONNECTION_STRING=Server=localhost;Port=3306;Database=sportify_db;User=root;Password=;
JWT_SECRET=[cadena aleatoria segura de al menos 32 caracteres]
JWT_ISSUER=SportifyClubManager
JWT_AUDIENCE=SportifyUsers
STORAGE_PATH=../storage/comprobantes
```

> ⚠️ **NUNCA** subir estos valores a Git. Usar `.env` o `appsettings.Development.json` excluidos del `.gitignore`.
