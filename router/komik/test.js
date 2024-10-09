// routes/scrape.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Route untuk scraping
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://komikcast.cz/');
        const html = response.data;
        const $ = cheerio.load(html);
        const komiks = [];

        $('.utao').each((index, element) => {
            const title = $(element).find('h3').text();
            const imgSrc = $(element).find('.imgu img').attr('data-src');
            const link = $(element).find('.luf a.series').attr('href');

            // Mendapatkan chapter terbaru
            const latestChapter = $(element).find('.Manhwa li').first();
            const chapterLink = latestChapter.find('a').attr('href');
            const chapterText = latestChapter.find('a').text();
            const chapterTime = latestChapter.find('span i').text();

            komiks.push({
                title,
                imgSrc,
                link,
                latestChapter: {
                    text: chapterText,
                    link: chapterLink,
                    time: chapterTime
                }
            });
        });

        res.json(komiks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while scraping');
    }
});

module.exports = router;
