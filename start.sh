#!/bin/bash

# Script para iniciar ambos servidores (frontend + backend scraper)

echo "🚀 Iniciando Universal Job Aggregator..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si node_modules existe en server
if [ ! -d "server/node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependencias del servidor de scraping...${NC}"
    (cd server && npm install)
fi

# Iniciar servidor de scraping en background
echo -e "${GREEN}🔧 Iniciando servidor de scraping (puerto 3001)...${NC}"
(cd server && npm start) &
SCRAPER_PID=$!

# Esperar un poco para que el servidor inicie
sleep 3

# Iniciar frontend
echo -e "${GREEN}🎨 Iniciando frontend (puerto 5173)...${NC}"
echo ""
npm run dev

# Cleanup al salir
trap "kill $SCRAPER_PID 2>/dev/null" EXIT
