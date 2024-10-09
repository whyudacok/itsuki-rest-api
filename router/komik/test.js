// routes/scrape.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Route untuk scraping
router.get('/', async (req, res) => {
    const url = 'https://komikcast.cz/';
    
    try {
        // Mengatur header untuk menghindari 403 Forbidden
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://komikcast.cz/', // URL referer yang valid
            }
        });

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
        if (error.response) {
            res.status(error.response.status).send('Error occurred while scraping');
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

module.exports = router;
