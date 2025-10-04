# syntax=docker/dockerfile:1.6

FROM node:20-alpine
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @handywriterz/web... build

WORKDIR /app/apps/web

EXPOSE 4173

CMD ["node", "scripts/server.mjs"]
