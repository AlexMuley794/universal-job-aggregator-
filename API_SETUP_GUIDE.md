# 🔑 Guía de Configuración de APIs

Esta guía te ayudará a obtener las credenciales necesarias para InfoJobs y LinkedIn.

---

## 📋 InfoJobs API

### Paso 1: Registro en InfoJobs Developers

1. **Visita**: [https://developer.infojobs.net/](https://developer.infojobs.net/)
2. **Regístrate** o inicia sesión con tu cuenta de InfoJobs
3. Si no tienes cuenta, créala en [https://www.infojobs.net/](https://www.infojobs.net/)

### Paso 2: Crear una Aplicación

1. Ve a **"Mis Aplicaciones"** en el panel de desarrollador
2. Haz clic en **"Crear nueva aplicación"**
3. Completa el formulario:
   - **Nombre**: Universal Job Aggregator
   - **Descripción**: Agregador de ofertas de empleo
   - **URL de callback**: `http://localhost:3001/callback` (para desarrollo local)
   - **Tipo**: Aplicación Web

### Paso 3: Obtener Credenciales

Una vez creada la aplicación, verás:
- **Client ID** (ID de Cliente)
- **Client Secret** (Secreto de Cliente)

**⚠️ IMPORTANTE**: Guarda estas credenciales de forma segura.

### Paso 4: Configurar en el Proyecto

Copia las credenciales y actualiza el archivo `.env`:

```env
INFOJOBS_CLIENT_ID=tu_client_id_aqui
INFOJOBS_CLIENT_SECRET=tu_client_secret_aqui
```

### 📚 Documentación de InfoJobs API

- **Documentación oficial**: [https://developer.infojobs.net/documentation](https://developer.infojobs.net/documentation)
- **Endpoint de ofertas**: `/api/7/offer`
- **Límites**: 
  - 100 peticiones/hora (plan gratuito)
  - 1000 peticiones/día (plan gratuito)

---

## 💼 LinkedIn API

### ⚠️ ADVERTENCIA IMPORTANTE

LinkedIn ha **restringido severamente** el acceso a su API de empleos:
- Solo disponible para **LinkedIn Partners** (empresas verificadas)
- Requiere aprobación manual de LinkedIn
- No está disponible para desarrolladores individuales en la mayoría de casos

### Alternativas Recomendadas:

#### Opción A: Usar RapidAPI (Recomendado)
1. **Visita**: [https://rapidapi.com/](https://rapidapi.com/)
2. Busca "LinkedIn Jobs" en el marketplace
3. Suscríbete a un servicio como:
   - **LinkedIn Jobs Search API** by Axesso
   - **LinkedIn Data API** by Fresh Data
   - **JSearch** (incluye LinkedIn entre otras fuentes)

**Ejemplo con JSearch**:
```env
RAPIDAPI_KEY=tu_rapidapi_key_aqui
RAPIDAPI_HOST=jsearch.p.rapidapi.com
```

#### Opción B: Continuar con Scraping (Actual)
El scraping de LinkedIn funciona bien actualmente. Solo necesitas:
- Usar con moderación (no más de 1-2 búsquedas por minuto)
- El sistema actual ya implementa stealth mode y rotación de user agents

#### Opción C: Solicitar Acceso a LinkedIn Partner Program
1. **Visita**: [https://developer.linkedin.com/](https://developer.linkedin.com/)
2. Ve a **"My Apps"** → **"Create App"**
3. Completa el formulario empresarial
4. Solicita acceso a **"Jobs API"** (requiere aprobación)

**Nota**: Este proceso puede tardar semanas o meses, y generalmente solo se aprueba para empresas.

---

## 🔧 Configuración Final del Archivo `.env`

Una vez obtengas las credenciales, tu archivo `.env` debería verse así:

```env
# InfoJobs API Credentials (OBLIGATORIO para evitar CAPTCHA)
INFOJOBS_CLIENT_ID=abc123def456
INFOJOBS_CLIENT_SECRET=xyz789uvw012

# LinkedIn - Opción 1: RapidAPI (Recomendado)
RAPIDAPI_KEY=tu_key_de_rapidapi
RAPIDAPI_HOST=jsearch.p.rapidapi.com

# LinkedIn - Opción 2: API Oficial (Solo si eres Partner)
LINKEDIN_CLIENT_ID=tu_linkedin_client_id
LINKEDIN_CLIENT_SECRET=tu_linkedin_client_secret

# Server Configuration
PORT=3001
```

---

## ✅ Verificar la Configuración

Después de actualizar el `.env`:

1. **Reinicia el servidor**:
   ```bash
   # Detén el servidor actual (Ctrl+C)
   cd server
   npm start
   ```

2. **Prueba la API**:
   ```bash
   curl "http://localhost:3001/api/scrape?query=developer&location=Madrid"
   ```

3. **Verifica los logs**:
   - ✅ Deberías ver: `✅ [InfoJobs] API returned X jobs`
   - ❌ No deberías ver: `⚠️ API Credentials missing`

---

## 🆘 Solución de Problemas

### Error 401 (InfoJobs)
- Verifica que el Client ID y Secret sean correctos
- Asegúrate de no tener espacios extra en el `.env`

### Error 403 (LinkedIn)
- Normal si no eres Partner
- Usa RapidAPI o continúa con scraping

### Error 429 (Rate Limit)
- Has excedido el límite de peticiones
- Espera 1 hora (InfoJobs) o implementa caché

---

## 💡 Próximos Pasos Recomendados

1. **Prioridad Alta**: Configurar InfoJobs API (evita CAPTCHA)
2. **Prioridad Media**: Considerar RapidAPI para LinkedIn
3. **Opcional**: Implementar sistema de caché para reducir peticiones

---

## 📞 Soporte

- **InfoJobs**: [soporte@infojobs.net](mailto:soporte@infojobs.net)
- **LinkedIn**: [https://developer.linkedin.com/support](https://developer.linkedin.com/support)
- **RapidAPI**: [https://rapidapi.com/support](https://rapidapi.com/support)

---

**Última actualización**: 2026-02-12
