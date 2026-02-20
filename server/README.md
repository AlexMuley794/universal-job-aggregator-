# 🚀 Advanced Job Scraper Server

Servidor backend con **Puppeteer** para scraping avanzado de LinkedIn e Indeed.

## 🎯 Características

- ✅ **Puppeteer Stealth Mode** - Evita detección de bots
- ✅ **User-Agent Dinámico** - Simula navegadores reales
- ✅ **Geolocalización** - Configura ubicación en Almería, España
- ✅ **Bypass de Bloqueos** - Headers y configuración realista
- ✅ **Scraping Paralelo** - LinkedIn e Indeed simultáneamente
- ✅ **Extracción Precisa** - Título, empresa, ubicación, logo, fecha

## 📦 Instalación

```bash
cd server
npm install
```

## 🏃 Ejecución

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

## 🔌 API Endpoints

### Scrape Jobs
```
GET /api/scrape?query=developer&location=España
```

**Parámetros:**
- `query` (opcional): Término de búsqueda (default: "developer")
- `location` (opcional): Ciudad o ubicación (default: "España")

**Respuesta:**
```json
{
  "success": true,
  "count": 20,
  "jobs": [
    {
      "id": "linkedin-1234567890-0",
      "title": "Senior Developer",
      "company": "Tech Company",
      "location": "Madrid, España",
      "salary": "Consultar en LinkedIn",
      "postedAt": "Hace 2 días",
      "tags": ["LinkedIn", "Remoto"],
      "url": "https://linkedin.com/jobs/view/...",
      "logo": "https://...",
      "jobType": "Varios",
      "description": "Oferta publicada en LinkedIn...",
      "source": "LinkedIn"
    }
  ]
}
```

### Health Check
```
GET /health
```

## 🛠️ Tecnologías

- **Express** - Servidor HTTP
- **Puppeteer** - Browser automation
- **Puppeteer-Extra-Stealth** - Evita detección
- **User-Agents** - Rotación de User-Agents

## 📝 Notas

- El servidor mantiene una instancia de navegador activa para mejor rendimiento
- Las peticiones pueden tardar 15-30 segundos (scraping real)
- Si LinkedIn/Indeed bloquean, el servidor retorna array vacío sin romper la app
- Los logs en consola muestran el progreso del scraping

## 🔧 Troubleshooting

**Error: Cannot connect to scraper server**
```bash
# Asegúrate de que el servidor está corriendo
cd server
npm start
```

**Error: Chromium download failed**
```bash
# Instala dependencias de sistema (Linux)
sudo apt-get install -y chromium-browser
```

**Scraping muy lento**
- Es normal, el scraping real tarda 15-30 segundos
- LinkedIn e Indeed tienen medidas anti-bot
- El servidor usa técnicas avanzadas para evitar bloqueos
