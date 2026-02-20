# 🔑 Configuración de InfoJobs API - Guía Rápida

## 📝 Paso 1: Acceder al Portal de Desarrolladores

**URL**: https://developer.infojobs.net/

### Opciones:
- **Si tienes cuenta en InfoJobs**: Inicia sesión directamente
- **Si NO tienes cuenta**: Primero regístrate en https://www.infojobs.net/

---

## 🚀 Paso 2: Crear una Aplicación

1. Una vez dentro del portal de desarrolladores, ve a **"Mis Aplicaciones"**
2. Haz clic en **"Crear nueva aplicación"** o **"Nueva App"**
3. Completa el formulario:

```
Nombre de la aplicación: Universal Job Aggregator
Descripción: Agregador de ofertas de empleo para búsqueda local
URL de la aplicación: http://localhost:3001
URL de callback: http://localhost:3001/callback
Tipo de aplicación: Web Application
```

---

## 🔐 Paso 3: Obtener las Credenciales

Después de crear la aplicación, verás:

- **Client ID** (ID de Cliente): Una cadena alfanumérica
- **Client Secret** (Secreto de Cliente): Otra cadena alfanumérica

**⚠️ IMPORTANTE**: 
- NO compartas estas credenciales públicamente
- El Client Secret es como una contraseña

---

## ⚙️ Paso 4: Configurar en tu Proyecto

Abre el archivo `.env` en la carpeta `server/` y actualiza estas líneas:

```env
INFOJOBS_CLIENT_ID=TU_CLIENT_ID_AQUI
INFOJOBS_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
```

**Ejemplo** (con credenciales ficticias):
```env
INFOJOBS_CLIENT_ID=a1b2c3d4e5f6g7h8
INFOJOBS_CLIENT_SECRET=z9y8x7w6v5u4t3s2r1
```

---

## ✅ Paso 5: Verificar que Funciona

1. **Guarda el archivo `.env`**

2. **Reinicia el servidor** (en la terminal donde está corriendo):
   - Presiona `Ctrl+C` para detenerlo
   - Ejecuta: `npm start`

3. **Prueba la API**:
   ```bash
   curl "http://localhost:3001/api/scrape?query=developer&location=Madrid"
   ```

4. **Verifica los logs**:
   - ✅ Deberías ver: `✅ [InfoJobs] API returned X jobs`
   - ❌ NO deberías ver: `⚠️ [InfoJobs] API Credentials missing`
   - ❌ NO deberías ver: `🤖 InfoJobs detected bot activity`

---

## 📊 Límites de la API (Plan Gratuito)

- **100 peticiones por hora**
- **1000 peticiones por día**
- Suficiente para desarrollo y uso personal

---

## 🆘 Problemas Comunes

### Error 401 - Unauthorized
```
❌ [InfoJobs] API Error: 401
```
**Solución**: Verifica que el Client ID y Secret sean correctos (sin espacios extra)

### Error 429 - Rate Limit
```
❌ [InfoJobs] API Error: 429
```
**Solución**: Has excedido el límite. Espera 1 hora.

### Credenciales no detectadas
```
⚠️ [InfoJobs] API Credentials missing. Skipping.
```
**Solución**: 
1. Verifica que el archivo `.env` esté en la carpeta `server/`
2. Asegúrate de que las líneas NO tengan espacios alrededor del `=`
3. Reinicia el servidor después de editar `.env`

---

## 📚 Documentación Oficial

- **Portal de Desarrolladores**: https://developer.infojobs.net/
- **Documentación API**: https://developer.infojobs.net/documentation
- **Soporte**: soporte@infojobs.net

---

## 🎉 ¡Listo!

Una vez configurado, InfoJobs funcionará sin CAPTCHA y obtendrás:
- Hasta 20 ofertas por búsqueda
- Datos completos (título, empresa, salario, ubicación, descripción)
- Sin bloqueos ni verificaciones anti-bot

---

**Última actualización**: 2026-02-12
