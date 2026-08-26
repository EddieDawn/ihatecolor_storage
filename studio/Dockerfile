# syntax=docker/dockerfile:1.7

FROM node:24.19.0-bookworm-slim AS development

ARG PNPM_VERSION=11.22.0

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --global "pnpm@${PNPM_VERSION}" \
    && mkdir -p /studio /pnpm/store \
    && chown -R node:node /studio /pnpm

WORKDIR /studio

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

USER node

RUN --mount=type=cache,id=ihatecolor-studio-pnpm,target=/pnpm/store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY --chown=node:node . .

EXPOSE 3333

CMD ["sh", "-c", "pnpm install --frozen-lockfile --store-dir /pnpm/store && exec pnpm dev --host 0.0.0.0 --port 3333"]
