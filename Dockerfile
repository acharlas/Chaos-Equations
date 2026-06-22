FROM node:22.10.0-alpine

# Set working directory inside the container
WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit

COPY . .

# Expose port 3000 for the Vite development server
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "run", "dev"]