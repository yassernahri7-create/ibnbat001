# Stage 1: Builder
# Uses alpine for a small footprint.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all application files (filtered by .dockerignore)
COPY . .

# Stage 2: Shared production base
FROM node:20-alpine AS production-base
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

# Default command is set in service-specific targets below.
CMD ["node", "website-server.js"]

# Stage 3: Website runtime
FROM production-base AS website-production
EXPOSE 5500
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-5500} || exit 1
CMD ["node", "website-server.js"]

# Stage 4: Admin runtime
FROM production-base AS admin-production
EXPOSE 5600
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-5600}/admin.html || exit 1
CMD ["node", "admin-server.js"]
