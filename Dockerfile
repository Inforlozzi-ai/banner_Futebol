FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
RUN apk add --no-cache cairo-dev jpeg-dev pango-dev giflib-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache cairo jpeg pango giflib
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
