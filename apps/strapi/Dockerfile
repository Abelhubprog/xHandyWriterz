# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS deps
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ pkgconfig
COPY apps/strapi/package.json apps/strapi/package-lock.json ./
RUN npm ci --omit=dev
COPY apps/strapi ./
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app ./
EXPOSE 1337
CMD ["npm", "run", "start"]
