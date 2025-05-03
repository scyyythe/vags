# Use an official Node.js image as the base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file first to install deps
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Vite dev server port
EXPOSE 8080

# Run the Vite dev server on container start with host flag
CMD ["npm", "run", "dev", "--", "--host"]
