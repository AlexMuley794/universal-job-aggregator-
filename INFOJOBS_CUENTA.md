# 🏢 InfoJobs API - Requisitos de Cuenta

## ⚠️ PROBLEMA IDENTIFICADO

El mensaje "The registration of new apps is currently unavailable" puede deberse a:

### 1. Tipo de Cuenta Incorrecto ✅ (MÁS PROBABLE)

**InfoJobs requiere una cuenta de EMPRESA para acceder a la API de desarrolladores.**

Si tienes una cuenta de **candidato** (para buscar empleo), NO tendrás acceso al portal de desarrolladores.

### Solución:

#### Opción A: Crear Cuenta de Empresa (Recomendado si tienes una empresa)

1. **Visita**: https://empresas.infojobs.net/
2. **Regístrate** como empresa
3. Una vez registrado, accede a: https://developer.infojobs.net/
4. Ahora deberías poder crear aplicaciones

#### Opción B: Solicitar Acceso como Desarrollador Individual

1. **Contacta a InfoJobs**: soporte@infojobs.net
2. **Asunto**: "Solicitud de acceso a API para desarrollo personal"
3. **Mensaje sugerido**:
   ```
   Hola,
   
   Soy desarrollador y estoy creando un agregador de ofertas de empleo
   para uso personal/educativo. Me gustaría acceder a la API de InfoJobs
   para integrar sus ofertas en mi aplicación.
   
   ¿Es posible obtener acceso a la API de desarrolladores sin tener
   una cuenta de empresa?
   
   Gracias,
   [Tu nombre]
   ```

### 2. Restricción Temporal de InfoJobs

Es posible que InfoJobs haya pausado temporalmente el registro de nuevas apps.

---

## 🔄 SOLUCIÓN ALTERNATIVA (Mientras tanto)

Ya que LinkedIn funciona bien, voy a optimizar el scraper de InfoJobs para que:

1. **Evite el CAPTCHA** con mejores técnicas anti-detección
2. **Use caché** para reducir peticiones
3. **Implemente delays inteligentes** entre búsquedas

---

## 📊 Estado Actual del Sistema

✅ **LinkedIn**: Funcionando (15 ofertas por búsqueda)
✅ **Indeed**: Funcionando (15 ofertas por búsqueda)
⚠️ **InfoJobs**: Bloqueado por CAPTCHA (necesita API o mejor scraping)
✅ **Tecnoempleo**: Funcionando parcialmente

**Total actual**: ~30 ofertas por búsqueda

---

## 💡 Recomendaciones

### Corto Plazo (HOY):
1. Optimizar scraper de InfoJobs con técnicas anti-detección
2. Implementar sistema de caché
3. Añadir más fuentes (Computrabajo, Jobatus, etc.)

### Medio Plazo (Esta semana):
1. Crear cuenta de empresa en InfoJobs
2. O contactar soporte para acceso de desarrollador
3. Integrar API oficial cuando esté disponible

---

## 🚀 ¿Qué prefieres hacer ahora?

**Opción 1**: Crear cuenta de empresa en InfoJobs (si tienes/quieres crear una empresa)
**Opción 2**: Contactar a soporte de InfoJobs para solicitar acceso
**Opción 3**: Optimizar el scraper actual y añadir más fuentes de empleo

---

**Última actualización**: 2026-02-12
