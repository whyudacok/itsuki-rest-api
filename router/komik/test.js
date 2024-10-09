// router/komik.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/scrape', async (req, res) => {
    try {
        const response = await axios.get('https://komikcast.cz/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://komikcast.cz/',
            },
            timeout: 10000,
        });

        const data = response.data;

        // Parsing data menggunakan regex
        const regex = /<a class="series" href="([^"]+)">.*?<h3>(.*?)<\/h3>/g;
        let matches;
        const results = [];

        while ((matches = regex.exec(data)) !== null) {
            results.push({
                link: matches[1],
                title: matches[2],
            });
        }

        res.status(200).json({ message: "Data scraped successfully", results });
    } catch (error) {
        console.error("Error scraping data", error.message);
        if (error.response) {
            res.status(error.response.status).json({ message: "Error scraping data", error: error.response.data });
        } else {
            res.status(500).json({ message: "Error scraping data", error: error.message });
        }
    }
});

export default router;
