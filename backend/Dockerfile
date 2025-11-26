FROM node:22-alpine

# Install dependencies needed for bcrypt and healthcheck
RUN apk add --no-cache wget python3 make g++

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
EXPOSE 4000
ENV PORT=4000
CMD ["node","index.js"]
