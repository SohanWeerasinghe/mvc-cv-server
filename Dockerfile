FROM node:20-alpine
WORKDIR /app

# Copy package files from the server folder
COPY server/package*.json ./
COPY server/pnpm-lock.yaml* ./
COPY server/yarn.lock* ./
COPY server/.npmrc* ./

# Install dependencies
RUN npm install

# Copy the rest of the server app
COPY server/. .

# Build the app
RUN npm run build

# Set environment and expose port
ENV PORT=8787
EXPOSE 8787

# Start app
CMD ["npm","start"]
