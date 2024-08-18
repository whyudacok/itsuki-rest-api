const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { aniUrl } = require('../base-url');

// Inisialisasi cache dengan TTL 10 menit
const cache = new NodeCache({ stdTTL: 600 });

// Fungsi untuk mengekstrak ID YouTube dari URL
const extractYouTubeID = (url) => {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] || match[2] : null;
};

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${aniUrl}/anime/${encodedEndpoint}/`;

  // Key untuk cache berdasarkan endpoint
  const cacheKey = `anime_${endpoint}`;

  // Cek apakah data sudah ada di cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
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

    // Update semua href yang diawali dengan aniUrl
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    const trailerUrl = $('a[data-fancybox]').attr('href');
    const trailerID = trailerUrl ? extractYouTubeID(trailerUrl) : null;

    const data = {
      status: true,
      rating: $('meta[itemprop="ratingValue"]').attr('content'),
      trailer: trailerID,
      title: $('h1.entry-title[itemprop="name"]').text().trim(),
      images: $('div.thumb img').attr('src'),
      info: {},
      genre: [],
      sinopsis: $('div.entry-content[itemprop="description"] p').text().trim(),
      eplister: [],
      lastEpisode: {
        link: $('div.inepcx a').eq(1).attr('href'),
        title: $('div.inepcx span.epcurlast').text().trim()
      },
      downloads: [],
      recommendations: []
    };

    // Menyaring informasi tambahan
    $('div.info-content span').each((_, element) => {
      const keyElement = $(element).find('b');
      let key = keyElement.text().replace(':', '').trim();
      keyElement.remove();
      let value = $(element).text().trim();

      const href = $(element).find('a').attr('href');

      if (key) {
        data.info[key] = value;
        if (href) {
          data.info[`${key}_link`] = href;
        }
      }
    });

    // Menyaring genre
    $('div.genxed a[rel="tag"]').each((_, element) => {
      const genre = {
        link: $(element).attr('href'),
        name: $(element).text().trim()
      };
      data.genre.push(genre);
    });

    // Menyaring daftar episode
    $('div.eplister ul li').each((_, element) => {
      const epData = {
        link: $(element).find('a').attr('href'),
        title: $(element).find('div.epl-title').text().trim(),
        epnum: $(element).find('div.epl-num').text().trim(),
        date: $(element).find('div.epl-date').text().trim()
      };
      data.eplister.push(epData);
    });

    // Menyaring link download
    $('div.soraurlx').each((_, element) => {
      const resolution = $(element).find('strong').text().trim();
      const links = [];

      $(element).find('a').each((_, el) => {
        links.push({
          link: $(el).attr('href'),
          title: $(el).text().trim()
        });
      });

      data.downloads.push({ server: resolution, links });
    });

    // Menyaring rekomendasi
    $('div.listupd article').each((_, element) => {
      const recommendation = {
        link: $(element).find('a').attr('href'),
        type: $(element).find('div.typez').text().trim(),
        epx: $(element).find('div.bt span.epx').text().trim(),
        img: $(element).find('img').attr('src'),
        title: $(element).find('h2[itemprop="headline"]').text().trim()
      };
      data.recommendations.push(recommendation);
    });

    // Simpan data ke cache sebelum merespons ke client
    cache.set(cacheKey, data);

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
});

module.exports = router;
