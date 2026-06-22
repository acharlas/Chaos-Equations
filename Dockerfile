FROM node:22.10.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]