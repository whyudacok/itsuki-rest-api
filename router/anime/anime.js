const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

// Fungsi untuk mengekstrak ID YouTube dari URL
const extractYouTubeID = (url) => {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] || match[2] : null;
};

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${aniUrl}/anime/${encodedEndpoint}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Update all hrefs that start with aniUrl
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });
    // Ambil semua elemen <img>
$('img').each((_, el) => {
    // Ambil src dari gambar
    let src = $(el).attr('src') || '';

    // Ganti bagian dari src yang sesuai
    if (src.includes('tv.animisme.net/wp-content/uploads')) {
        src = src.replace('tv.animisme.net/wp-content/uploads', 'animasu.cc/wp-content/uploads');
        $(el).attr('src', src);
    }
});


    const trailerUrl = $('a[data-fancybox]').attr('href');
    const trailerID = trailerUrl ? extractYouTubeID(trailerUrl) : null;

    const data = {
      status: true,
      data: {
        rating: $('meta[itemprop="ratingValue"]').attr('content') || '',
        trailer: trailerID,
        title: $('h1.entry-title[itemprop="name"]').text().trim() || '',
        images: $('div.thumb img').attr('src') || '',
        info: {},
        genre: [],
        sinopsis: $('div.entry-content[itemprop="description"] p').text().trim() || '',
        eplister: [],
        lastEpisode: {
          link: $('div.inepcx a').eq(1).attr('href') || '',
          title: $('div.inepcx span.epcurlast').text().trim() || ''
        },
        downloads: [],
        recommendations: []
      }
    };

    // Menyaring informasi tambahan
    $('div.info-content span').each((_, element) => {
      const keyElement = $(element).find('b');
      let key = keyElement.text().replace(':', '').trim();
      keyElement.remove();
      let value = $(element).text().trim();

      const href = $(element).find('a').attr('href');

      if (key) {
        data.data.info[key] = value;
        if (href) {
          data.data.info[`${key}_link`] = href;
        }
      }
    });

    // Menyaring genre
    $('div.genxed a[rel="tag"]').each((_, element) => {
      data.data.genre.push({
        link: $(element).attr('href') || '',
        name: $(element).text().trim() || ''
      });
    });

    // Menyaring daftar episode
    $('div.eplister ul li').each((_, element) => {
      data.data.eplister.push({
        link: $(element).find('a').attr('href') || '',
        title: $(element).find('div.epl-title').text().trim() || '',
        epnum: $(element).find('div.epl-num').text().trim() || '',
        date: $(element).find('div.epl-date').text().trim() || ''
      });
    });

    // Menyaring link download
    $('div.soraurlx').each((_, element) => {
      const resolution = $(element).find('strong').text().trim();
      const links = $(element).find('a').map((_, el) => ({
        link: $(el).attr('href') || '',
        title: $(el).text().trim() || ''
      })).get();

      data.data.downloads.push({ server: resolution, links });
    });

    // Menyaring rekomendasi
    $('div.listupd article').each((_, element) => {
      data.data.recommendations.push({
        link: $(element).find('a').attr('href') || '',
        type: $(element).find('div.typez').text().trim() || '',
        epx: $(element).find('div.bt span.epx').text().trim() || '',
        img: $(element).find('img').attr('src') || '',
        title: $(element).find('h2[itemprop="headline"]').text().trim() || ''
      });
    });

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      data: {},
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
});

module.exports = router;
