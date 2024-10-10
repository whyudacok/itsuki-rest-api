// routes/scrape.js
const express = require('express');
const router = express.Router();
const AxiosService = require('../services/AxiosService'); // Mengimpor AxiosService
const cheerio = require('cheerio');

// Daftar User-Agent yang berbeda
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 10; SM-G950F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
];

function getRandomUserAgent() {
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
}

router.get('/', async (req, res) => {
    try {
        // Menentukan URL dengan User-Agent acak
        const url = 'https://komikcast.cz/';
        const response = await AxiosService(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'id-ID',
                'Connection': 'keep-alive',
                'Cookie': 'HstCfa3653987=1728482130498; HstCla3653987=1728483531039; HstCmu3653987=1728482130498; HstPn3653987=7; HstPt3653987=7; HstCnv3653987=1; HstCns3653987=2; cf_clearance=c376823lu309ta1mlXUlzti1jItFWxl.VUiETrhP_8c-1728483488-1.2.1.1-Kgrxjzgv0C6udJn1pMFSRJZYvcpPShGWpG1AjLnJUAR1LgRY0Ckt8Qf_C_hZCqD6zwBJr85v6BlukeZtycmdaN9PTQw3iSTs1JYt4FkYzRdfQTIEVLYB39fDEMejaMmobNH.sL8FDhoFJ.1irh1hnYIwBGcitRhKWdG8V.gaxW78HYpr6k4HdYDpDIK98RZS1xeUiXUYowLy1JBsDL8a4N2j7cXHSbh0yHnjgju6Q5OEruvYIi2mzZuVWEpo_p2LJdFy5wdL1sajO4zGGQsZKFg2..nN5IuQ.fstvyT3HjIkyUCkSprtNQtw3GFB7C8yITlyXUgm9Qvtafqw3AVR2g; __dtsu=1040172848214008A3F82F4E356C3D41; _ga_86TH8K4Q71=GS1.1.1728482196.1.1.1728483552.0.0.0; _ga=GA1.1.659751055.1728482196; _gid=GA1.2.1906467717.1728482197; _gat_gtag_UA_111351430_1=1',
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const results = [];

        $('.utao').each((index, element) => {
            const title = $(element).find('h3').text().trim();
            const image = $(element).find('img').attr('data-src');
            const link = $(element).find('a.series').attr('href');
            const chapters = [];

            $(element).find('.Manhwa li').each((i, el) => {
                const chapterTitle = $(el).find('a').text().trim();
                const chapterLink = $(el).find('a').attr('href');
                const timestamp = $(el).find('span i').text().trim();

                chapters.push({ chapterTitle, chapterLink, timestamp });
            });

            results.push({ title, image, link, chapters });
        });

        res.json(results);
    } catch (error) {
        console.error("Error scraping data:", error);
        res.status(500).json({ message: "Error scraping data", error: error.message });
    }
});

module.exports = router;
