/**
 * Advanced Web Scraping Service
 * Connects to backend Puppeteer server for real-time scraping
 * of LinkedIn and Indeed job postings
 */

const SCRAPER_API_URL = import.meta.env.VITE_SCRAPER_URL
    ? `${import.meta.env.VITE_SCRAPER_URL}/api/scrape`
    : 'http://localhost:3001/api/scrape';

/**
 * Fetch external jobs from LinkedIn and Indeed via backend scraper
 * @param {string} location - City or location to search
 * @param {string} query - Job search query (default: 'developer')
 * @returns {Promise<Array>} Array of job objects
 */
export const fetchExternalJobs = async (location, query = 'developer') => {
    if (!location) return [];

    console.log(`🔍 Fetching external jobs for: "${query}" in "${location}"`);

    try {
        const url = `${SCRAPER_API_URL}?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Timeout after 45 seconds
            signal: AbortSignal.timeout(45000),
        });

        if (!response.ok) {
            throw new Error(`Scraper API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.jobs)) {
            console.log(`✅ Successfully scraped ${data.jobs.length} jobs from Multiple Sources (LinkedIn, Indeed, InfoJobs, Tecnoempleo)`);
            return data.jobs;
        }

        console.warn('⚠️ Scraper returned no jobs');
        return [];

    } catch (error) {
        // Check if it's a timeout error
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            console.error('⏱️ Scraping timeout - server took too long to respond');
        } else if (error.message.includes('Failed to fetch')) {
            console.error('🔌 Cannot connect to scraper server. Make sure it\'s running on port 3001');
            console.error('   Run: cd server && npm install && npm start');
        } else {
            console.error('❌ External scraping failed:', error.message);
        }

        // Return empty array on error - don't break the app
        return [];
    }
};

/**
 * Check if scraper server is running
 * @returns {Promise<boolean>}
 */
export const checkScraperHealth = async () => {
    const base = import.meta.env.VITE_SCRAPER_URL || 'http://localhost:3001';
    try {
        const response = await fetch(`${base}/health`, {
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
};
