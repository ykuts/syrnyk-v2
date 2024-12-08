FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

ENV PORT=3000
EXPOSE 3000

RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]