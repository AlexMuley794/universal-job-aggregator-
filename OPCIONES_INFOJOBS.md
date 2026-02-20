# 📊 Resumen: Configuración de InfoJobs

## 🔍 Problema Identificado

**InfoJobs requiere una cuenta de EMPRESA para acceder a la API de desarrolladores.**

Tu cuenta actual es de **candidato** (para buscar empleo), por eso ves:
```
"The registration of new apps is currently unavailable"
```

---

## ✅ Soluciones Implementadas (AHORA)

Mientras decides qué hacer con la cuenta de empresa, he mejorado el scraper de InfoJobs:

### Mejoras Anti-Detección:
- ✅ **Delays más largos**: 3-6 segundos entre peticiones (antes: 1-3s)
- ✅ **Headers realistas**: Accept-Language, DNT, Connection, etc.
- ✅ **Viewport aleatorio**: Tamaño de ventana variable
- ✅ **Scrolling humano**: Desplazamiento gradual en 2 pasos
- ✅ **Mensajes mejorados**: Indica claramente el problema y soluciones

### Resultado Esperado:
- Menos CAPTCHAs (aunque no eliminados completamente)
- Mejor tasa de éxito en las búsquedas
- Si aparece CAPTCHA, esperar 10-15 minutos antes de reintentar

---

## 🎯 Opciones para InfoJobs (Elige una)

### Opción 1: Crear Cuenta de Empresa (Recomendado si tienes empresa)

**Pasos:**
1. Visita: https://empresas.infojobs.net/
2. Regístrate como empresa
3. Accede a: https://developer.infojobs.net/
4. Crea una aplicación y obtén credenciales
5. Configura en `server/.env`

**Ventajas:**
- ✅ Sin CAPTCHA
- ✅ 100 peticiones/hora
- ✅ Datos completos y estructurados

**Desventajas:**
- ❌ Requiere tener o crear una empresa
- ❌ Proceso de registro más largo

---

### Opción 2: Solicitar Acceso como Desarrollador Individual

**Pasos:**
1. Envía email a: soporte@infojobs.net
2. Asunto: "Solicitud de acceso a API para desarrollo personal"
3. Explica tu proyecto educativo/personal

**Plantilla de email:**
```
Hola,

Soy desarrollador y estoy creando un agregador de ofertas de empleo
para uso personal/educativo llamado "Universal Job Aggregator".

Me gustaría integrar las ofertas de InfoJobs en mi aplicación.
¿Es posible obtener acceso a la API de desarrolladores sin tener
una cuenta de empresa?

El proyecto es de código abierto y no tiene fines comerciales.

Gracias,
[Tu nombre]
```

**Ventajas:**
- ✅ No requiere empresa
- ✅ Posible acceso a API

**Desventajas:**
- ❌ No garantizado
- ❌ Puede tardar días/semanas

---

### Opción 3: Continuar con Scraping Mejorado (Actual)

**Estado actual:**
- ✅ LinkedIn: 15 ofertas/búsqueda
- ✅ Indeed: 15 ofertas/búsqueda
- ⚠️ InfoJobs: Variable (0-10 ofertas, depende de CAPTCHA)
- ✅ Tecnoempleo: 5-10 ofertas/búsqueda

**Total**: ~30-40 ofertas por búsqueda

**Ventajas:**
- ✅ Ya funciona
- ✅ No requiere cuenta de empresa
- ✅ Gratis

**Desventajas:**
- ❌ InfoJobs puede mostrar CAPTCHA
- ❌ Menos confiable que API oficial

**Recomendaciones:**
- Esperar 10-15 minutos entre búsquedas
- Usar principalmente LinkedIn e Indeed
- InfoJobs como fuente secundaria

---

### Opción 4: Añadir Más Fuentes de Empleo

En lugar de depender de InfoJobs, puedo añadir:

- **Computrabajo** (scraping o RSS)
- **Jobatus** (agregador)
- **Turijobs** (turismo)
- **Infoempleo** (scraping)
- **Monster España** (scraping)

**Ventajas:**
- ✅ Más diversidad de ofertas
- ✅ Menos dependencia de una sola fuente
- ✅ Mejor cobertura geográfica

---

## 💡 Mi Recomendación

**Corto plazo (HOY)**:
1. Usar el sistema actual con scraping mejorado
2. Añadir 2-3 fuentes más (Computrabajo, Jobatus)
3. Total estimado: 50-60 ofertas por búsqueda

**Medio plazo (Esta semana)**:
1. Decidir si crear cuenta de empresa en InfoJobs
2. O contactar a soporte para solicitar acceso

---

## 🚀 ¿Qué quieres hacer?

Responde con el número de la opción:

**1** - Crear cuenta de empresa en InfoJobs
**2** - Contactar soporte de InfoJobs
**3** - Continuar con scraping actual (mejorado)
**4** - Añadir más fuentes de empleo (Computrabajo, etc.)
**5** - Combinación: Opción 3 + 4 (Recomendado)

---

**Última actualización**: 2026-02-12 17:40
