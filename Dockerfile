FROM node:20-alpine AS base

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx --yes prisma@5.22.0 generate
# prisma db push se ejecuta en el runner stage (ver abajo)
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# public/ es estático y viene del código fuente en el builder, no del output standalone
RUN cp -r /app/public ./public 2>/dev/null || true
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Asegurar que /app/data existe con permisos correctos
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Crear la DB inicial si no existe (idempotente, safe para repetir)
RUN prisma db push --skip-generate || true

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
