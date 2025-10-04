# syntax=docker/dockerfile:1.6

FROM node:20-alpine
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN mkdir -p apps/web
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --filter @handywriterz/web... --prod --no-frozen-lockfile

COPY . .

RUN pnpm --filter @handywriterz/web... build

WORKDIR /app/apps/web

EXPOSE 4173

CMD ["pnpm", "--filter", "@handywriterz/web", "start"]
