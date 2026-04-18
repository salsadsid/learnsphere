FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npx", "nodemon"]

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx tsc --outDir dist

FROM base AS prod
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/index.js"]
