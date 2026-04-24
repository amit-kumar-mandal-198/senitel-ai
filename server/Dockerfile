# Stage 1: Build & Prisma Generation
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install exact dependencies
RUN npm ci

# Copy TypeScript source code
COPY . .

# Generate Prisma Client and Compile TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Image
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Add a default .env just in case, but rely on docker-compose ENV mapping
RUN echo "DATABASE_URL=file:./dev.db" > .env

# Expose Fastify Port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
