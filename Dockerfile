FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000
ENV NODE_ENV=development

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]