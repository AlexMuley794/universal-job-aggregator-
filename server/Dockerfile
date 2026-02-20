# Base: Node 18 sobre Debian Bullseye — Chromium disponible sin snap
FROM node:18-slim

# Dependencias del sistema para Puppeteer/Chromium
RUN apt-get update \
    && apt-get install -y \
       chromium \
       libnss3 \
       libatk1.0-0 \
       libatk-bridge2.0-0 \
       libcups2 \
       libdrm2 \
       libxkbcommon0 \
       libxcomposite1 \
       libxdamage1 \
       libxfixes3 \
       libxrandr2 \
       libgbm1 \
       libasound2 \
       --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

# Instalar dependencias primero (mejor caching de capas)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el código fuente
COPY . .

EXPOSE 10000

CMD ["node", "server.js"]
