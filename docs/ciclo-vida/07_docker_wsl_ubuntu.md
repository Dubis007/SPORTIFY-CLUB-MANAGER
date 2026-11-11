# Levantar Sportify con Docker en WSL 2 / Ubuntu

**Objetivo:** ejecutar el sistema completo (MySQL, API, los dos microservicios y el frontend) en contenedores desde Ubuntu sobre WSL 2, antes de llevarlo a la nube.

> **Estado de esta guía (2026-11-11).** Los archivos están preparados y `docker compose config` valida el archivo de composición. Además se comprobó fuera de Docker lo que ejecuta cada imagen: `dotnet publish -c Release` de la API, `npm ci && npm run build` del frontend y el arranque de los microservicios con `tsx`. **Las imágenes aún no se han construido ni levantado con esta configuración**, porque Docker Desktop estaba apagado. La primera ejecución real debe seguir la verificación del paso 5.

---

## 1. Qué se levanta

| Servicio | Imagen / origen | Puerto en tu equipo | Para qué sirve |
|---|---|---|---|
| `db` | `mysql:8.4` | `DB_PORT` (3308 en `.env.example`) | Base de datos `sportify_db`, con volumen `db_data` |
| `api` | `backend/Dockerfile` | `API_PORT` (8080) | API .NET 10; crea las tablas y los datos semilla al arrancar |
| `ms1` | `backend/microservice/Dockerfile` | `MS1_PORT` (5101) | Validación de JWT y control de sesiones |
| `ms2` | `backend/microservice/Dockerfile` | `MS2_PORT` (5102) | Agregación analítica y KPIs |
| `web` | `frontend/Dockerfile` | `WEB_PORT` (8081) | Frontend React servido por nginx |

Dentro de la red de Docker los servicios se hablan por nombre (`http://api:8080`, `http://ms1:5101`). El navegador, en cambio, usa los puertos publicados en tu equipo (`http://localhost:8080`), y por eso esas URLs se incrustan en el frontend al compilar la imagen.

## 2. Requisitos

1. **WSL 2 con Ubuntu.** En PowerShell: `wsl -l -v` debe listar `Ubuntu` con `VERSION 2`.
2. **Docker disponible dentro de Ubuntu**, por una de estas dos vías:
   - **Docker Desktop** (ya instalado en este equipo): abrir Docker Desktop → *Settings* → *Resources* → *WSL Integration* → activar **Ubuntu** → *Apply & Restart*.
   - **Docker Engine dentro de Ubuntu** (sin Docker Desktop): seguir la guía oficial de `docs.docker.com/engine/install/ubuntu` y arrancar el servicio con `sudo service docker start`.
3. Comprobar desde la terminal de Ubuntu:

```bash
docker --version
docker compose version
docker info --format '{{.ServerVersion}}'   # si falla, el motor no está encendido
```

## 3. Ubicar el proyecto

La opción más simple es usar la copia que ya está en Windows:

```bash
cd /mnt/c/Users/duvan/Documents/nuevas_tecnologias_2026/PROYECTO/SPORTIFY-CLUB-MANAGER
```

Funciona, pero compilar desde `/mnt/c` es más lento. Si la construcción tarda demasiado, clona el repositorio dentro de Ubuntu (por ejemplo en `~/sportify`) y trabaja desde ahí.

## 4. Configurar y levantar

```bash
# 1. Crear el archivo de secretos (git lo ignora)
cp .env.example .env
nano .env        # cambia MYSQL_ROOT_PASSWORD, JWT_SECRET (32 caracteres o más) y SPORTIFY_AES_MASTER_KEY

# 2. Validar el archivo de composición sin levantar nada
docker compose config --quiet && echo "compose OK"

# 3. Construir las imágenes y levantar los cinco servicios
docker compose up -d --build

# 4. Ver el estado (db, api, ms1 y ms2 deben quedar "healthy")
docker compose ps
```

La primera construcción descarga las imágenes base de .NET, Node, nginx y MySQL, así que tarda varios minutos.

## 5. Verificar que todo funciona

```bash
curl -s http://localhost:8080/api/health                 # {"status":"Healthy",...}
curl -s http://localhost:8080/api/microservices/status   # microservicio1Auth y microservicio2Reports con online:true
curl -s http://localhost:5101/health
curl -s http://localhost:5102/health
curl -sI http://localhost:8081/ | head -n 1              # HTTP/1.1 200 OK

# /api/health solo confirma la conexión: comprobar también que la API creó las tablas
docker compose exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW TABLES;" sportify_db'
docker compose logs api | grep -c "fail:"                # debe imprimir 0
```

Después abre `http://localhost:8081` en el navegador de Windows. Con la base vacía, la API crea cuatro usuarios de prueba (`admin@sportify.com`, `contador@sportify.com`, `entrenador@sportify.com` y `miembro@sportify.com`, clave `Admin123!`). Cámbialos antes de cualquier despliegue público.

## 6. Operación diaria

```bash
docker compose logs -f api          # logs en vivo de un servicio
docker compose restart api          # reiniciar un servicio
docker compose up -d --build api    # reconstruir solo la API tras cambiar código
docker compose down                 # detener todo conservando los datos
docker compose down -v              # detener y BORRAR la base de datos y los comprobantes
```

## 7. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `port is already allocated` o `address already in use` | El puerto ya lo usa otro programa. En este equipo XAMPP ocupa 3306 y otro MySQL ocupa 3307; la API local usa 5000 y Vite 5173, que no chocan con Docker. | Cambiar `DB_PORT`, `API_PORT`, `WEB_PORT`, `MS1_PORT` o `MS2_PORT` en `.env` y repetir `docker compose up -d`. Si cambias `API_PORT`, `MS1_PORT`, `MS2_PORT` o `WEB_PORT`, añade `--build` (el frontend lleva esas URLs incrustadas y la API usa `WEB_PORT` para CORS). |
| `Cannot connect to the Docker daemon` | El motor no está encendido o falta la integración con Ubuntu. | Abrir Docker Desktop y activar la integración (paso 2), o `sudo service docker start`. |
| El login falla con error de CORS | Se entra al frontend por una dirección distinta de `http://localhost:8081`. | Usar `localhost` y el `WEB_PORT` configurado. |
| El panel de administrador muestra los microservicios "fuera de línea" | `ms1` o `ms2` no arrancaron, o sus puertos están ocupados. | `docker compose ps` y `docker compose logs ms1 ms2`. |
| Error al firmar el token al iniciar sesión | `JWT_SECRET` tiene menos de 32 caracteres. | Poner un secreto más largo en `.env` y `docker compose up -d`. |
| La API reinicia en bucle al primer arranque | La base aún se estaba inicializando. | Esperar a que `db` quede *healthy*; `docker compose logs api` muestra el motivo. |

## 8. Qué queda fuera de esta configuración

- **HTTPS.** Todo se publica por HTTP en `localhost`. En la nube, el proveedor termina TLS.
- **Secretos.** `.env` es solo para uso local. En la nube deben definirse como variables del proveedor.
- **Respaldos.** `scripts/backup-db.ps1` respalda la base local de XAMPP, no el volumen `db_data` de Docker.
- **Comprobantes.** Se guardan en el volumen `comprobantes` y hoy se sirven como archivos estáticos sin autenticación; está anotado como pendiente de seguridad.

## Archivos de esta fase

| Archivo | Cambio |
|---|---|
| `docker-compose.yml` | Añade `ms1` y `ms2`, puertos configurables y las URLs internas de los microservicios |
| `backend/microservice/Dockerfile`, `backend/microservice/.dockerignore` | Imagen única para los dos microservicios |
| `backend/.dockerignore` | Excluye `microservice/` del contexto de la API |
| `frontend/Dockerfile`, `frontend/.dockerignore` | Recibe las URLs de los microservicios como `ARG` y deja fuera los `.env` locales |
| `.env.example` | Añade los puertos publicados |
| `backend/Sportify.Api/Program.cs` | `/api/microservices/status` lee las URLs de `Microservices:Ms1AuthUrl` y `Microservices:Ms2ReportsUrl` |
