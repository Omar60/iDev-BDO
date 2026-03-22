#!/bin/sh
set -e

echo "Inicializando base de datos si no existe..."
npx prisma db push --skip-generate

echo "Iniciando servidor..."
exec node server.js
