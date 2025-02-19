#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start both applications
echo "Starting applications..."
node dist/apps/backend/main.js & node dist/apps/client/main.js

# Keep container running
wait
