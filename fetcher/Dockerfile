FROM node:8.11.0-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Setup packages
COPY package.json package-lock.json /usr/src/app/
RUN npm install

# Setup the app
COPY . /usr/src/app

ENTRYPOINT ["node", "index.js"]
