# Stage 1: Build frontend
FROM node:18-alpine AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
COPY --from=builder /app/client/dist ./public
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "index.js"]
