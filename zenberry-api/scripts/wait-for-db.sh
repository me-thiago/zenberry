#!/bin/sh
# Wait for database to be ready before running migrations
MAX_RETRIES=15
RETRY_INTERVAL=5
RETRIES=0

echo "Waiting for database to be ready..."

while [ $RETRIES -lt $MAX_RETRIES ]; do
  npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1
  if [ $? -eq 0 ]; then
    echo "Database is ready! Migrations applied."
    exit 0
  fi
  RETRIES=$((RETRIES + 1))
  echo "Database not ready (attempt $RETRIES/$MAX_RETRIES). Retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "ERROR: Database not reachable after $MAX_RETRIES attempts"
exit 1
