FROM node:22-slim AS builder

WORKDIR /app

COPY package.json ./

RUN corepack enable && corepack prepare yarn@4.17.0 --activate

COPY yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN yarn build

FROM node:22-slim AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
