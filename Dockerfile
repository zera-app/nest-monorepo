# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY apps ./apps/
COPY libs ./libs/
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client only
RUN npx prisma generate

# Build applications
RUN npm run build:backend
RUN npm run build:client

# Production stage
FROM node:22-alpine as production

WORKDIR /app

# Copy built applications from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY mails ./mails
COPY docker-entrypoint.sh ./

# Make entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh 

# Set environment variables
ENV NODE_ENV=production

# Expose ports
EXPOSE 8001
EXPOSE 8002

# Start both applications
CMD ["sh", "./docker-entrypoint.sh"]
