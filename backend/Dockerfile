# Build stage
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# A base node:20-bullseye-slim já inclui ca-certificates; openssl só é necessário em produção

COPY backend/package*.json ./
RUN npm ci

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/
COPY backend/tsconfig.json ./tsconfig.json
RUN npm run build

# Production stage
FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get -o Acquire::Retries=5 update && apt-get -o Acquire::Retries=5 install -y --no-install-recommends openssl ca-certificates libreoffice-writer fonts-liberation fonts-crosextra-carlito fonts-dejavu-core && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY backend/templates ./templates

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push || echo 'Migração falhou, continuando...' && node dist/server.js"]
