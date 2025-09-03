FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./ 
COPY yarn.lock* ./ 
COPY .npmrc* ./

RUN npm install

COPY . .

RUN npm run build

ENV PORT=8787
EXPOSE 8787
CMD ["npm","start"]
