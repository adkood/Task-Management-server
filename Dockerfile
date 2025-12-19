FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TS → JS
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "run", "dev"]
