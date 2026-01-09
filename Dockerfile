FROM node:20-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
COPY migrations ./migrations

RUN npm install
RUN npm --workspace packages/shared run build
RUN npm --workspace apps/server run build
RUN npm --workspace apps/worker run build
RUN npm --workspace apps/web run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/migrations ./migrations

RUN chmod +x ./scripts/entrypoint.sh

CMD ["./scripts/entrypoint.sh"]
