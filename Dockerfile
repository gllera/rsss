FROM node:12-alpine

WORKDIR /app
ADD . .
RUN npm ci

ENTRYPOINT node app.js