#!/bin/bash

# Script para abrir los enlaces necesarios para configurar InfoJobs API

echo "🚀 Abriendo portal de InfoJobs Developer..."
echo ""
echo "📋 Pasos a seguir:"
echo ""
echo "1️⃣  Inicia sesión o regístrate en InfoJobs Developer"
echo "2️⃣  Ve a 'Mis Aplicaciones' y crea una nueva app"
echo "3️⃣  Copia el CLIENT_ID y CLIENT_SECRET"
echo "4️⃣  Pégalos en el archivo: server/.env"
echo ""
echo "🔗 Abriendo: https://developer.infojobs.net/"
echo ""

# Abrir el navegador
xdg-open "https://developer.infojobs.net/" 2>/dev/null &

sleep 2

echo "📝 Cuando tengas las credenciales, edita este archivo:"
echo "   👉 server/.env"
echo ""
echo "Reemplaza estas líneas:"
echo "   INFOJOBS_CLIENT_ID=your_client_id"
echo "   INFOJOBS_CLIENT_SECRET=your_client_secret"
echo ""
echo "Por tus credenciales reales:"
echo "   INFOJOBS_CLIENT_ID=tu_id_real_aqui"
echo "   INFOJOBS_CLIENT_SECRET=tu_secret_real_aqui"
echo ""
echo "✅ Después reinicia el servidor con: npm start"
echo ""
