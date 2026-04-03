#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push --skip-generate
echo "Schema sync complete."

echo "Starting server..."
exec node server.js
