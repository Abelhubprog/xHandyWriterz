# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS builder
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# Accept build arguments from Railway
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_CLERK_DOMAIN
ARG VITE_CLERK_SIGN_IN_URL
ARG VITE_CLERK_SIGN_UP_URL
ARG VITE_CLERK_AFTER_SIGN_IN_URL
ARG VITE_CLERK_AFTER_SIGN_UP_URL
ARG VITE_CMS_URL
ARG VITE_CMS_TOKEN
ARG VITE_UPLOAD_BROKER_URL
ARG VITE_MATTERMOST_URL

# Convert build args to environment variables for Vite build
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_DOMAIN=$VITE_CLERK_DOMAIN
ENV VITE_CLERK_SIGN_IN_URL=$VITE_CLERK_SIGN_IN_URL
ENV VITE_CLERK_SIGN_UP_URL=$VITE_CLERK_SIGN_UP_URL
ENV VITE_CLERK_AFTER_SIGN_IN_URL=$VITE_CLERK_AFTER_SIGN_IN_URL
ENV VITE_CLERK_AFTER_SIGN_UP_URL=$VITE_CLERK_AFTER_SIGN_UP_URL
ENV VITE_CMS_URL=$VITE_CMS_URL
ENV VITE_CMS_TOKEN=$VITE_CMS_TOKEN
ENV VITE_UPLOAD_BROKER_URL=$VITE_UPLOAD_BROKER_URL
ENV VITE_MATTERMOST_URL=$VITE_MATTERMOST_URL

WORKDIR /app

# Copy entire repository to avoid path resolution issues
COPY . .

RUN pnpm install --filter @handywriterz/web... --no-frozen-lockfile

RUN pnpm --filter @handywriterz/web... build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/scripts ./scripts

EXPOSE 4173

CMD ["node", "scripts/server.mjs"]
