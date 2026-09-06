#!/bin/sh
set -eu

echo "Applying database migrations..."
node dist/db/migrate.js

echo "Starting API..."
exec node dist/main.js
