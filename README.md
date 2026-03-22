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

```bash
docker-compose up -d
```

## Arquitectura

- `src/app/` — Next.js App Router
- `src/components/` — Componentes React
- `src/lib/` — Utilities (Google Sheets connector, DB helpers)
- `prisma/schema.prisma` — Modelo de datos
