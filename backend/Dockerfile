FROM node:22-slim AS builder

WORKDIR /app

COPY package.json ./

RUN corepack enable && corepack prepare yarn@4.17.0 --activate

COPY yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY . .

RUN yarn build

FROM node:22-slim AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
