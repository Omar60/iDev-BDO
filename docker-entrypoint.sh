#!/bin/sh
set -e

# Crear home del usuario si no existe
mkdir -p /home/nextjs || true

# Ir al directorio de la app
cd /app

echo "Inicializando base de datos si no existe..."
node node_modules/.bin/prisma db push --skip-generate

echo "Iniciando servidor..."
exec node server.js
