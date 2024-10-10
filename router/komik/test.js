// routes/scrape.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
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
        const response = await axios.get('https://komikcast.cz/', {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'id-ID',
                'Connection': 'keep-alive',
                'Host': 'komikcast.cz',
                'User-Agent': getRandomUserAgent(),
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
