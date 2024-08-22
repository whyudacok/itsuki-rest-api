const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl, baseUrl, film } = require('../base-url');

router.get('/:page', async (req, res) => {
    const { page } = req.params;
    let results = {
        anime: [],
        komik: {
            Totalpages: 0,
            latestkomik: [],
            komikPopuler: []
        },
        film: {
            results: [],
            totalPages: 0
        }
    };

    try {
        // Scrape Anime
        const animeUrl = aniUrl;
        const animeResponse = await axios.get(animeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const animeHtml = animeResponse.data;
        const $anime = cheerio.load(animeHtml);

        $anime('div.bsx').each((_, element) => {
            const article = $anime(element).closest('article.bs');
            let link = $anime(element).find('a').attr('href') || '';
            const jenis = $anime(element).find('div.typez').text().trim() || '';
            const judul = $anime(element).find('div.tt').text().trim() || '';
            let gambar = $anime(element).find('img').attr('src') || '';

            if (gambar) {
                gambar = gambar.replace('tv.animisme.net/wp-content/uploads', 'animasu.cc/wp-content/uploads');
            }

            link = link.replace(aniUrl, '');
            const episodeMatch = link.match(/episode-(\d+)/);
            const episode = episodeMatch ? episodeMatch[1] : '';

            results.anime.push({
                link,
                jenis,
                judul,
                gambar,
                episode
            });
        });

        // Scrape Komik
        const komikUrl = `${baseUrl}/komik-terbaru/page/${page}/`;
        const komikResponse = await axios.get(komikUrl, {
            headers: {
                'Origin': baseUrl,
                'Referer': baseUrl,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0'
            }
        });

        const komikHtml = komikResponse.data;
        const $komik = cheerio.load(komikHtml);

        $komik(`a[href^="${baseUrl}"]`).each((_, el) => {
            const href = $komik(el).attr('href');
            $komik(el).attr('href', href.replace(baseUrl, ''));
        });

        $komik('.post-item-box').each((_, el) => {
            results.komik.latestkomik.push({
                link: $komik(el).find('a').attr('href'),
                type: $komik(el).find('.flag-country-type').attr('class').split(' ').pop(),
                gambar: $komik(el).find('.post-item-thumb img').attr('src'),
                Title: $komik(el).find('.post-item-title h4').text().trim(),
                warna: $komik(el).find('.color-label-manga').text().trim(),
                chapter: {
                    link: $komik(el).find('.lsch a').attr('href'),
                    Title: $komik(el).find('.lsch a').text().trim(),
                    Date: $komik(el).find('.datech').text().trim()
                }
            });
        });

        $komik('.list-series-manga.pop li').each((_, el) => {
            results.komik.komikPopuler.push({
                link: $komik(el).find('.thumbnail-series a.series').attr('href'),
                gambar: $komik(el).find('.thumbnail-series img').attr('src'),
                peringkat: $komik(el).find('.ctr').text().trim(),
                Title: $komik(el).find('h4 a.series').text().trim(),
                rating: $komik(el).find('.loveviews').text().trim()
            });
        });

        results.komik.Totalpages = parseInt($komik('.pagination a.page-numbers').eq(-2).text().trim());

        // Scrape Film
        const filmUrl = `${film}/page/${page}/`;
        const filmResponse = await axios.get(filmUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const filmHtml = filmResponse.data;
        const $film = cheerio.load(filmHtml);
        $film(`a[href^="${film}"]`).each((_, el) => {
            const href = $film(el).attr('href');
            $film(el).attr('href', href.replace(film, ''));
        });

        $film('#gmr-main-load .item').each((_, el) => {
            results.film.results.push({
                title: $film(el).find('.entry-title a').text().trim(),
                link: $film(el).find('.entry-title a').attr('href'),
                gambar: $film(el).find('.content-thumbnail img').attr('src'),
                rating: $film(el).find('.gmr-rating-item').text().trim(),
                durasi: $film(el).find('.gmr-duration-item').text().trim(),
                quality: $film(el).find('.gmr-quality-item a').text().trim()
            });
        });

        results.film.totalPages = $film('.pagination .page-numbers').map((_, el) => parseInt($film(el).text().trim())).get();
        results.film.totalPages = results.film.totalPages.length ? Math.max(...results.film.totalPages) : 1;

        res.json({
            status: true,
            data: results
        });
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan saat mengambil data.'
        });
    }
});

module.exports = router;
