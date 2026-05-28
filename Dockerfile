# Stage 1: Build React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL truyền vào lúc build để nhúng vào JS bundle
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:stable-alpine

# Copy cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy thư mục build tĩnh từ stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
