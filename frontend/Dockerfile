# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# The browser calls its own origin; Next.js proxies this server-side target.
ARG API_PROXY_TARGET=http://backend:3001/api/v1
ENV API_PROXY_TARGET=$API_PROXY_TARGET
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV API_PROXY_TARGET=http://backend:3001/api/v1

COPY frontend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.ts ./next.config.ts

USER node
EXPOSE 3000
CMD ["npm", "start"]
