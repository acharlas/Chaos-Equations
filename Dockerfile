FROM node:22.10.0-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json .

RUN npm install -verbose --no-audit

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the Vite development server
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "run", "dev"]