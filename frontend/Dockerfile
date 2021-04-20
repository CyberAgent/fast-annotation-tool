FROM node:15.0.0-alpine
RUN npm install -g firebase-tools node-gyp node-pre-gyp node-gyp-build webpack-dev-server
RUN apk update && apk upgrade && \
    apk add --no-cache git build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    python \
    autoconf \
    automake 
WORKDIR /usr/src/app
