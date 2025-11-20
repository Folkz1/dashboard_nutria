# Full Stack Dockerfile (Backend + Frontend)
FROM node:20-alpine as builder

WORKDIR /app

# Copy frontend files and build
COPY frontend/package*.json ./frontend/
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY package*.json ./
RUN npm install --production

COPY server.js ./
COPY routes ./routes
COPY services ./services

# Copy built frontend from builder
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["npm", "start"]
