# Use Node.js 20 Slim for compatibility
FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Accept build arguments
ARG DATABASE_URL
ARG JWT_SECRET
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_SITE_URL
ARG PORT
ARG ELASTIC_EMAIL_USER=dummy
ARG ELASTIC_EMAIL_PASSWORD=dummy
ARG SMTP_USER=dummy
ARG SMTP_PASSWORD=dummy

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN DATABASE_URL="$DATABASE_URL" \
    JWT_SECRET="$JWT_SECRET" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    NEXTAUTH_URL="$NEXTAUTH_URL" \
    NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
    PORT="$PORT" \
    ELASTIC_EMAIL_USER="$ELASTIC_EMAIL_USER" \
    ELASTIC_EMAIL_PASSWORD="$ELASTIC_EMAIL_PASSWORD" \
    SMTP_USER="$SMTP_USER" \
    SMTP_PASSWORD="$SMTP_PASSWORD" \
    npx prisma generate

# Build Next.js app
RUN DATABASE_URL="$DATABASE_URL" \
    JWT_SECRET="$JWT_SECRET" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    NEXTAUTH_URL="$NEXTAUTH_URL" \
    NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
    PORT="$PORT" \
    ELASTIC_EMAIL_USER="$ELASTIC_EMAIL_USER" \
    ELASTIC_EMAIL_PASSWORD="$ELASTIC_EMAIL_PASSWORD" \
    SMTP_USER="$SMTP_USER" \
    SMTP_PASSWORD="$SMTP_PASSWORD" \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create uploads directory with proper permissions
RUN ["install", "-d", "-m", "775", "-o", "nextjs", "-g", "nodejs", "/app/public/uploads"]
RUN ["chmod", "-R", "775", "/app/public"]

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
