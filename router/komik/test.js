// routes/scrape.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://komikcast.cz/', {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'id-ID',
                'Connection': 'keep-alive',
                'Host': 'komikcast.cz',
                'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0',
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
