# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY package*.json ./
RUN npm install --production

COPY server.js ./
COPY routes ./routes
COPY services ./services

EXPOSE 3000

CMD ["npm", "start"]
