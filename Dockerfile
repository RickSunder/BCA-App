# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Placeholder values so Next.js can build without a real database
ENV SQL_SERVER=build-placeholder \
    SQL_DATABASE=build-placeholder \
    SQL_USER=build-placeholder \
    SQL_PASSWORD=build-placeholder \
    SQL_PORT=1433 \
    SQL_ENCRYPT=true \
    SQL_TRUST_SERVER_CERT=false \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 2: Production ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY next.config.mjs ./

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start"]