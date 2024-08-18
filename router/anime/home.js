const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { aniUrl } = require('../base-url'); // Anggap aniUrl adalah 'https://tv.animisme.net/'

// Inisialisasi cache dengan TTL 30 menit (1800 detik)
const cache = new NodeCache({ stdTTL: 1800 });

router.get('/', async (req, res) => {
    const url = aniUrl; // Gunakan aniUrl sebagai URL dasar

    // Cek cache terlebih dahulu
    const cacheKey = 'anime_list';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        console.log('Cache hit');
        return res.json(cachedData);
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const results = [];
        
        $('div.bsx').each((index, element) => {
            const article = $(element).closest('article.bs');
            let link = $(element).find('a').attr('href');
            const jenis = $(element).find('div.typez').text().trim();
            const judul = $(element).find('div.tt').text().trim();
            let gambar = $(element).find('img').attr('src');

            // Replace the domain in the image URL
            if (gambar) {
                gambar = gambar.replace('tv.animisme.net/wp-content/uploads', 'animasu.cc/wp-content/uploads');
            }

            // Remove the domain part (https://tv.animisme.net/)
            link = link.replace(aniUrl, '');

            // Extract episode number from the link
            const episodeMatch = link.match(/episode-(\d+)/);
            let episode = null;
            if (episodeMatch) {
                episode = parseInt(episodeMatch[1], 10);
            }

            results.push({
                link,
                jenis,
                judul,
                gambar,
                episode // Add episode info to the response
            });
        });

        const data = { status: true, results };

        // Simpan data ke cache
        cache.set(cacheKey, data);

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil data' });
    }
});

module.exports = router;
