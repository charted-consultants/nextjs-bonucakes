# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (cached if package*.json doesn't change)
COPY package*.json ./
RUN npm install

# Copy application code (but .dockerignore will exclude junk like node_modules)
COPY . .

# Set dummy DATABASE_URL for build (prevents Prisma validation errors)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build


# ---- Stage 2: Production Image ----
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib

# Create uploads volume directory
RUN mkdir -p /app/uploads

# Set environment variable for consistent upload path
ENV UPLOAD_PATH=/app/uploads

# Expose Next.js port
EXPOSE 3000

# Declare volume for persistent file storage
VOLUME ["/app/uploads"]

# Start the Next.js server
CMD ["npm", "start"]
