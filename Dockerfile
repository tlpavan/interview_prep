# Multi-stage build for InterviewPrep AI
# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:18-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source code
COPY backend/ ./

# Copy frontend static files from root
COPY --chown=node:node . .

# Ensure data directory exists for JSON fallback storage
RUN mkdir -p data && chown -R node:node data

# Switch to non-root user for security
USER node

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Health check to verify service is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT||5000}/health', (r) => {if(r.statusCode!==200)throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
