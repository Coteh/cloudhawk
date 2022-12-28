FROM node:16.13.0

WORKDIR /usr/app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

RUN npm run build

CMD ["./server"]
