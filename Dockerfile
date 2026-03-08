# Stage 1: Builder
# Uses alpine for a small footprint.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all application files (filtered by .dockerignore)
COPY . .

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create persistent data and upload directories
# Set ownership to the built-in non-root 'node' user
RUN mkdir -p /app/data /app/assets/uploads && \
    chown -R node:node /app

# Copy application files from the builder stage with proper ownership
COPY --chown=node:node --from=builder /app /app/

# Switch to the non-root 'node' user for enhanced security
USER node

# Expose ports that might be used
EXPOSE 5500 5600

# Healthcheck configuration (can be refined in docker-compose)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5500} || exit 1

# Default command (overridden by docker-compose for specific services)
CMD ["node", "website-server.js"]
