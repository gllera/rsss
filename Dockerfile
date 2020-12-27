FROM node:14-alpine as base
WORKDIR /app
ENV JOBS=max
RUN apk add --no-cache python2 make g++
ADD package*.json ./
RUN npm i --production



##################
FROM base as ui-builder
RUN npm i
ADD gulpfile.js .
ADD src_ui src_ui
RUN npm run build



##################
FROM base as cleaner
ADD migrations migrations
ADD src src
ADD schema.graphql config.yaml ./
COPY --from=ui-builder /app/dist dist
RUN mkdir data



##################
FROM node:14-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=cleaner /app .

CMD [ "--http-parser=legacy", "src/bin/www" ]
