# Finna App UI — Multi-stage Dockerfile
#
# Build:  docker build -t finna-app-ui .
# Run:    docker run -p 3000:80 finna-app-ui

# ---- Stage 1: Builder ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json vite.config.ts index.html ./
COPY src/ src/

RUN npx tsc && npx vite build --outDir dist

# ---- Stage 2: Runtime ----
FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
