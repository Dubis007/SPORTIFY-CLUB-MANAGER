# Decisión Técnica – SPORTIFY CLUB MANAGER

> **Documento de Arquitectura Técnica**  
> Proyecto: Sistema de Gestión de Clubes Deportivos  
> Clasificación: Interno – Uso académico/profesional

---

## 📋 Control de Versiones

| Versión | Fecha      | Autor           | Descripción del cambio              |
|---------|------------|-----------------|-------------------------------------|
| 1.0.0   | 2026-09-01 | Equipo Sportify | Documento inicial de arquitectura   |
| 1.1.0   | 2026-09-01 | Equipo Sportify | Añadida estrategia JWT y PDF        |
| 1.2.0   | 2026-09-01 | Equipo Sportify | Estructura de carpetas y seguridad  |

---

## 1. Introducción

**SPORTIFY CLUB MANAGER** es un sistema integral de gestión de clubes deportivos desarrollado con una arquitectura **cliente-servidor** moderna y escalable. El sistema permite administrar de forma centralizada todos los procesos operativos de un club deportivo: membresías, pagos, entrenamientos, competencias, asistencia e inscripciones.

### 1.1 Objetivo del Sistema

Proveer una plataforma web robusta y de fácil uso que centralice la gestión administrativa y deportiva de un club, reduciendo la carga operativa manual y mejorando la trazabilidad de los datos.

### 1.2 Contexto Tecnológico

El sistema adopta una arquitectura de dos capas principales:

- **Backend**: API RESTful construida sobre **.NET 8 / ASP.NET Core 8**, expuesta mediante endpoints HTTP seguros con autenticación JWT.
- **Frontend**: Aplicación de página única (SPA) implementada en **Blazor WebAssembly**, que se ejecuta completamente en el navegador del cliente y se comunica con el backend mediante HTTP/REST.

Esta elección permite compartir modelos, lógica de validación y tipos entre ambas capas al estar ambas escritas en **C#**, reduciendo la duplicación de código y mejorando la coherencia del sistema.

---

## 2. Stack Tecnológico Completo

### 2.1 Tabla de Decisiones Técnicas

| Capa / Responsabilidad   | Tecnología                              | Versión     | Justificación técnica                                                        |
|--------------------------|-----------------------------------------|-------------|------------------------------------------------------------------------------|
| **Backend Framework**    | .NET / ASP.NET Core                     | 8.0 (LTS)   | Rendimiento superior, soporte LTS hasta 2026, ecosistema maduro y multiplataforma |
| **Frontend**             | Blazor WebAssembly                      | .NET 8      | Componentes .NET ejecutados en el cliente; C# compartido con el backend, sin JavaScript obligatorio |
| **ORM**                  | Entity Framework Core                   | 8.0         | Fluent API declarativa, migraciones automáticas, integración nativa con el ecosistema .NET |
| **Base de Datos**        | PostgreSQL                              | 16          | Open source, robusto, soporte nativo JSON, excelente rendimiento en consultas complejas |
| **Autenticación**        | JWT (System.IdentityModel.Tokens.Jwt)   | 7.x         | Estándar de la industria, protocolo sin estado (stateless), compatible con múltiples clientes |
| **Generación de PDF**    | QuestPDF                                | 2024.x      | API fluente, sin licencia comercial restrictiva, generación en memoria sin dependencias externas |
| **Almacenamiento**       | Sistema de archivos local (LocalFileStorage) | —       | Simplicidad en entorno académico/local; ruta configurable en appsettings.json |
| **Hash de contraseñas**  | BCrypt.Net-Next                         | 4.x         | Algoritmo lento por diseño, resistente a ataques de fuerza bruta, factor de costo configurable |
| **Validaciones**         | FluentValidation                        | 11.x        | Separación de responsabilidades, reglas reutilizables y expresivas, integración con ASP.NET Core |
| **Mapeo de objetos**     | AutoMapper                              | 13.x        | Reducción de código boilerplate en conversiones DTO <-> Entidad              |
| **Correo electrónico**   | MailKit / MimeKit                       | 4.x         | Open source, protocolo SMTP configurable en appsettings.json, soporte TLS   |
| **CORS**                 | ASP.NET Core built-in                   | 8.0         | Configuración por política de dominio, sin dependencias adicionales           |
| **IDE**                  | Visual Studio 2022 / VS Code            | 17.x / 1.x  | Ecosistema .NET completo, soporte Blazor y depuración integrada              |
| **Control de versiones** | Git + GitHub                            | —           | Estándar de la industria, historial completo, colaboración y CI/CD           |

---

## 3. Arquitectura por Capas

El sistema sigue una arquitectura en capas inspirada en **Clean Architecture**, separando claramente las responsabilidades y garantizando independencia entre capas.

### 3.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────┐
│              FRONTEND (BLAZOR WASM)          │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Pages   │ │Components│ │  Services   │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
│              ViewModels / State              │
└─────────────────┬───────────────────────────┘
                  │ HTTP / REST (JWT Bearer)
┌─────────────────▼───────────────────────────┐
│              BACKEND (ASP.NET CORE 8)        │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Controllers│ │ Services │ │Repositories │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  DTOs    │ │ Entities │ │  Validators │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
└─────────────────┬───────────────────────────┘
                  │ EF Core
┌─────────────────▼───────────────────────────┐
│           BASE DE DATOS (POSTGRESQL 16)      │
│         Tablas / Índices / Migraciones       │
└─────────────────────────────────────────────┘
```

### 3.2 Descripción de Capas

| Capa               | Responsabilidad                                                                 |
|--------------------|---------------------------------------------------------------------------------|
| **Presentación**   | Blazor WebAssembly: renderiza la UI, gestiona el estado local y consume la API  |
| **API / Controladores** | Recibe solicitudes HTTP, aplica autorización, delega lógica a Services     |
| **Aplicación**     | Contiene casos de uso, DTOs, interfaces de servicios y validadores              |
| **Dominio**        | Entidades de negocio, enumeraciones y reglas del dominio puras                  |
| **Infraestructura**| Implementación de repositorios, acceso a BD, correo, almacenamiento de archivos |

---

## 4. Patrón MVVM Ligero en Frontend

Blazor WebAssembly implementa una variante del patrón **MVVM (Model-View-ViewModel)** adaptada al modelo de componentes de .NET:

### 4.1 Roles en la Implementación

| Rol MVVM      | Equivalente en Blazor                        | Descripción                                                                 |
|---------------|----------------------------------------------|-----------------------------------------------------------------------------|
| **View**      | `Pages/*.razor` y `Components/*.razor`       | Marcado HTML + directivas Blazor; responsable únicamente de la presentación |
| **ViewModel** | Clases C# en `ViewModels/`                   | Contienen el estado del componente, comandos y lógica de presentación       |
| **Model**     | DTOs devueltos por la API (`Application/DTOs`) | Representan los datos del negocio consumidos por los ViewModels            |
| **Service**   | `Services/` en Blazor                        | Capa de acceso a datos; realizan llamadas HTTP al backend mediante HttpClient |

### 4.2 Flujo de Datos

```
Usuario interactúa con la Page (View)
        │
        ▼
ViewModel recibe la acción → llama a Service
        │
        ▼
Service realiza llamada HTTP a la API REST
        │
        ▼
API procesa → retorna DTO
        │
        ▼
ViewModel actualiza su estado
        │
        ▼
Blazor re-renderiza la View automáticamente
```

### 4.3 Ejemplo de Estructura

```csharp
// Pages/Miembros/ListaMiembros.razor (View)
@page "/miembros"
@inject MiembrosViewModel ViewModel

<h1>Miembros</h1>
@foreach (var m in ViewModel.Miembros) { ... }

// ViewModels/MiembrosViewModel.cs (ViewModel)
public class MiembrosViewModel
{
    public List<MiembroDto> Miembros { get; private set; } = new();
    public async Task CargarAsync() =>
        Miembros = await _miembrosService.ObtenerTodosAsync();
}

// Services/MiembrosService.cs (Service)
public class MiembrosService
{
    public async Task<List<MiembroDto>> ObtenerTodosAsync() =>
        await _http.GetFromJsonAsync<List<MiembroDto>>("/api/miembros");
}
```

---

## 5. Estrategia de Autenticación JWT

### 5.1 Flujo de Autenticación

```
Cliente (Blazor)                   Servidor (ASP.NET Core)
      │                                      │
      │──── POST /api/auth/login ──────────▶│
      │     { email, password }              │
      │                                      │── Valida credenciales
      │                                      │── BCrypt.Verify(password)
      │                                      │── Genera AccessToken (60 min)
      │                                      │── Genera RefreshToken (7 días)
      │◀─── 200 OK ──────────────────────────│
      │     { accessToken, refreshToken }    │
      │                                      │
      │── [AccessToken en memoria RAM] ──────│
      │── [RefreshToken en cookie httpOnly] ─│
      │                                      │
      │──── GET /api/miembros ─────────────▶│
      │     Authorization: Bearer <token>    │── Valida firma JWT
      │                                      │── Extrae Claims
      │◀─── 200 OK (datos) ─────────────────│
```

### 5.2 Configuración de Tokens

| Parámetro         | Valor              | Justificación                                     |
|-------------------|--------------------|---------------------------------------------------|
| **AccessToken**   | Expiración: 60 min | Ventana de ataque limitada en caso de compromiso  |
| **RefreshToken**  | Expiración: 7 días | Balance entre seguridad y experiencia de usuario  |
| **Almacenamiento**| RAM del cliente    | Evita ataques XSS por acceso a localStorage       |
| **Algoritmo**     | HS256 / RS256      | Firma criptográfica verificable por el servidor   |

### 5.3 Claims del Token

```json
{
  "sub": "user-guid-aqui",
  "email": "usuario@sportify.com",
  "roles": ["ADMIN", "ENTRENADOR"],
  "clubId": "club-guid-aqui",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### 5.4 Interceptor HTTP Automático

```csharp
public class AuthTokenHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var token = await _authService.GetAccessTokenAsync();
        if (!string.IsNullOrEmpty(token))
            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

        return await base.SendAsync(request, cancellationToken);
    }
}
```

### 5.5 Recuperación de Contraseña

```
Usuario solicita reset
        │
        ▼
API genera token firmado (GUID + HMAC) con expiración de 1 hora
        │
        ▼
Envío por MailKit al correo registrado
        │
        ▼
Usuario hace clic en el enlace con el token
        │
        ▼
API valida: firma ✓, no expirado ✓, no usado ✓
        │
        ▼
Usuario establece nueva contraseña → token invalidado (uso único)
```

---

## 6. Estrategia de Almacenamiento de Comprobantes

### 6.1 Organización del Sistema de Archivos

```
/uploads/
└── comprobantes/
    └── {año}/
        └── {mes}/
            └── {guid}.{extensión}

Ejemplo:
/uploads/comprobantes/2026/09/3f7a1c2d-8b4e-4f9a-a1b2-c3d4e5f6a7b8.pdf
```

### 6.2 Restricciones y Políticas

| Parámetro              | Valor                         |
|------------------------|-------------------------------|
| **Tamaño máximo**      | 5 MB por archivo              |
| **Formatos aceptados** | `.jpg`, `.png`, `.pdf`        |
| **Nomenclatura**       | GUID v4 (evita colisiones)    |
| **Acceso directo**     | Prohibido desde el frontend   |
| **Acceso controlado**  | Solo a través de la API       |

### 6.3 Configuración en appsettings.json

```json
{
  "Storage": {
    "BasePath": "C:/sportify/uploads",
    "MaxFileSizeMB": 5,
    "AllowedExtensions": [".jpg", ".png", ".pdf"]
  }
}
```

### 6.4 Flujo de Acceso a Archivos

```
Frontend solicita comprobante
        │
        ▼
GET /api/comprobantes/{id}
        │
        ▼
API verifica autorización (¿tiene permiso el usuario?)
        │
        ▼
API lee el archivo del sistema de archivos local
        │
        ▼
API devuelve el archivo como stream con Content-Type correcto
        │
        ▼
Frontend recibe y muestra el archivo
```

---

## 7. Generación de PDFs con QuestPDF

### 7.1 Documentos Generados

| Documento                  | Descripción                                               |
|----------------------------|-----------------------------------------------------------|
| **Reporte de Pagos**       | Historial de pagos por miembro o período                  |
| **Comprobante de Membresía** | Confirmación de inscripción con datos del socio         |
| **Reporte de Asistencia**  | Registro de asistencia a entrenamientos                   |
| **Reporte de Inscripciones** | Lista de participantes en competencias                  |
| **Estado de Cuenta**       | Resumen financiero del club o de un miembro               |

### 7.2 Estructura de Plantilla PDF

```
┌─────────────────────────────────────┐
│  [Logo del Club]    SPORTIFY CLUB   │  ← Cabecera
│  Reporte de Pagos - Septiembre 2026 │
├─────────────────────────────────────┤
│  Generado: 01/09/2026               │  ← Metadatos
│  Período: 01/09 - 30/09/2026        │
├────────┬──────────┬─────┬───────────┤
│ Fecha  │ Miembro  │ $   │  Estado   │  ← Cuerpo tabular
├────────┼──────────┼─────┼───────────┤
│  ...   │   ...    │ ... │   ...     │
├─────────────────────────────────────┤
│ Total: $X.XXX                       │  ← Totales
├─────────────────────────────────────┤
│  Sportify Club Manager © 2026       │  ← Pie de página
└─────────────────────────────────────┘
```

### 7.3 Ejemplo de Generación en Memoria

```csharp
// Generación en memoria → stream al cliente (sin archivos temporales)
public byte[] GenerarReportePagos(List<PagoDto> pagos)
{
    return Document.Create(container =>
    {
        container.Page(page =>
        {
            page.Header().Element(CabeceraPDF);
            page.Content().Element(c => CuerpoPagos(c, pagos));
            page.Footer().Element(PiePaginaPDF);
        });
    }).GeneratePdf();
}
```

> **Ventaja clave**: Sin dependencia de Microsoft Office, LibreOffice ni herramientas externas.
> El PDF se genera completamente en memoria y se transmite al cliente como respuesta HTTP
> con `Content-Type: application/pdf`.

---

## 8. Borrado Lógico (Soft Delete)

### 8.1 Clase Base con Auditoría

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }

    // Auditoría de creación y modificación
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    // Borrado lógico
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}
```

### 8.2 Entidades con Borrado Lógico

| Entidad          | Justificación del borrado lógico                                    |
|------------------|---------------------------------------------------------------------|
| **Usuario**      | Preservar historial de pagos y actividad aunque el usuario se elimine |
| **Membresía**    | Mantener trazabilidad de períodos activos e inactivos               |
| **Pago**         | Auditoría financiera; los pagos no se eliminan físicamente nunca    |
| **Competencia**  | Conservar resultados históricos aunque la competencia se cancele    |
| **Entrenamiento**| Preservar registros de asistencia de sesiones pasadas               |

### 8.3 Global Query Filter con EF Core

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Aplicar soft delete filter a todas las entidades que heredan de BaseEntity
    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
    {
        if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
        {
            modelBuilder.Entity(entityType.ClrType)
                .HasQueryFilter(e => !((BaseEntity)e).IsDeleted);
        }
    }
}

// Método de borrado lógico en el repositorio base
public async Task SoftDeleteAsync(Guid id)
{
    var entity = await _context.Set<T>().FindAsync(id);
    entity.IsDeleted = true;
    entity.DeletedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
}
```

> **Nota**: Para consultar registros eliminados (administración), se puede usar
> `.IgnoreQueryFilters()` de forma explícita en los repositorios autorizados.

---

## 9. Seguridad del Sistema

### 9.1 Capas de Seguridad Implementadas

```
┌──────────────────────────────────────────────────┐
│                  CAPAS DE SEGURIDAD              │
│                                                  │
│  1. HTTPS (TLS) ──── Cifrado en tránsito         │
│  2. CORS ─────────── Solo dominio del frontend   │
│  3. Rate Limiting ── Protección en /auth/login   │
│  4. JWT + Claims ─── Autenticación e identidad   │
│  5. [Authorize] ──── Control de acceso por rol   │
│  6. FluentValidation ─ Validación de entrada     │
│  7. BCrypt ────────── Hash de contraseñas        │
│  8. Soft Delete ───── Integridad de datos        │
└──────────────────────────────────────────────────┘
```

### 9.2 Hash de Contraseñas con BCrypt

```csharp
// Cost factor 12: balance entre seguridad y rendimiento
// ~250ms por hash en hardware moderno → disuasivo para fuerza bruta
var hash = BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 12);
var valido = BCrypt.Net.BCrypt.Verify(plainPassword, hash);
```

### 9.3 Autorización Basada en Roles

```csharp
[Authorize(Roles = "ADMIN")]
[HttpDelete("{id}")]
public async Task<IActionResult> EliminarMiembro(Guid id) { ... }

[Authorize(Roles = "ADMIN,ENTRENADOR")]
[HttpGet("entrenamientos")]
public async Task<IActionResult> ObtenerEntrenamientos() { ... }
```

### 9.4 Configuración de CORS

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("SportifyPolicy", policy =>
    {
        policy.WithOrigins("https://app.sportify.com")
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .AllowCredentials();
    });
});
```

### 9.5 Rate Limiting en Login

```csharp
// Máximo 5 intentos de login por IP cada 15 minutos
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", config =>
    {
        config.PermitLimit = 5;
        config.Window = TimeSpan.FromMinutes(15);
    });
});
```

### 9.6 Resumen de Políticas de Seguridad

| Medida                  | Implementación                                  | Estado    |
|-------------------------|-------------------------------------------------|-----------|
| HTTPS en producción     | Redirección forzada `UseHttpsRedirection()`     | Activo    |
| Hash de contraseñas     | BCrypt, cost factor 12                          | Activo    |
| JWT de corta duración   | AccessToken 60 min / RefreshToken 7 días        | Activo    |
| Autorización por roles  | `[Authorize(Roles = "...")]`                    | Activo    |
| Validación de entrada   | FluentValidation en todas las operaciones       | Activo    |
| CORS restringido        | Solo dominio del frontend declarado             | Activo    |
| Rate limiting           | Endpoints de autenticación                      | Activo    |
| Tokens de uso único     | Recuperación de contraseña                      | Activo    |
| Borrado lógico          | Datos críticos nunca se eliminan físicamente    | Activo    |
| Auditoría de cambios    | CreatedBy, UpdatedBy, CreatedAt, UpdatedAt      | Activo    |

---

## 10. Estructura de Carpetas del Proyecto

```
SPORTIFY-CLUB-MANAGER/
├── src/
│   ├── Sportify.API/                  (ASP.NET Core Web API - punto de entrada HTTP)
│   │   ├── Controllers/               (Controladores REST por dominio)
│   │   │   ├── AuthController.cs
│   │   │   ├── MiembrosController.cs
│   │   │   ├── PagosController.cs
│   │   │   └── ...
│   │   ├── Middleware/                (Manejo global de errores, logging)
│   │   │   ├── ExceptionMiddleware.cs
│   │   │   └── RequestLoggingMiddleware.cs
│   │   ├── appsettings.json
│   │   └── Program.cs                (Configuración DI, middlewares, CORS, JWT)
│   │
│   ├── Sportify.Application/          (Casos de uso, DTOs, interfaces)
│   │   ├── DTOs/                      (Objetos de transferencia de datos)
│   │   │   ├── Auth/
│   │   │   ├── Miembros/
│   │   │   └── Pagos/
│   │   ├── Interfaces/                (Contratos de repositorios y servicios)
│   │   │   ├── IRepositories/
│   │   │   └── IServices/
│   │   ├── Services/                  (Implementación de lógica de negocio)
│   │   │   ├── AuthService.cs
│   │   │   ├── MiembrosService.cs
│   │   │   └── PagosService.cs
│   │   └── Validators/               (Reglas FluentValidation)
│   │       ├── CrearMiembroValidator.cs
│   │       └── RegistrarPagoValidator.cs
│   │
│   ├── Sportify.Domain/               (Núcleo del dominio - sin dependencias externas)
│   │   ├── Entities/                  (Entidades del negocio)
│   │   │   ├── BaseEntity.cs
│   │   │   ├── Usuario.cs
│   │   │   ├── Membresia.cs
│   │   │   ├── Pago.cs
│   │   │   ├── Competencia.cs
│   │   │   └── Entrenamiento.cs
│   │   └── Enums/                     (Enumeraciones del dominio)
│   │       ├── RolUsuario.cs
│   │       ├── EstadoMembresia.cs
│   │       └── EstadoPago.cs
│   │
│   ├── Sportify.Infrastructure/       (Implementaciones de infraestructura)
│   │   ├── Data/                      (DbContext y configuraciones EF Core)
│   │   │   ├── SportifyDbContext.cs
│   │   │   └── Configurations/        (Fluent API por entidad)
│   │   ├── Repositories/             (Implementación del patrón Repository)
│   │   │   ├── BaseRepository.cs
│   │   │   ├── UsuarioRepository.cs
│   │   │   └── PagoRepository.cs
│   │   ├── Email/                     (Servicio de correo MailKit)
│   │   │   └── EmailService.cs
│   │   └── Storage/                  (Almacenamiento local de archivos)
│   │       └── LocalFileStorageService.cs
│   │
│   └── Sportify.Web/                  (Blazor WebAssembly - Frontend SPA)
│       ├── Pages/                     (Rutas y vistas principales)
│       │   ├── Auth/
│       │   ├── Miembros/
│       │   ├── Pagos/
│       │   └── Reportes/
│       ├── Components/               (Componentes reutilizables de UI)
│       │   ├── Shared/
│       │   ├── Forms/
│       │   └── Tables/
│       ├── Services/                 (Clientes HTTP que consumen la API)
│       │   ├── AuthService.cs
│       │   ├── MiembrosService.cs
│       │   └── PagosService.cs
│       └── ViewModels/               (Estado y lógica de presentación - MVVM)
│           ├── MiembrosViewModel.cs
│           ├── PagosViewModel.cs
│           └── DashboardViewModel.cs
│
├── docs/                             (Documentación del proyecto)
│   ├── arquitectura/
│   │   └── decision_tecnica.md       (Este documento)
│   ├── api/
│   └── manual_usuario/
│
└── tests/                            (Pruebas automatizadas)
    ├── Sportify.UnitTests/           (Pruebas unitarias - xUnit)
    └── Sportify.IntegrationTests/    (Pruebas de integración)
```

---

## 11. Consideraciones Adicionales

### 11.1 Inyección de Dependencias

```csharp
// Program.cs – Registro de servicios
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMiembrosService, MiembrosService>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
```

### 11.2 Manejo Global de Errores

Respuesta estándar en formato **ProblemDetails** (RFC 7807):

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "El correo electrónico ya se encuentra registrado.",
  "traceId": "00-abc123..."
}
```

### 11.3 Variables de Entorno y Configuración

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=sportify_db;Username=...;Password=..."
  },
  "Jwt": {
    "SecretKey": "[CONFIGURAR EN VARIABLE DE ENTORNO]",
    "Issuer": "sportify-api",
    "Audience": "sportify-web",
    "AccessTokenMinutes": 60,
    "RefreshTokenDays": 7
  },
  "Email": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "UseSsl": true,
    "Username": "[CONFIGURAR EN VARIABLE DE ENTORNO]",
    "Password": "[CONFIGURAR EN VARIABLE DE ENTORNO]"
  },
  "Storage": {
    "BasePath": "C:/sportify/uploads",
    "MaxFileSizeMB": 5,
    "AllowedExtensions": [".jpg", ".png", ".pdf"]
  }
}
```

> **ADVERTENCIA**: Los valores sensibles (SecretKey, credenciales de correo, cadenas de
> conexión con contraseñas) NUNCA deben commitearse en el repositorio. Deben gestionarse
> mediante variables de entorno o User Secrets en desarrollo.

---

## 12. Conclusión

La arquitectura definida para **SPORTIFY CLUB MANAGER** refleja las mejores prácticas actuales del desarrollo de software empresarial con el ecosistema .NET:

- **Separación de responsabilidades** mediante Clean Architecture
- **Reutilización de código C#** entre frontend (Blazor) y backend (.NET)
- **Seguridad multicapa** con JWT, BCrypt, CORS y rate limiting
- **Trazabilidad completa** mediante auditoría y borrado lógico
- **Independencia de herramientas comerciales** (QuestPDF, PostgreSQL, MailKit)
- **Configuración externalizada** para facilitar el despliegue en diferentes entornos

Esta base técnica permite escalar el sistema horizontalmente (múltiples clubes, instancias, microservicios) en el futuro sin necesidad de refactorizaciones mayores.

---

*Documento generado el 1 de septiembre de 2026 – Equipo SPORTIFY CLUB MANAGER*
