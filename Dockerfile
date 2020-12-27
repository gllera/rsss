FROM node:12-alpine as ui-builder

WORKDIR /app

ADD package*.json gulpfile.js ./
RUN npm ci

ADD src_ui src_ui
RUN npm run build




##################
FROM node:12-alpine as cleaner

WORKDIR /app

ADD package*.json ./

RUN npm ci --only=production \
 && mkdir data

ADD migrations  migrations
ADD shemas_gql  shemas_gql
ADD src         src
ADD config.yaml .

COPY --from=ui-builder /app/dist dist




##################
FROM node:12-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=cleaner /app .

CMD node --http-parser=legacy src/bin/www
