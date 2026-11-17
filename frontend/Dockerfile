# --- Stage 1: build the React app ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# Match the npm version that wrote package-lock.json (npm 10 misreads npm 11 lockfiles)
RUN npm install -g npm@11.6.2 && npm ci

COPY . .
# The browser talks to the backend through nginx at /api (see nginx.conf)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Stage 2: serve the static files with nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
