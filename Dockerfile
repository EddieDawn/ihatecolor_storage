# syntax=docker/dockerfile:1.7

FROM node:24.19.0-bookworm-slim AS development

ARG PNPM_VERSION=11.22.0

ENV ASTRO_TELEMETRY_DISABLED=1

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
        ca-certificates \
        git \
        openssh-client \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --global "pnpm@${PNPM_VERSION}" \
    && mkdir -p /workspace /pnpm/store \
    && git config --system --add safe.directory /workspace \
    && chown -R node:node /workspace /pnpm

WORKDIR /workspace

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

USER node

RUN --mount=type=cache,id=ihatecolor-pnpm,target=/pnpm/store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY --chown=node:node astro.config.mjs tsconfig.json ./
COPY --chown=node:node src ./src

EXPOSE 4321

CMD ["sh", "-c", "rm -f .astro/dev.json && pnpm dev --host 0.0.0.0"]
