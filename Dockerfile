# Simple deployable image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only package files if they exist
COPY server/package.json ./package.json
COPY server/package-lock.json* ./package-lock.json
COPY server/pnpm-lock.yaml* ./pnpm-lock.yaml
COPY server/yarn.lock* ./yarn.lock
COPY server/.npmrc* ./.npmrc

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Set environment variables and expose the port
ENV PORT=8787
EXPOSE 8787

# Start the app
CMD ["npm", "start"]
