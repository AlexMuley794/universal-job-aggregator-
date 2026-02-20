
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';

puppeteer.use(StealthPlugin());

const testScraper = async (name, url, cardSelector, titleSelector, companySelector) => {
    console.log(`\n--- Testing ${name} ---`);
    console.log(`URL: ${url}`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
    await page.setUserAgent(userAgent);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for potential cookie banner
        await new Promise(r => setTimeout(r, 2000));

        const count = await page.evaluate((sel) => {
            return document.querySelectorAll(sel).length;
        }, cardSelector);

        console.log(`Found ${count} cards with selector: ${cardSelector}`);

        if (count > 0) {
            const data = await page.evaluate((cSel, tSel, coSel) => {
                const card = document.querySelector(cSel);
                return {
                    title: card.querySelector(tSel)?.innerText.trim(),
                    company: card.querySelector(coSel)?.innerText.trim(),
                    link: (card.querySelector(tSel) || card.querySelector('a'))?.href
                };
            }, cardSelector, titleSelector, companySelector);
            console.log('Sample Data:', data);
        } else {
            console.log("No elements found. Taking screenshot...");
            await page.screenshot({ path: `test_${name.toLowerCase()}.png` });
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
    } finally {
        await browser.close();
    }
};

const runTests = async () => {
    // InfoJobs
    await testScraper('InfoJobs',
        'https://www.infojobs.net/jobsearch/search-results/list.xhtml?keywords=developer&province=madrid',
        '.sui-AtomCard',
        '.ij-OfferCardContent-description-title-link',
        '.ij-OfferCardContent-description-subtitle-link'
    );

    // Jobatus
    await testScraper('Jobatus',
        'https://www.jobatus.es/trabajo?q=developer&l=madrid',
        '.result',
        'p.jobtitle a.out',
        'a[href*="/empresas/"]'
    );

    // Tecnoempleo
    await testScraper('Tecnoempleo',
        'https://www.tecnoempleo.com/ofertas-trabajo/?te=developer&lo=madrid',
        'div.p-3.border.rounded.mb-3.bg-white',
        'h3 a.font-weight-bold',
        'a.text-primary.link-muted'
    );

    // Indeed
    await testScraper('Indeed',
        'https://es.indeed.com/jobs?q=developer&l=madrid',
        '.job_seen_beacon',
        'h2.jobTitle span',
        '[data-testid="company-name"]'
    );

    // Infoempleo
    await testScraper('Infoempleo',
        'https://www.infoempleo.com/ofertas-trabajo/?q=developer&l=madrid',
        'li.offerblock',
        'h2.title a',
        '.logoplusname span.extra-data'
    );

    // Computrabajo
    await testScraper('Computrabajo',
        'https://www.computrabajo.es/ofertas-de-trabajo/?q=developer&l=madrid',
        'article.box_offer',
        'h2 a',
        'p.fs16 a'
    );
};

runTests();
