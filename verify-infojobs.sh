#!/bin/bash

# Script para verificar que las credenciales de InfoJobs están configuradas correctamente

echo "🔍 Verificando configuración de InfoJobs API..."
echo ""

# Verificar que el archivo .env existe
if [ ! -f "server/.env" ]; then
    echo "❌ Error: No se encuentra el archivo server/.env"
    exit 1
fi

# Leer las credenciales
source server/.env

# Verificar que las credenciales no sean los valores por defecto
if [ "$INFOJOBS_CLIENT_ID" = "your_client_id" ] || [ -z "$INFOJOBS_CLIENT_ID" ]; then
    echo "⚠️  INFOJOBS_CLIENT_ID no está configurado"
    echo ""
    echo "📝 Pasos para configurar:"
    echo "   1. Abre: https://developer.infojobs.net/"
    echo "   2. Crea una aplicación"
    echo "   3. Copia el CLIENT_ID"
    echo "   4. Edita server/.env y reemplaza 'your_client_id'"
    echo ""
    exit 1
fi

if [ "$INFOJOBS_CLIENT_SECRET" = "your_client_secret" ] || [ -z "$INFOJOBS_CLIENT_SECRET" ]; then
    echo "⚠️  INFOJOBS_CLIENT_SECRET no está configurado"
    echo ""
    echo "📝 Pasos para configurar:"
    echo "   1. Abre: https://developer.infojobs.net/"
    echo "   2. Crea una aplicación"
    echo "   3. Copia el CLIENT_SECRET"
    echo "   4. Edita server/.env y reemplaza 'your_client_secret'"
    echo ""
    exit 1
fi

echo "✅ Credenciales encontradas:"
echo "   CLIENT_ID: ${INFOJOBS_CLIENT_ID:0:10}..."
echo "   CLIENT_SECRET: ${INFOJOBS_CLIENT_SECRET:0:10}..."
echo ""

# Verificar que el servidor esté corriendo
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "⚠️  El servidor no está corriendo"
    echo "   Inicia el servidor con: cd server && npm start"
    echo ""
    exit 1
fi

echo "✅ Servidor corriendo en http://localhost:3001"
echo ""

# Hacer una petición de prueba
echo "🧪 Probando la API de InfoJobs..."
echo "   Buscando: 'developer' en 'Madrid'"
echo ""

RESPONSE=$(curl -s "http://localhost:3001/api/scrape?query=developer&location=Madrid")

# Verificar si hay trabajos de InfoJobs
INFOJOBS_COUNT=$(echo "$RESPONSE" | jq '[.jobs[] | select(.source == "InfoJobs")] | length' 2>/dev/null)

if [ -z "$INFOJOBS_COUNT" ] || [ "$INFOJOBS_COUNT" = "null" ]; then
    echo "❌ No se pudieron obtener resultados"
    echo ""
    echo "Verifica los logs del servidor para más detalles"
    exit 1
fi

if [ "$INFOJOBS_COUNT" -gt 0 ]; then
    echo "✅ ¡ÉXITO! InfoJobs API está funcionando correctamente"
    echo "   Se encontraron $INFOJOBS_COUNT ofertas de InfoJobs"
    echo ""
    echo "📊 Resumen de fuentes:"
    echo "$RESPONSE" | jq '[.jobs[] | .source] | group_by(.) | map({source: .[0], count: length})'
    echo ""
    echo "🎉 ¡Todo listo! InfoJobs funcionará sin CAPTCHA"
else
    echo "⚠️  No se encontraron ofertas de InfoJobs"
    echo ""
    echo "Posibles causas:"
    echo "   1. Las credenciales son incorrectas (Error 401)"
    echo "   2. Has excedido el límite de peticiones (Error 429)"
    echo "   3. La API de InfoJobs está temporalmente no disponible"
    echo ""
    echo "Revisa los logs del servidor para más información"
fi

echo ""
