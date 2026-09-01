#!/bin/sh
# Aplica las migraciones pendientes antes de arrancar el servidor.
# Alembic es idempotente: si la base ya está al día, no hace nada.
set -e

echo "Aplicando migraciones..."
alembic upgrade head

echo "Arrancando la API..."
exec "$@"
