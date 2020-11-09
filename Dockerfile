FROM node:12-alpine3.9

# Install bash
RUN apk add --no-cache bash

WORKDIR /home/node/checkout
COPY package.json .
RUN npm i

COPY . .
