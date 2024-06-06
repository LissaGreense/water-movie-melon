# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.9

FROM node:${NODE_VERSION}-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
