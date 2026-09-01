# Production image — secrets via runtime env (.env / -e / compose env_file).
# Do NOT bake .env into the image.

# ── Build ──────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── Runtime ────────────────────────────────────────────
FROM node:24-alpine

RUN apk add --no-cache ffmpeg \
  && addgroup -S app && adduser -S app -G app

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /usr/src/app/dist ./dist
# EJS views (success/cancel pages) — kept next to compiled server
COPY --from=builder /usr/src/app/src/views ./dist/views
COPY --from=builder /usr/src/app/package.json ./

RUN mkdir -p /tmp/videos/uploads /usr/src/app/uploads /usr/src/app/temp_videos/uploads \
  && chown -R app:app /usr/src/app /tmp/videos

# Defaults for containers (override with env_file / -e)
ENV NODE_ENV=production \
    PORT=8005 \
    BACKEND_IP=0.0.0.0

# App listens on PORT; map host→container in compose/EC2
EXPOSE 8005

USER app

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8005)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/serverV2.js"]

# Build:  docker build -t e-learning-api .
# Run:    docker run --env-file .env -p 8005:8005 e-learning-api
# Compose: docker compose up --build
