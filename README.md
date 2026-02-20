# 🚀 Universal Job Aggregator

Un agregador de empleos moderno con **Web Scraping Avanzado** de LinkedIn e Indeed usando Puppeteer.

## ✨ Características Principales

### 🔍 Scraping Avanzado en Tiempo Real
- **LinkedIn** - Extracción de ofertas con Puppeteer Stealth Mode
- **Indeed** - Scraping paralelo con bypass anti-bot
- **Adzuna API** - Integración con API oficial
- **Unificación Inteligente** - Todas las ofertas mezcladas y ordenadas por fecha

### 🛡️ Tecnologías Anti-Detección
- ✅ **Puppeteer Stealth Plugin** - Evita detección de bots
- ✅ **User-Agent Dinámico** - Rotación automática de navegadores
- ✅ **Geolocalización** - Simula ubicación en España
- ✅ **Headers Realistas** - Accept-Language, cookies, etc.

### 💼 Funcionalidades de Usuario
- 🔖 **Guardar Empleos** - Marca favoritos (localStorage)
- 🕐 **Búsquedas Recientes** - Historial automático
- 🎯 **Filtros Avanzados** - Remoto, Full-time, categorías
- 📱 **Diseño Responsive** - Optimizado para móvil
- 🎨 **UI Premium** - Tailwind CSS con glassmorphism

## 🏗️ Arquitectura

```
empleo/
├── src/                    # Frontend React
│   ├── components/         # Componentes UI
│   ├── services/          # API y Scraping
│   └── hooks/             # Custom hooks
├── server/                # Backend Puppeteer
│   ├── server.js          # Servidor Express
│   └── package.json       # Dependencias backend
└── start.sh              # Script de inicio rápido
```

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
./start.sh
```

Este script:
1. Instala dependencias del servidor (si es necesario)
2. Inicia el servidor de scraping (puerto 3001)
3. Inicia el frontend (puerto 5173)

### Opción 2: Manual

**Terminal 1 - Servidor de Scraping:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

## 📦 Stack Tecnológico

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Styling moderno
- **Lucide React** - Iconos premium

### Backend Scraper
- **Express** - Servidor HTTP
- **Puppeteer** - Browser automation
- **Puppeteer-Extra-Stealth** - Anti-detección
- **User-Agents** - Rotación de navegadores

### APIs
- **Adzuna API** - Ofertas verificadas
- **LinkedIn** - Scraping directo
- **Indeed** - Scraping directo

## 🔧 Configuración

### Variables de Entorno (Opcional)

Puedes configurar el servidor de scraping editando `server/server.js`:

```javascript
const PORT = 3001; // Puerto del servidor
```

### Proxy de Desarrollo

El frontend usa un proxy para Adzuna API (configurado en `vite.config.js`):

```javascript
proxy: {
  '/api': {
    target: 'https://api.adzuna.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 📊 Flujo de Datos

1. **Usuario busca** → `SearchBar.jsx`
2. **Frontend llama** → `jobService.js`
3. **Peticiones paralelas**:
   - Adzuna API (directo)
   - Servidor Scraper (LinkedIn + Indeed)
4. **Unificación** → Deduplicación por título+empresa
5. **Ordenamiento** → Por fecha de publicación
6. **Renderizado** → `JobList.jsx` con badges de fuente

## 🎯 Endpoints API

### Scraper Server

**GET** `/api/scrape`
```
Query params:
- query: Término de búsqueda (default: "developer")
- location: Ubicación (default: "España")

Response:
{
  "success": true,
  "count": 20,
  "jobs": [...]
}
```

**GET** `/health`
```
Response:
{
  "status": "ok",
  "timestamp": "2026-02-12T12:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Error: Cannot connect to scraper server
```bash
# Verifica que el servidor esté corriendo
cd server
npm start
```

### Scraping muy lento
- Es normal, el scraping real tarda 15-30 segundos
- LinkedIn e Indeed tienen protección anti-bot
- El servidor usa técnicas avanzadas para evitar bloqueos

### Chromium download failed
```bash
# Linux
sudo apt-get install -y chromium-browser

# O usa Puppeteer con Chrome instalado
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### CORS errors
- El servidor backend debe estar corriendo en puerto 3001
- El frontend hace peticiones a `http://localhost:3001`
- Si cambias el puerto, actualiza `SCRAPER_API_URL` en `scraperService.js`

## 📝 Notas de Desarrollo

- El servidor mantiene una instancia de navegador activa para mejor rendimiento
- Los scrapers tienen límite de 10 ofertas por fuente (configurable)
- La deduplicación usa `título + empresa` normalizado
- Los logos se extraen cuando están disponibles
- Timeout de scraping: 45 segundos

## 🔒 Consideraciones Legales

Este proyecto es para **fines educativos**. El web scraping debe usarse de forma responsable:
- Respeta los Terms of Service de cada plataforma
- No hagas scraping agresivo (rate limiting)
- Considera usar APIs oficiales cuando estén disponibles
- Este código incluye delays y técnicas para ser "amigable"

## 📄 Licencia

MIT License - Úsalo libremente para aprender y experimentar.

## 🤝 Contribuciones

¿Mejoras? ¡Pull requests bienvenidos!

---

**Hecho con ❤️ usando React, Puppeteer y mucho café ☕**

