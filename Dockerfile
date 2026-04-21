# STAGE 1: Build tahap kompilasi React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Salin package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh kode frontend
COPY . .

# Build aplikasi menjadi file statis (dist/)
RUN npm run build

# STAGE 2: Tahap Web Server (Nginx)
FROM nginx:alpine

# Hapus konfigurasi default Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Salin konfigurasi nginx custom kita
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build dari Stage 1 (folder dist) ke folder public Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 sesuai standar Cloud Run
EXPOSE 8080

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]