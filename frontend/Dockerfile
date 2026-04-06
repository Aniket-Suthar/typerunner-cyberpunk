FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./

# Install dependencies (including production-only ones)
RUN npm install

COPY . .

# Pass API Target at build time if needed, but nginx proxy handles it
RUN npm run build

# ---- Stage 2: Serve Runtime ----
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy React build files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
