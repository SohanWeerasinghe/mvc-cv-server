# Simple deployable image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only package files from server folder
COPY server/package.json server/package-lock.json* server/pnpm-lock.yaml* server/yarn.lock* server/.npmrc* ./ 2>/dev/null || true

# Install dependencies
RUN npm install

# Copy the rest of the code from server folder
COPY server/. .

# Build the app (if you have a build step)
RUN npm run build

# Set environment variables and expose the port
ENV PORT=8787
EXPOSE 8787

# Start the app
CMD ["npm", "start"]
