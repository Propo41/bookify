# Step 1: Build the React app
FROM node:18-alpine AS build-frontend
WORKDIR /usr/src/client

COPY .env /usr/src/
# COPY .env.chrome /usr/src/client/.env.chrome

COPY client/package*.json ./
RUN npm install
COPY client/ ./

# RUN npm run build:chrome
RUN npm run build

# Step 2: Build the NestJS backend
FROM node:18-alpine AS build-backend
WORKDIR /usr/src

COPY .env /usr/src/.env
# COPY .env.chrome /usr/src/.env.chrome

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Copy React build files to the NestJS container
COPY --from=build-frontend /usr/src/client/build_web /usr/src/client/build_web

# Step 3: Expose the port and run the NestJS app
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
