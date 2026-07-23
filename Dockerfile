# Stage 1: Build frontend
FROM node:22-alpine AS builder
WORKDIR /app/client
COPY client/ .
RUN rm -rf node_modules && npm install && npm run build

# Stage 2: Production
FROM node:22-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY server/ .
RUN rm -rf node_modules && npm install --omit=dev
COPY --from=builder /app/client/dist ./public
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "index.js"]
