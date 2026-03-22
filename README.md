# iDev.BDO-GEAR

Web app para tracking de gear, crates y profit en Black Desert Online.

## Stack

- **Next.js 15** (App Router)
- **Prisma** + **SQLite** (single-user, bajo consumo)
- **Docker** (contenedor único)

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
# Editar .env con tu GOOGLE_SHEETS_CSV_URL

# 3. Inicializar DB
npx prisma db push

# 4. Dev
npm run dev
```

## Docker

### Usando docker-compose (desarrollo local)

```bash
docker-compose up -d
```

### Imagen desde GHCR (producción)

La imagen se construye y sube automáticamente a GitHub Container Registry via GitHub Actions.

**Pull de la imagen:**

```bash
docker pull ghcr.io/omar60/idev-bdo-gear:latest
```

**Ejecutar con Docker:**

```bash
docker run -d \
  --name bdo-gear \
  -p 3000:3000 \
  --restart unless-stopped \
  -e DATABASE_URL="file:/app/prisma/dev.db" \
  -e GOOGLE_SHEETS_CSV_URL="TU_URL_AQUI" \
  ghcr.io/omar60/idev-bdo-gear:latest
```

**Ejecutar con Docker Compose (usando la imagen de GHCR):**

Crea un `docker-compose.prod.yml`:

```yaml
services:
  app:
    image: ghcr.io/omar60/idev-bdo-gear:latest
    container_name: bdo-gear
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - GOOGLE_SHEETS_CSV_URL=TU_URL_AQUI
    volumes:
      - bdo-data:/app/prisma

volumes:
  bdo-data:
```

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Configurar Portainer con imagen de GHCR

1. **En Portainer → Registries:**
   - Ve a **Registries** → **Add registry**
   - Selecciona **GitHub Container Registry**
   - Inicia sesión con tu cuenta de GitHub (OAuth)
   - Registry URL: `ghcr.io`

2. **En Portainer → Stacks o Containers:**

   **Opción A — Crear un Stack:**
   - Ve a **Stacks** → **Add stack**
   - Selecciona **Web editor**
   - Pega el contenido de `docker-compose.prod.yml` de arriba
   - Ajusta las variables de entorno según necesites
   - Click **Deploy the stack**

   **Opción B — Deploy directo:**
   - Ve a **Containers** → **Add container**
   - Nombre: `bdo-gear`
   - Image: `ghcr.io/omar60/idev-bdo-gear:latest`
   - Puerto: `3000:3000`
   - Variables de entorno:
     - `DATABASE_URL=file:/app/prisma/dev.db`
     - `GOOGLE_SHEETS_CSV_URL=TU_URL_AQUI`
   - Restart policy: `Unless stopped`
   - Click **Deploy the container**

## Arquitectura

- `src/app/` — Next.js App Router
- `src/components/` — Componentes React
- `src/lib/` — Utilities (Google Sheets connector, DB helpers)
- `prisma/schema.prisma` — Modelo de datos
