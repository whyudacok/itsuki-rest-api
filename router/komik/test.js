const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Fungsi buat scraping
async function scrapeAnime(url) {
    try {
        // Request halaman
        const { data } = await axios.get(url);
        
        // Load data ke cheerio buat parsing
        const $ = cheerio.load(data);
        
        // Seleksi element article dengan class animeseries
        const animeSeries = $('.animeseries.post-137245');
        
        // Array buat nyimpen hasil scraping
        const results = [];

        animeSeries.each((i, element) => {
            const title = $(element).find('h3.title span').text().trim();
            const episode = $(element).find('.types.episodes').text().trim();
            const link = $(element).find('a').attr('href');
            const image = $(element).find('img').attr('src');
            
            // Tambahkan hasil ke array results
            results.push({
                status: true,
                title: title,
                episode: episode,
                link: link,
                image: image,
            });
        });

        // Cek apakah ada hasil yang di-scrape
        if (results.length > 0) {
            return { status: true, data: results };
        } else {
            return { status: false, message: "No data found" };
        }
    } catch (error) {
        return { status: false, message: error.message };
    }
}

// Routing untuk /cihuyy
app.get('/cihuyy', async (req, res) => {
    const url = 'https://nontonanimeid.autos/';
    const result = await scrapeAnime(url);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
