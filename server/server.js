import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import dotenv from 'dotenv';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

// Load environment variables
dotenv.config();

// Apply stealth plugin to avoid detection
puppeteer.use(StealthPlugin());
const app = express();

// Helper to clean location for Spanish-only portals (InfoJobs, Tecnoempleo)
const stripCountry = (loc) => {
    if (!loc) return loc;
    return loc.split(',')[0].trim();
};
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- IN-MEMORY CACHE ---
const cache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const getCachedData = (query, location) => {
    const key = `${query.toLowerCase()}-${location.toLowerCase()}`;
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        console.log(`📡 [Cache] Hit for: ${key}`);
        return entry.data;
    }
    return null;
};

const setCachedData = (query, location, data) => {
    const key = `${query.toLowerCase()}-${location.toLowerCase()}`;
    cache.set(key, {
        timestamp: Date.now(),
        data: data
    });
    // Clean old cache entries occasionally
    if (cache.size > 50) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
};

// Browser instance (reuse for performance)
let browser = null;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const getBrowser = async () => {
    if (!browser || !browser.isConnected()) {
        const args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--window-size=1366,768',
            '--lang=es-ES,es',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-extensions',
            '--no-first-run',
            '--no-zygote',
            '--single-process',  // Required for Render free tier
            '--memory-pressure-off',
        ];

        browser = await puppeteer.launch({
            headless: true,
            args,
            // En producción: /usr/bin/chromium (del Dockerfile). En local: Chromium bundled de puppeteer
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        });

        // Auto-restart on crash
        browser.on('disconnected', () => {
            console.warn('⚠️ Browser disconnected, will relaunch on next request.');
            browser = null;
        });
    }
    return browser;
};

// --- API FETCHERS ---

/**
 * InfoJobs Official API Integration
 */
const fetchInfoJobsAPI = async (query, location) => {
    const clientId = process.env.INFOJOBS_CLIENT_ID;
    const clientSecret = process.env.INFOJOBS_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId === 'your_client_id') {
        // Silencioso por defecto para evitar ruido si no hay API configurada
        return [];
    }

    try {
        const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
        const response = await axios.get('https://api.infojobs.net/api/7/offer', {
            params: {
                q: query,
                province: stripCountry(location),
                maxResults: 20
            },
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.status === 200 && response.data.offers) {
            return response.data.offers.map(offer => ({
                id: `ij-${offer.id}`,
                title: offer.title,
                company: offer.author?.name || 'Empresa en InfoJobs',
                location: offer.province?.value || location,
                url: offer.link,
                logo: offer.author?.logoUrl || null,
                source: 'InfoJobs',
                postedAt: formatDate(offer.published),
                salary: offer.salaryDescription || 'Ver en InfoJobs',
                tags: ['InfoJobs', offer.category?.value].filter(Boolean),
                description: offer.requirementMin || 'Ver oferta completa en InfoJobs'
            }));
        }
        return [];
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                return [{
                    id: 'ij-error-401',
                    title: 'Error de Autenticación InfoJobs (401)',
                    company: 'Sistema',
                    location: '-',
                    url: '#',
                    source: 'InfoJobs',
                    postedAt: 'Ahora',
                    salary: '-',
                    tags: ['SISTEMA_ERROR'],
                    description: 'Las credenciales de la API de InfoJobs no son válidas.'
                }];
            } else if (status === 429) {
                return [{
                    id: 'ij-error-429',
                    title: 'Límite de Consultas (429)',
                    company: 'InfoJobs API',
                    location: '-',
                    url: '#',
                    source: 'InfoJobs',
                    postedAt: 'Ahora',
                    salary: '-',
                    tags: ['RATE_LIMIT'],
                    description: 'Se ha alcanzado el límite de peticiones a la API de InfoJobs.'
                }];
            } else if (status === 403) {
                return [{
                    id: 'ij-error-403',
                    title: 'Fuente Restringida (403)',
                    company: 'Sistema',
                    location: '-',
                    url: '#',
                    source: 'InfoJobs',
                    postedAt: 'Ahora',
                    salary: '-',
                    tags: ['SOURCE_RESTRICTED'],
                    description: 'El acceso a la API de InfoJobs está restringido.'
                }];
            }
        }
        console.error(`❌ [InfoJobs] API Error: ${error.message}`);
        return [];
    }
};

/**
 * InfoJobs Scraper (Fallback for missing API credentials or restrictions)
 */
// Map of common Spanish cities to InfoJobs provinceIds
const INFOJOBS_PROVINCE_IDS = {
    'madrid': '33', 'barcelona': '8', 'valencia': '46', 'sevilla': '41',
    'zaragoza': '50', 'malaga': '29', 'murcia': '30', 'palma': '7',
    'las palmas': '35', 'bilbao': '48', 'alicante': '3', 'cordoba': '14',
    'valladolid': '47', 'vigo': '36', 'gijon': '33', 'hospitalet': '8',
    'vitoria': '1', 'granada': '18', 'elche': '3', 'oviedo': '33',
    'badalona': '8', 'cartagena': '30', 'terrassa': '8', 'jerez': '11',
    'sabadell': '8', 'mostoles': '33', 'santa cruz': '38', 'pamplona': '31',
    'almeria': '4', 'almería': '4', 'burgos': '9', 'albacete': '2',
    'santander': '39', 'castellon': '12', 'logrono': '26', 'badajoz': '6',
    'salamanca': '37', 'huelva': '21', 'lleida': '25', 'tarragona': '43',
    'leon': '24', 'cadiz': '11', 'jaen': '23', 'ourense': '32',
    'lugo': '27', 'caceres': '10', 'melilla': '52', 'ceuta': '51'
};

const getInfoJobsProvinceId = (location) => {
    const clean = stripCountry(location)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim();
    // Direct match
    if (INFOJOBS_PROVINCE_IDS[clean]) return INFOJOBS_PROVINCE_IDS[clean];
    // Partial match
    for (const [key, id] of Object.entries(INFOJOBS_PROVINCE_IDS)) {
        if (clean.includes(key) || key.includes(clean)) return id;
    }
    return null;
};

const scrapeInfoJobs = async (query, location) => {
    let page = null;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();

        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
        await page.setUserAgent(userAgent);
        await page.setViewport({ width: 1366, height: 768 });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'DNT': '1'
        });

        // Build URL: prefer provinceId-based URL (more reliable than city slug)
        const provinceId = getInfoJobsProvinceId(location);
        let searchUrl;
        const cleanLoc = stripCountry(location).toLowerCase();
        if (cleanLoc === 'remoto' || cleanLoc === 'remote') {
            searchUrl = `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keywords=${encodeURIComponent(query)}&teleworkingIds=2`;
        } else if (provinceId) {
            searchUrl = `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keywords=${encodeURIComponent(query)}&provinceIds=${provinceId}`;
        } else {
            searchUrl = `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keywords=${encodeURIComponent(query)}`;
        }

        console.log(`🔍 [InfoJobs] Visiting: ${searchUrl}`);

        // Short delay to appear human
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Check for anti-bot / CAPTCHA
        const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
        if (pageText.includes('¿Eres humano') || pageText.includes('CAPTCHA') || pageText.includes('robot')) {
            console.warn('🤖 [InfoJobs] CAPTCHA detected, skipping.');
            return [];
        }

        // Accept cookies if present
        try {
            await page.waitForSelector('#didomi-notice-agree-button', { timeout: 4000 });
            await page.click('#didomi-notice-agree-button');
            await new Promise(r => setTimeout(r, 800));
        } catch (e) { }

        // Wait for job cards — try multiple known selectors
        const cardSelectors = [
            '.sui-AtomCard',
            '[data-test="offer-list-item"]',
            'li.ij-OfferList-item',
            'article[class*="offer"]'
        ];
        let foundSelector = null;
        for (const sel of cardSelectors) {
            try {
                await page.waitForSelector(sel, { timeout: 8000 });
                foundSelector = sel;
                console.log(`✓ [InfoJobs] Cards found with selector: ${sel}`);
                break;
            } catch (e) { }
        }

        if (!foundSelector) {
            // Last resort: check raw page state
            const debug = await page.evaluate(() => ({
                title: document.title,
                url: window.location.href,
                bodySnip: document.body.innerText.substring(0, 300)
            }));
            console.warn('⚠️ [InfoJobs] No card selector matched.', JSON.stringify(debug));
            return [];
        }

        // Small scroll to trigger lazy loading
        await page.evaluate(() => window.scrollBy(0, 400));
        await new Promise(r => setTimeout(r, 600));

        const extracted = await page.evaluate(() => {
            const selectors = [
                '.sui-AtomCard',
                '[data-test="offer-list-item"]',
                'li.ij-OfferList-item',
                'article[class*="offer"]'
            ];
            let cards = [];
            for (const s of selectors) {
                cards = Array.from(document.querySelectorAll(s));
                if (cards.length > 0) break;
            }
            return cards.slice(0, 15).map(card => {
                // Try multiple title / company selectors
                const titleEl = card.querySelector(
                    '.ij-OfferCardContent-description-title-link, a[data-test="offer-title"], h2 a'
                );
                const companyEl = card.querySelector(
                    '.ij-OfferCardContent-description-subtitle-link, [data-test="company-name"], span[class*="company"]'
                );
                return {
                    title: titleEl?.innerText.trim(),
                    company: companyEl?.innerText.trim() || 'Empresa en InfoJobs',
                    url: titleEl?.href,
                    source: 'InfoJobs'
                };
            }).filter(j => j.title && j.url);
        });

        console.log(`✅ [InfoJobs] Extracted ${extracted.length} jobs`);
        return extracted.map((j, i) => ({
            ...j,
            id: `ij-scrape-${Date.now()}-${i}`,
            location: location,
            postedAt: 'Reciente',
            salary: 'Ver en InfoJobs',
            tags: ['InfoJobs'],
            description: 'Oferta extraída en tiempo real de InfoJobs'
        }));
    } catch (error) {
        console.error(`❌ [InfoJobs] Error: ${error.message}`);
        return [];
    } finally {
        if (page) await page.close();
    }
};

/**
 * LinkedIn Official API Integration
 */
let linkedinToken = null;
let linkedinTokenExpiry = 0;

const getLinkedInAccessToken = async () => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId === 'your_client_id') {
        return null;
    }

    // Return cached token if still valid (with 1 min buffer)
    if (linkedinToken && Date.now() < linkedinTokenExpiry - 60000) {
        return linkedinToken;
    }

    try {
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.access_token) {
            linkedinToken = response.data.access_token;
            linkedinTokenExpiry = Date.now() + (response.data.expires_in * 1000);
            return linkedinToken;
        }
    } catch (error) {
        console.error(`❌ [LinkedIn Auth] Failed to get access token: ${error.message}`);
        if (error.response?.data) {
            console.error('LinkedIn Error Details:', JSON.stringify(error.response.data));
        }
        return null;
    }
    return null;
};

const fetchLinkedInAPI = async (query, location) => {
    const token = await getLinkedInAccessToken();

    if (!token) {
        console.warn('⚠️ [LinkedIn] API Auth failed (Check .env). Skipping API, using scraper fallback.');
        return [];
    }

    try {
        const response = await axios.get('https://api.linkedin.com/v2/jobSearch', {
            params: { q: query, location: location, count: 10 },
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 5000
        });

        return (response.data.elements || []).map((job, i) => ({
            id: `li-api-${job.id || i}`,
            title: job.title || 'Oferta LinkedIn',
            company: job.companyName || 'Empresa',
            location: job.location || location,
            url: job.jobUrl || `https://www.linkedin.com/jobs/view/${job.id}`,
            source: 'LinkedIn',
            postedAt: 'Reciente',
            salary: 'Ver en LinkedIn',
            tags: ['API Oficial'],
            description: job.description || 'Oferta obtenida vía API de LinkedIn'
        }));
    } catch (error) {
        if (error.response?.status === 403) {
            console.warn('⚠️ [LinkedIn] API restrictiva: Tu App no tiene permiso para "Job Search".');
            return [{
                id: 'li-restricted',
                title: 'Acceso Restringido a API de Empleo',
                company: 'LinkedIn Partners',
                location: '-',
                url: '#',
                source: 'LinkedIn',
                postedAt: 'Aviso',
                salary: '-',
                tags: ['RESTRICCIÓN'],
                description: 'LinkedIn requiere ser "Partner" para buscar empleos vía API. Usando scraping avanzado como alternativa.'
            }];
        }
        console.error(`❌ [LinkedIn] API Error: ${error.message}`);
        return [];
    }
};

/**
 * Tecnoempleo Integration
 */
const fetchTecnoempleo = async (query, location) => {
    try {
        const cleanLoc = stripCountry(location);
        const rssUrl = `https://www.tecnoempleo.com/ofertas-empleo-rss.php?te=${encodeURIComponent(query)}&lo=${encodeURIComponent(cleanLoc)}`;
        const response = await axios.get(rssUrl, { timeout: 10000 });
        const parser = new XMLParser();
        const jObj = parser.parse(response.data);

        if (jObj.rss?.channel?.item) {
            const items = Array.isArray(jObj.rss.channel.item) ? jObj.rss.channel.item : [jObj.rss.channel.item];
            return items.map((item, i) => ({
                id: `te-rss-${Date.now()}-${i}`,
                title: item.title,
                company: item.author || 'Empresa Tech',
                location: location,
                url: item.link,
                source: 'Tecnoempleo',
                postedAt: formatDate(item.pubDate),
                salary: 'Ver en Tecnoempleo',
                tags: ['Tech', 'RSS'],
                description: item.description?.replace(/<[^>]*>?/gm, '') || ''
            }));
        }
    } catch (e) {
        console.warn('⚠️ [Tecnoempleo] RSS failed, falling back to light scraping');
    }

    let page = null;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();
        await new Promise(r => setTimeout(r, 1000));
        const cleanLoc = stripCountry(location);
        const searchUrl = `https://www.tecnoempleo.com/ofertas-trabajo/?te=${encodeURIComponent(query)}&lo=${encodeURIComponent(cleanLoc)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        const extracted = await page.evaluate(() => {
            // New selectors for Tecnoempleo (verified)
            const cards = Array.from(document.querySelectorAll('div.p-3.border.rounded.mb-3.bg-white'));
            return cards.slice(0, 10).map(card => {
                const titleEl = card.querySelector('h3 a.font-weight-bold');
                const companyEl = card.querySelector('a.text-primary.link-muted');
                return {
                    title: titleEl?.innerText.trim(),
                    company: companyEl?.innerText.trim() || 'Empresa Tech',
                    url: titleEl?.href,
                    source: 'Tecnoempleo'
                };
            }).filter(j => j.title);
        });

        return extracted.map((j, i) => ({
            ...j,
            id: `te-scrape-${Date.now()}-${i}`,
            location: location,
            postedAt: 'Reciente',
            salary: 'Ver en Tecnoempleo',
            tags: ['Tech'],
            description: 'Oferta de Tecnoempleo'
        }));
    } catch (error) {
        console.error(`❌ [Tecnoempleo] Error: ${error.message}`);
        return [];
    } finally {
        if (page) await page.close();
    }
};

/**
 * LinkedIn Advanced Scraper (Fallback when API is restricted)
 */
const scrapeLinkedIn = async (query, location) => {
    let page = null;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();

        await page.setViewport({ width: 1280 + Math.floor(Math.random() * 100), height: 800 });
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
        await page.setUserAgent(userAgent);

        // LinkedIn guest search needs 'Spain' (not 'España') to avoid Philippines redirection for cities like Almeria
        let searchLoc = location;
        if (location.toLowerCase().includes('españa')) {
            searchLoc = location.replace(/españa/gi, 'Spain');
        } else if (!location.toLowerCase().includes('spain') && !location.toLowerCase().includes('remote')) {
            searchLoc = `${location}, Spain`;
        }

        const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(searchLoc)}&position=1&pageNum=0`;
        console.log(`🔍 [Scraper] Visiting LinkedIn: ${searchUrl}`);

        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Check if we are redirected to a login page
        const currentUrl = page.url();
        if (currentUrl.includes('login') || currentUrl.includes('checkpoint')) {
            console.warn('⚠️ [Scraper] LinkedIn redirected to login/checkpoint. Search blocked.');
            return [];
        }

        try {
            const cookieButton = await page.waitForSelector('button[data-tracking-control-name="ga-cookie.consent.accept"]', { timeout: 3000 });
            if (cookieButton) {
                await cookieButton.click();
                console.log('🍪 [Scraper] LinkedIn cookies accepted');
            }
        } catch (e) { }

        // Wait for some job cards to appear
        try {
            await page.waitForSelector('.base-card, .job-search-card, .base-search-card', { timeout: 5000 });
        } catch (e) {
            console.warn('⚠️ [Scraper] No job cards found on LinkedIn page (Timeout)');
            // Check for "No jobs found" message
            const bodyText = await page.evaluate(() => document.body.innerText);
            if (bodyText.includes('No se han encontrado empleos') || bodyText.includes('No jobs found')) {
                console.log('ℹ️ [Scraper] LinkedIn explicitly says: No jobs found');
            }
            return [];
        }

        const extracted = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.base-card, .job-search-card, .base-search-card, li > .base-card'));
            console.log(`Found ${cards.length} potential cards`);
            return cards.slice(0, 15).map(card => {
                const titleEl = card.querySelector('.base-search-card__title, .job-search-card__title, h3');
                const companyEl = card.querySelector('.base-search-card__subtitle, .job-search-card__subtitle, h4');
                const linkEl = card.querySelector('a.base-card__full-link, a.job-search-card__link, a');
                const imgEl = card.querySelector('img.artdeco-entity-image, img.static-badge__icon');

                return {
                    title: titleEl?.innerText.trim(),
                    company: companyEl?.innerText.trim() || 'Empresa',
                    url: linkEl?.href,
                    logo: imgEl?.src || null,
                    source: 'LinkedIn'
                };
            }).filter(j => j.title && j.url && j.url.includes('/jobs/'));
        });

        console.log(`✅ [Scraper] LinkedIn extracted ${extracted.length} valid jobs`);

        return extracted.map((j, i) => ({
            ...j,
            id: `li-scrape-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            location: location,
            postedAt: 'Reciente',
            salary: 'Ver en LinkedIn',
            tags: ['LinkedIn', 'Extraído'],
            description: 'Oferta extraída en tiempo real de LinkedIn'
        }));
    } catch (error) {
        console.error(`❌ LinkedIn Scraper Error: ${error.message}`);
        return [];
    } finally {
        if (page) await page.close();
    }
};

/**
 * Indeed Scraper
 */
const scrapeIndeed = async (query, location) => {
    let page = null;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
        await page.setUserAgent(userAgent);

        const searchUrl = `https://es.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const title = await page.title();
        if (title.includes('Just a moment') || title.includes('Access denied')) {
            throw new Error('Indeed Blocked');
        }

        const extracted = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.job_seen_beacon')).slice(0, 15).map(card => {
                const titleEl = card.querySelector('h2.jobTitle span, h2.jobTitle a');
                const companyEl = card.querySelector('[data-testid="company-name"]');
                const linkEl = card.querySelector('h2.jobTitle a');
                return {
                    title: titleEl?.innerText,
                    company: companyEl?.innerText || 'Empresa',
                    url: linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : `https://es.indeed.com${linkEl.getAttribute('href')}`) : '',
                    source: 'Indeed'
                };
            }).filter(j => j.title);
        });

        return extracted.map((j, i) => ({
            ...j,
            id: `ind-${Date.now()}-${i}`,
            location: location,
            postedAt: 'Reciente',
            salary: 'Ver en Indeed',
            tags: ['Indeed'],
            description: 'Oferta de Indeed'
        }));
    } catch (error) {
        console.error(`❌ Indeed Error: ${error.message}`);
        return [];
    } finally {
        if (page) await page.close();
    }
};

/**
 * Jobatus Scraper
 */
const scrapeJobatus = async (query, location) => {
    let page = null;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
        await page.setUserAgent(userAgent);
        await page.setViewport({ width: 1280, height: 800 });

        const cleanLoc = stripCountry(location);
        const searchUrl = `https://www.jobatus.es/trabajo?q=${encodeURIComponent(query)}&l=${encodeURIComponent(cleanLoc)}`;
        console.log(`🔍 [Jobatus] Visiting: ${searchUrl}`);

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Accept cookies if cookie banner appears
        try {
            await page.waitForSelector('button[id*="accept"], button[class*="accept"], #didomi-notice-agree-button', { timeout: 3000 });
            await page.click('button[id*="accept"], button[class*="accept"], #didomi-notice-agree-button');
            await new Promise(r => setTimeout(r, 500));
        } catch (e) { }

        // Close modal/popup if present
        try {
            await page.waitForSelector('.modal-close, button[aria-label="Close"], .close-btn, [data-dismiss="modal"]', { timeout: 2000 });
            await page.click('.modal-close, button[aria-label="Close"], .close-btn, [data-dismiss="modal"]');
            await new Promise(r => setTimeout(r, 400));
        } catch (e) { }

        // Wait for results
        try {
            await page.waitForSelector('.result, a.out, div.col-md-12 a.out', { timeout: 10000 });
        } catch (e) {
            console.warn('⚠️ [Jobatus] No results selector found');
            return [];
        }

        const extracted = await page.evaluate(() => {
            // Strategy 1: classic .result cards
            let cards = Array.from(document.querySelectorAll('.result'));
            if (cards.length > 0) {
                return cards.slice(0, 15).map(card => {
                    const titleEl = card.querySelector('a.out, .jobtitle a');
                    const companyEl = card.querySelector('a[href*="/empresas/"], .company a, .company span');
                    return {
                        title: titleEl?.innerText.trim(),
                        company: companyEl?.innerText.trim() || 'Empresa en Jobatus',
                        url: titleEl?.href,
                        source: 'Jobatus'
                    };
                }).filter(j => j.title && j.url);
            }

            // Strategy 2: grab all organic job links from listing
            const allLinks = Array.from(document.querySelectorAll('a.out[href*="jobatus"], a.out[href*="/trabajo/"]'));
            return allLinks.slice(0, 15).map(a => {
                const container = a.closest('div, li, article');
                const companyEl = container?.querySelector('a[href*="/empresas/"], small, span.company');
                return {
                    title: a.innerText.trim(),
                    company: companyEl?.innerText.trim() || 'Empresa en Jobatus',
                    url: a.href,
                    source: 'Jobatus'
                };
            }).filter(j => j.title && j.url);
        });

        console.log(`✅ [Jobatus] Extracted ${extracted.length} jobs`);
        return extracted.map((j, i) => ({
            ...j,
            id: `jb-${Date.now()}-${i}`,
            location: location,
            postedAt: 'Reciente',
            salary: 'Ver en Jobatus',
            tags: ['Jobatus'],
            description: 'Oferta extraída de Jobatus'
        }));
    } catch (error) {
        console.error(`❌ [Jobatus] Error: ${error.message}`);
        return [];
    } finally {
        if (page) await page.close();
    }
};

const scrapeInfoempleo = async (query, location) => {
    let page = null;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
        await page.setUserAgent(userAgent);

        // Infoempleo URL structure for Spain
        const cleanLoc = stripCountry(location).toLowerCase().replace(/\s+/g, '-');
        const searchUrl = `https://www.infoempleo.com/trabajo/en_${cleanLoc}/?search=${encodeURIComponent(query)}`;
        console.log(`🔍 [Scraper] Visiting Infoempleo: ${searchUrl}`);

        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Aceptar cookies de Infoempleo
        try {
            const acceptBtn = await page.waitForSelector('#didomi-notice-agree-button', { timeout: 5000 });
            if (acceptBtn) {
                await acceptBtn.click();
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            // Si no aparece o el ID es diferente, intentamos otro común
            try {
                await page.click('button[onclick*="accept"], .btn-accept, #onetrust-accept-btn-handler');
            } catch (err) { }
        }

        const extracted = await page.evaluate(() => {
            // Infoempleo uses li.info-b or similar for their offer blocks
            const cards = Array.from(document.querySelectorAll('li.info-b, .offerblock, article.offer'));
            return cards.slice(0, 15).map(card => {
                const titleEl = card.querySelector('h2 a');
                const companyEl = card.querySelector('.company, p.company, a[href*="/empresa/"]');

                return {
                    title: titleEl?.innerText.trim(),
                    company: companyEl?.innerText.trim() || 'Empresa en Infoempleo',
                    url: titleEl?.href,
                    source: 'Infoempleo'
                };
            }).filter(j => j.title && j.url);
        });

        console.log(`✅ [Scraper] Infoempleo extracted ${extracted.length} jobs`);

        return extracted.map((j, i) => ({
            ...j,
            id: `ie-${Date.now()}-${i}`,
            location: location,
            postedAt: 'Reciente',
            salary: 'Ver en Infoempleo',
            tags: ['Infoempleo'],
            description: 'Oferta extraída de Infoempleo'
        }));
    } catch (error) {
        console.error(`❌ Infoempleo Error: ${error.message}`);
        return [];
    } finally {
        if (page) await page.close();
    }
};

/**
 * Computrabajo Scraper
 */
const scrapeComputrabajo = async (query, location) => {
    let page = null;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
        await page.setUserAgent(userAgent);

        // Computrabajo ES URL
        const cleanLoc = stripCountry(location).toLowerCase().replace(/\s+/g, '-');
        const searchUrl = `https://www.computrabajo.es/ofertas-de-trabajo/?q=${encodeURIComponent(query)}&l=${encodeURIComponent(cleanLoc)}`;
        console.log(`🔍 [Scraper] Visiting Computrabajo: ${searchUrl}`);

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Accept cookies if they appear
        try {
            await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
            await page.click('#onetrust-accept-btn-handler');
        } catch (e) { }

        const extracted = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('article.box_offer'));
            return cards.map(card => {
                const titleEl = card.querySelector('h2 a');
                const companyEl = card.querySelector('p.fs16 a') || card.querySelector('a.fc_base');
                const linkEl = card.querySelector('a.js-o-link');

                return {
                    title: titleEl?.innerText.trim(),
                    company: companyEl?.innerText.trim() || 'Empresa en Computrabajo',
                    url: linkEl?.href,
                    source: 'Computrabajo'
                };
            }).filter(j => j.title && j.url);
        });

        console.log(`✅ [Scraper] Computrabajo extracted ${extracted.length} jobs`);

        return extracted.map((j, i) => ({
            ...j,
            id: `ct-${Date.now()}-${i}`,
            location: location,
            postedAt: 'Reciente',
            salary: 'Ver en Computrabajo',
            tags: ['Computrabajo'],
            description: 'Oferta extraída de Computrabajo'
        }));
    } catch (error) {
        console.error(`❌ Computrabajo Error: ${error.message}`);
        return [];
    } finally {
        if (page) await page.close();
    }
};

// --- HELPERS ---

const formatDate = (dateString) => {
    if (!dateString) return 'Reciente';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-ES');
    } catch {
        return 'Reciente';
    }
};

/**
 * Remotive API — empleos remotos (sin autenticación, funciona en Render)
 */
const fetchRemotive = async (query) => {
    try {
        const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=15`;
        const response = await axios.get(url, { timeout: 10000 });
        const jobs = response.data?.jobs || [];
        return jobs.map((job, i) => ({
            id: `rm-${Date.now()}-${i}`,
            title: job.title,
            company: job.company_name || 'Empresa Remota',
            location: 'Remoto',
            url: job.url,
            source: 'Remotive',
            postedAt: formatDate(job.publication_date),
            salary: job.salary || 'Ver en Remotive',
            tags: ['Remoto', job.job_type || 'Tech', ...(job.tags || []).slice(0, 2)],
            description: job.description?.replace(/<[^>]*>?/gm, '').substring(0, 200) || ''
        }));
    } catch (e) {
        console.warn('⚠️ [Remotive] Failed:', e.message);
        return [];
    }
};

const aggregateAllJobs = async (query, location) => {
    console.log(`\n🚀 Aggregating: "${query}" in "${location}"`);

    // Check cache
    const cached = getCachedData(query, location);
    if (cached) return cached;

    let results;

    if (IS_PRODUCTION) {
        // En producción: solo fuentes HTTP (sin Puppeteer) — los scrapers dan timeout en Render
        console.log('🌐 [Production mode] Using HTTP-only sources (no Puppeteer)');
        results = await Promise.allSettled([
            fetchInfoJobsAPI(query, location),     // InfoJobs API oficial
            fetchLinkedInAPI(query, location),     // LinkedIn API oficial
            fetchTecnoempleo(query, location),     // Tecnoempleo RSS (HTTP)
            fetchRemotive(query),                  // Remotive API (empleos remotos)
        ]);
    } else {
        // En local: todos los scrapers disponibles
        console.log('🔧 [Local mode] Using all sources including Puppeteer scrapers');
        results = await Promise.allSettled([
            fetchLinkedInAPI(query, location),
            scrapeLinkedIn(query, location),
            fetchInfoJobsAPI(query, location),
            scrapeInfoJobs(query, location),
            fetchTecnoempleo(query, location),
            scrapeIndeed(query, location),
            scrapeJobatus(query, location),
            scrapeInfoempleo(query, location),
            fetchRemotive(query),
        ]);
    }

    const allJobs = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

    const counts = allJobs.reduce((acc, job) => {
        acc[job.source] = (acc[job.source] || 0) + 1;
        return acc;
    }, {});

    console.log('📊 Jobs by source:', counts);
    console.log(`✨ Found ${allJobs.length} jobs total`);

    // Only cache if we found some results
    if (allJobs.length > 0) {
        setCachedData(query, location, allJobs);
    }

    return allJobs;
};

// --- ENDPOINTS ---

app.get('/api/scrape', async (req, res) => {
    try {
        // Decode query parameters properly to handle UTF-8 characters
        let query = req.query.query || 'empleo';
        let location = req.query.location || 'madrid';

        // Fix double-encoded UTF-8 (e.g., "AlmerÃ­a" -> "Almería")
        try {
            // If the string looks double-encoded, decode it
            if (location.includes('Ã') || location.includes('Â')) {
                location = decodeURIComponent(escape(location));
            }
        } catch (e) {
            // If decoding fails, use as-is
        }

        console.log(`📥 Request: query="${query}", location="${location}"`);
        const jobs = await aggregateAllJobs(query, location);
        res.json({ success: true, count: jobs.length, jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message, jobs: [] });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

process.on('SIGINT', async () => {
    if (browser) await browser.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
});

