FROM node:21-alpine3.19
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 6180

CMD [ "npm", "start" ]
