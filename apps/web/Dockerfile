# syntax=docker/dockerfile:1.6

FROM node:20-alpine
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production
RUN corepack enable

WORKDIR /app

# Copy entire repo to ensure all workspace files are present
COPY . .

# Install only web workspace dependencies
RUN pnpm install --filter @handywriterz/web... --prod --no-frozen-lockfile

# Build the web app
RUN pnpm --filter @handywriterz/web... build

WORKDIR /app/apps/web

EXPOSE 4173

CMD ["pnpm", "--filter", "@handywriterz/web", "start"]
