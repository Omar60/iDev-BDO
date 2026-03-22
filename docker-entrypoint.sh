#!/bin/sh
set -e

echo "Inicializando base de datos si no existe..."
# Solo crear schema si la DB no existe aún
# (idempotente - safe para重复 ejecuciones)
npx --yes prisma@5.22.0 db push --skip-generate --schema /app/prisma/schema.prisma 2>/dev/null || true

echo "Iniciando servidor..."
exec node server.js
