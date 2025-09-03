FROM node:20-alpine
WORKDIR /app

# Copy only package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./
COPY .npmrc* ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Set port
ENV PORT=8787
EXPOSE 8787

# Start the app
CMD ["npm", "start"]
