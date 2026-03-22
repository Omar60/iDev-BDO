# =============================================================================
# Stage: deps — instalar dependencias
# =============================================================================
FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# =============================================================================
# Stage: builder — generar + crear DB
# =============================================================================
FROM node:20-bookworm AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar el cliente Prisma
RUN npx --yes prisma@5.22.0 generate

# Crear la base de datos durante el build (idempotente — si ya existe no hace nada)
RUN npx prisma db push --skip-generate

RUN npm run build

# =============================================================================
# Stage: runner — ejecutar solo
# =============================================================================
FROM node:20-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar artefactos del build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

# Asegurar que /app/data existe con permisos correctos
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copiar public/ estático (si existe)
RUN cp -r /app/public ./public 2>/dev/null || true

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Sin entrypoint — sin entrypoint.sh — sin mkdir — sin HOME
# El db push ya se ejecutó en el builder; la DB vive en ./prisma/y se copió aquí
CMD ["node", "server.js"]
