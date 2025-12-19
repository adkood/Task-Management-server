FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install ALL dependencies (including devDependencies like ts-node)
RUN npm install --include=dev

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]