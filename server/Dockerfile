# Simple deployable image
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./ 2>/dev/null || true
RUN npm i
COPY . .
RUN npm run build
ENV PORT=8787
EXPOSE 8787
CMD ["npm","start"]
