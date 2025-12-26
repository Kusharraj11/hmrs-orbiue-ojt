
# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for tsc)
RUN npm install

# Copy source code
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Install curl for healthcheck and openssl for Prisma
RUN apk add --no-cache curl openssl

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copy uploads folder structure if needed, or create it
RUN mkdir -p uploads/payslips uploads/reports



EXPOSE 3000

CMD ["npm", "start"]
