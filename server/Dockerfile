FROM node:20-alpine

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY server/src ./src
COPY server/tsconfig.json ./tsconfig.json

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start
CMD ["npm", "start"]