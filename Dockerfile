FROM node:alpine3.16
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies only first
COPY ./react/package.json ./
RUN npm install

# Install the rest
COPY ./react ./
RUN npm install

CMD ["npm", "start"]