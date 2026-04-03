#!/bin/sh
set -e

echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push --skip-generate
echo "Schema sync complete."

echo "Starting server..."
exec node server.js
