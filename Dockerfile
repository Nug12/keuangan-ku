# Stage 1: Build frontend
FROM node:22-alpine AS builder
WORKDIR /app/client
COPY client/ .
RUN rm -rf node_modules && npm install && npm run build
# Move script tag + cache buster
RUN sh -c 'HASH=$(ls dist/assets/index-*.js | xargs basename | sed "s/\.js//"); TIMESTAMP=$(date +%s); SCRIPT_SRC="/assets/${HASH}.js?v=${TIMESTAMP}"; sed -i "s|  <script src=\"/assets/index-[^\"]*\"></script>||" dist/index.html; sed -i "s|</body>|  <script src=\"${SCRIPT_SRC}\"></script>\n</body>|" dist/index.html; echo "✓ Script: ${SCRIPT_SRC}"'

# Stage 2: Production
FROM node:22-alpine
RUN apk add --no-cache python3 make g++ tzdata
ENV TZ=Asia/Jayapura
WORKDIR /app
COPY server/ .
RUN rm -rf node_modules && npm install --omit=dev
COPY --from=builder /app/client/dist ./public
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "index.js"]
