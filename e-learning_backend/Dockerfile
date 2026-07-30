# Build stage for production
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Production image
FROM node:24-alpine

# Install ffmpeg for video processing
RUN apk add --no-cache ffmpeg

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/views ./dist/views
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/.env ./.env

# Create uploads directory for temp video processing
RUN mkdir -p /tmp/videos

# Expose port
EXPOSE 8080

# Start production server
CMD ["node", "dist/serverV2.js"]

##----- docker compose up --build
##----- docker build -t anyName .