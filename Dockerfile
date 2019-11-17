FROM node:12-alpine

WORKDIR /app
ADD . .
RUN    npm i \
    && npm run build \
    && npm prune --production

ENV NODE_ENV=production
ENTRYPOINT node --http-parser=legacy src/bin/www