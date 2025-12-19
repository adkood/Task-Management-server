FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# First install ts-node and typescript globally
RUN npm install -g ts-node typescript

# Then install all project dependencies
RUN npm install --include=dev

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]