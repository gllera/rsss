FROM node:12-alpine

WORKDIR /app
ADD . .
RUN npm ci

ENV NODE_ENV=production
ENTRYPOINT node bin/www