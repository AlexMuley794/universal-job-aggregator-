import { fetchExternalJobs } from './scraperService';

const ADZUNA_APP_ID = 'ec8bd2c4';
const ADZUNA_APP_KEY = '2ebdeae6d73bb59b1113b2fd47cbd01c';

// Use proxy in dev, direct in prod
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://api.adzuna.com';
const ADZUNA_API_URL = `${BASE_URL}/v1/api/jobs/es/search/1`;

const normalizeLocation = (loc) => {
    if (!loc) return 'España';
    const l = loc.toLowerCase();
    // Si ya contiene España o es remoto, no tocamos
    if (l.includes('españa') || l.includes('spain') || l.includes('remote') || l.includes('remoto')) {
        return loc;
    }
    // Para cualquier otra ciudad, aseguramos que busque en España
    return `${loc}, España`;
};

export const fetchJobs = async (searchParams = {}) => {
    try {
        const { query, location, limit = 50 } = searchParams;
        const normalizedLocation = normalizeLocation(location);

        // Fetch Adzuna Jobs
        const adzunaPromise = (async () => {
            let url = `${ADZUNA_API_URL}`;
            const queryParams = new URLSearchParams();

            queryParams.append('app_id', ADZUNA_APP_ID);
            queryParams.append('app_key', ADZUNA_APP_KEY);
            queryParams.append('results_per_page', limit);

            if (query) {
                queryParams.append('what', query);
            }

            if (normalizedLocation) {
                queryParams.append('where', normalizedLocation);
            }

            // Add sorting by date
            queryParams.append('sort_by', 'date');

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Adzuna API Error: ${response.status}`);

            const data = await response.json();
            if (!data || !data.results) return [];

            return data.results.map(job => ({
                id: String(job.id),
                title: job.title.replace(/<\/?[^>]+(>|$)/g, ""),
                company: job.company?.display_name || 'Empresa Confidencial',
                location: job.location?.display_name || 'Ubicación no especificada',
                salary: formatSalary(job.salary_min, job.salary_max),
                postedAt: new Date(job.created).toLocaleDateString(),
                tags: [job.category?.label].filter(Boolean) || [],
                url: job.redirect_url,
                logo: null,
                jobType: job.contract_time ? (job.contract_time === 'full_time' ? 'Tiempo Completo' : 'Medio Tiempo') : 'No especificado',
                description: job.description.replace(/<\/?[^>]+(>|$)/g, ""),
                source: 'Adzuna' // Badge source
            }));
        })();

        // Fetch External Scraped Jobs (LinkedIn, Indeed, InfoJobs, Tecnoempleo)
        const scrapingLocation = normalizedLocation;
        const externalPromise = fetchExternalJobs(scrapingLocation, query || 'empleo');

        // Wait for all
        const [adzunaResults, externalResults] = await Promise.allSettled([adzunaPromise, externalPromise]);

        console.log("🌐 [Service] Fetch Results:",
            { adzuna: adzunaResults.status, external: externalResults.status });

        const adzunaJobs = adzunaResults.status === 'fulfilled' ? adzunaResults.value : [];
        const externalJobs = externalResults.status === 'fulfilled' ? externalResults.value || [] : []; // Handle undefined if scraper fails/resolves poorly

        console.log(`✅ [Service] Jobs received: Adzuna(${adzunaJobs.length}) Scraper(${externalJobs.length})`);

        // Combine and Deduplicate
        const allJobs = [...externalJobs, ...adzunaJobs];

        // Deduplication: title + company + source (same job from different sources is kept per-source)
        const uniqueJobs = [];
        const seen = new Set();

        for (const job of allJobs) {
            const signature = `${(job.source || '').toLowerCase()}-${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
            if (!seen.has(signature)) {
                seen.add(signature);
                uniqueJobs.push(job);
            }
        }

        return {
            jobs: uniqueJobs,
            meta: {
                adzuna: adzunaJobs.length,
                external: externalJobs.length,
                sources: {
                    linkedin: externalJobs.filter(j => j.source === 'LinkedIn').length,
                    indeed: externalJobs.filter(j => j.source === 'Indeed').length,
                    infojobs: externalJobs.filter(j => j.source === 'InfoJobs').length,
                    tecnoempleo: externalJobs.filter(j => j.source === 'Tecnoempleo').length,
                    jobatus: externalJobs.filter(j => j.source === 'Jobatus').length,
                    adzuna: adzunaJobs.length
                }
            }
        };

    } catch (error) {
        console.error("Error fetching jobs:", error);
        throw error;
    }
};

const formatSalary = (min, max) => {
    if (!min && !max) return 'No especificado';
    if (min && max && min === max) return `${Math.round(min)}€`;
    if (min && max) return `${Math.round(min)}€ - ${Math.round(max)}€`;
    if (min) return `Desde ${Math.round(min)}€`;
    if (max) return `Hasta ${Math.round(max)}€`;
    return 'No especificado';
};
