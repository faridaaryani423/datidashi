# Multi-stage build for production
FROM node:22.19.0-alpine AS builder

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli typescript ts-node

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
# Install ALL dependencies (including dev) for build
RUN npm ci --ignore-scripts && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:22.19.0-alpine

RUN apk add --no-cache bash curl postgresql-client

WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built app from builder
COPY --from=builder /usr/src/app/dist ./dist

# Copy necessary files for runtime and migrations
COPY ./src/database ./src/database
COPY ./src/i18n ./src/i18n
COPY ./src/mail ./src/mail
COPY ./public ./public
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# Install ts-node and typeorm for migrations
RUN npm install -D ts-node @types/node tsconfig-paths

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run migrations then start app
CMD npm run migration:run && npm run start:prod
