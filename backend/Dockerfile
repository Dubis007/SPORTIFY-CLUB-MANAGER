# ---------- Etapa 1: compilación ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar solo los .csproj primero para aprovechar la caché de capas en el restore
COPY Sportify.Api/Sportify.Api.csproj Sportify.Api/
COPY Sportify.Application/Sportify.Application.csproj Sportify.Application/
COPY Sportify.Domain/Sportify.Domain.csproj Sportify.Domain/
COPY Sportify.Infrastructure/Sportify.Infrastructure.csproj Sportify.Infrastructure/
RUN dotnet restore Sportify.Api/Sportify.Api.csproj

COPY . .
RUN dotnet publish Sportify.Api/Sportify.Api.csproj -c Release -o /app/publish --no-restore

# ---------- Etapa 2: ejecución ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# curl solo se usa para el HEALTHCHECK
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
RUN mkdir -p wwwroot/comprobantes

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fs http://localhost:8080/api/health || exit 1

ENTRYPOINT ["dotnet", "Sportify.Api.dll"]
