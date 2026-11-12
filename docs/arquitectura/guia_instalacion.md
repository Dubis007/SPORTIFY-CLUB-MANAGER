# Guía de Instalación — SPORTIFY CLUB MANAGER

## Requisitos del Sistema

| Herramienta       | Versión Mínima | Descarga                                    |
|-------------------|----------------|---------------------------------------------|
| Node.js           | 20.x LTS       | https://nodejs.org                          |
| .NET SDK          | 10.x           | https://dotnet.microsoft.com/download       |
| XAMPP             | 8.x            | https://www.apachefriends.org               |
| Git               | 2.x            | https://git-scm.com                         |
| Visual Studio Code| Latest         | https://code.visualstudio.com               |

---

## Paso 1 — Clonar el Repositorio

```bash
git clone https://github.com/[usuario]/sportify-club-manager.git
cd sportify-club-manager
```

---

## Paso 2 — Configurar la Base de Datos

### 2.1 Iniciar XAMPP
1. Abrir XAMPP Control Panel
2. Iniciar **Apache** y **MySQL**
3. Verificar que MySQL esté en el puerto 3306

### 2.2 Ejecutar Scripts SQL
Abrir phpMyAdmin en http://localhost/phpmyadmin y ejecutar los scripts en orden:

```bash
# Opción A: phpMyAdmin
# Ir a "Import" y cargar cada archivo en orden

# Opción B: MySQL CLI
mysql -u root -p < database/scripts/01_create_database.sql
mysql -u root -p sportify_db < database/scripts/02_tables.sql
mysql -u root -p sportify_db < database/scripts/03_constraints.sql
mysql -u root -p sportify_db < database/scripts/04_seed.sql
# Opcional para pruebas:
mysql -u root -p sportify_db < database/scripts/05_test_data.sql
```

---

## Paso 3 — Configurar el Backend

### 3.1 Restaurar dependencias
```bash
cd backend
dotnet restore
```

### 3.2 Configurar variables de entorno
En local no hay que crear ningún archivo: `dotnet run` usa el entorno `Development` y toma de `appsettings.Development.json` las llaves de desarrollo (firma de JWT y cifrado). Si no se define otra conexión, usa la de XAMPP (`root` sin clave, base `sportify_db`).

Para usar otra conexión o tus propias llaves, crea `backend/Sportify.Api/appsettings.Local.json` a partir de `appsettings.Example.json`, o define estas variables de entorno:

| Variable | Para qué sirve |
|---|---|
| `SPORTIFY_MYSQL_CONNECTION` | Cadena de conexión a MySQL |
| `JwtSettings__Secret` | Secreto con el que se firman los JWT (32 caracteres o más) |
| `EncryptionSettings__MasterKey` | Llave maestra del cifrado AES-256 de datos sensibles (32 caracteres o más) |

> ⚠️ `appsettings.Local.json` está en `.gitignore` — NO subir a Git.
>
> ⚠️ Fuera de `Development` la API **no arranca** sin `JwtSettings__Secret` y `EncryptionSettings__MasterKey` propios. Las llaves de desarrollo del repositorio son públicas y en producción se rechazan. Para generar una: `openssl rand -base64 48`.

### 3.3 Ejecutar migraciones (si aplica)
```bash
cd backend
dotnet ef database update --project Sportify.Infrastructure --startup-project Sportify.Api
```

### 3.4 Iniciar el Backend
```bash
cd backend/Sportify.Api
dotnet run
```

El backend estará disponible en:
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

---

## Paso 4 — Configurar el Frontend

### 4.1 Instalar dependencias
```bash
cd frontend
npm install
```

### 4.2 Configurar variables de entorno
Crear el archivo `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

> ⚠️ Este archivo está en `.gitignore` — NO subir a Git.

### 4.3 Iniciar el Frontend
```bash
npm run dev
```

El frontend estará disponible en: http://localhost:5173

---

## Paso 5 — Verificar la Instalación

### Verificar Backend
```bash
# Probar el endpoint de login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "admin@sportify.com", "contrasena": "Admin@12345"}'
```

### Verificar Frontend
1. Abrir http://localhost:5173
2. Debería mostrar la pantalla de login de SPORTIFY CLUB MANAGER
3. Iniciar sesión con: admin@sportify.com / Admin@12345

---

## Credenciales Iniciales

| Rol        | Correo                      | Contraseña  |
|------------|------------------------------|-------------|
| ADMIN      | admin@sportify.com           | Admin@12345 |
| CONTADOR   | contador@sportify.com        | Conta@12345 |
| ENTRENADOR | entrenador@sportify.com      | Coach@12345 |
| MIEMBRO    | miembro@sportify.com         | Memb@12345  |

> ⚠️ Cambiar estas contraseñas en producción.

---

## Estructura de Archivos de Configuración

```
SPORTIFY-CLUB-MANAGER/
├── backend/
│   └── Sportify.Api/
│       ├── appsettings.json          ← Configuración base (en Git)
│       └── appsettings.Development.json ← Secretos locales (NO en Git)
├── frontend/
│   ├── .env                          ← Variables por defecto
│   └── .env.local                    ← Variables locales (NO en Git)
└── storage/
    └── comprobantes/                 ← Archivos subidos (NO en Git)
```

---

## Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"
- Verificar que XAMPP MySQL esté corriendo en el puerto 3306
- Verificar credenciales en `appsettings.Development.json`

### Error: "CORS policy"
- Verificar que el backend tenga configurado CORS para `http://localhost:5173`
- Verificar que el frontend apunte a la URL correcta del backend

### Error: "JWT token invalid"
- Verificar que JWT_SECRET sea el mismo en backend y que el token no haya expirado
- Verificar que el token se esté enviando en el header: `Authorization: Bearer [token]`

### Error: "File upload failed"
- Verificar que la carpeta `storage/comprobantes/` exista y tenga permisos de escritura
- Verificar que el archivo no supere los 5MB
- Verificar que la extensión sea .pdf, .jpg, .jpeg o .png
