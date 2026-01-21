# Use Node.js LTS (Alpine for lightweight)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json* ./

# Install dependencies (including production deps)
# We also need python/make/g++ for native modules like sqlite3 if it needs building, 
# although prebuilt binaries usually work. Alpine might need build tools.
# For sqlite3 on alpine, it often compiles.
#RUN apk add --no-cache python3 make g++ 

RUN npm install

# Copy source code (ignore node_modules via .dockerignore if present, but we control COPY)
COPY . .

# Run build if needed (skipped for source execution)
RUN npx webpack

# Expose ports
# 5000: API
# 5665: Internal
# 5666: Incoming
# 5667: Outgoing
EXPOSE 5000 5665 5666 5667

# Env vars
ENV PORT=5000
ENV INTERNAL_PORT=5665
ENV INCOMING_PORT=5666
ENV OUTGOING_PORT=5667
#ENV DB_LOCATION=./mydatabase.db
# Bypass license check in Docker
ENV DOCKER_ENV=true 

# Initialize DB (if new container)
# Note: In a real production setup, DB init should be handled carefully. 
# Here we just run it. If it exists, it should be fine (IF NOT EXISTS is used).
# However, if we want data persistence, we should use a volume.
# RUN node modules/initialize_db.js  <-- This runs at build time. We want runtime?
# Yes, runtime is safer for volumes.

# Command to start the server
# We use the bundled file
CMD ["sh", "-c", "node modules/initialize_db.js && node dist/bundle.js"]
