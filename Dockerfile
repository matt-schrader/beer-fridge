FROM node:11

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]