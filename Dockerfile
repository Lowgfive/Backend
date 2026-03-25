# Giai đoạn 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Run
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Chỉ cài các thư viện cần thiết cho production
RUN npm install --only=production
# Copy kết quả đã build từ giai đoạn 1
COPY --from=builder /app/dist ./dist

EXPOSE 3000
# Sử dụng script start: node dist/server.js
CMD ["npm", "start"]