# Microservicios Node/TypeScript de Sportify (ms1: sesiones JWT · ms2: reportes analíticos).
# Una sola imagen sirve a los dos; docker-compose elige cuál arranca con `command`.
FROM node:22-alpine
WORKDIR /app

# Copiar primero los manifiestos para aprovechar la caché de capas en `npm ci`.
# Se instalan también las devDependencies porque el código TypeScript se ejecuta con tsx.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY microservicio1 ./microservicio1
COPY microservicio2 ./microservicio2

ENV NODE_ENV=production
USER node
EXPOSE 5101 5102

# Por defecto arranca microservicio1; para microservicio2 se sobreescribe el comando.
CMD ["npx", "tsx", "microservicio1/endpoint.ts"]
