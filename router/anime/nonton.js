const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { aniUrl } = require('../base-url');

// Inisialisasi cache dengan TTL 10 menit (600 detik)
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${aniUrl}/${encodedEndpoint}/`;

  // Cek cache terlebih dahulu
  const cacheKey = `anime_${encodedEndpoint}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json({ status: true, data: cachedData });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Normalize href links
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    // Extract iframe src and mirror options
    const iframeSrc = $('.video-content #embed_holder #pembed iframe').attr('src');
    const iframes = [];
    $('select.mirror option').each((index, element) => {
      const option = $(element);
      const decodedOptionValue = option.attr('value') ? Buffer.from(option.attr('value'), 'base64').toString('utf-8') : null;
      if (!decodedOptionValue) return;

      const iframe = cheerio.load(decodedOptionValue)('iframe');
      const src = iframe.attr('src');
      const label = option.text().trim() || null;
      if (!src) return;

      iframes.push({
        label: label,
        src: src,
      });
    });

    // Extract episode list
    const episodes = [];
    $('.episodelist ul li a').each((_, el) => {
      const href = $(el).attr('href');
      const imgSrc = $(el).find('img').attr('src');
      const title = $(el).find('.playinfo h3').text().trim();
      let eps = $(el).find('.playinfo span').text().trim();

      // Memotong teks setelah tanda -
      if (eps.includes('-')) {
        eps = eps.split('-')[0].trim();
      }

      episodes.push({ href, imgSrc, title, eps });
    });

    // Additional details
    const title = $('h1.entry-title').text().trim();
    const episodeNumber = $('meta[itemprop="episodeNumber"]').attr('content');
    const episodeExt = $('span.epx').text().trim();
    const updateDate = $('span.updated').text().trim();
    const allLink = $('span.year a').attr('href');
    const allTitle = $('span.year a').text().trim();
    const previous = $('div.naveps.bignav a[aria-label="prev"]').attr('href');
    const prevText = $('div.naveps.bignav a[aria-label="prev"] span.tex').text().trim();
    const allEpisodes = $('div.naveps.bignav div.nvs.nvsc a').attr('href');
    const allEpText = $('div.naveps.bignav div.nvs.nvsc a span.tex').text().trim();
    const next = $('div.naveps.bignav a[aria-label="next"]').attr('href');
    const nextText = $('div.naveps.bignav a[aria-label="next"] span.tex').text().trim();
    const download = $('div.releases h3').text().trim();
    const servers = [];
    $('div.soraurlx').each((index, element) => {
      const server = $(element).find('strong').text().trim();
      const links = [];
      $(element).find('a').each((_, a) => {
        const url = $(a).attr('href');
        const text = $(a).text().trim();
        links.push({ url, text });
      });

      servers.push({ server, links });
    });

    const imageAnime = $('div.thumb img').attr('src');
    const animeTitle = $('h2[itemprop="partOfSeries"]').text().trim();
    const alternateTitle = $('span.alter').text().trim();
    const rating = $('div.rating strong').text().trim();
    const details = {};
    $('div.spe span').each((index, element) => {
      const label = $(element).find('b').text().replace(':', '').trim();
      const value = $(element).find('a').length ? {
        text: $(element).find('a').text().trim(),
        link: $(element).find('a').attr('href')
      } : $(element).text().replace(label, '').trim();
      details[label] = value;
    });
    const genres = [];
    $('div.genxed a').each((index, element) => {
      const genre = $(element).text().trim();
      const genreLink = $(element).attr('href');
      genres.push({
        genre,
        link: genreLink
      });
    });
    const description = $('div.desc.mindes').text().trim();

    const data = {
      iframeSrc,
      iframes,
      episodes,
      title,
      episodeNumber,
      episodeExt,
      updateDate,
      allLink,
      allTitle,
      previous,
      prevText,
      allEpisodes,
      allEpText,
      next,
      nextText,
      download,
      servers,
      imageAnime,
      animeTitle,
      alternateTitle,
      rating,
      details,
      genres,
      description
    };

    // Simpan data ke cache
    cache.set(cacheKey, data);

    res.json({ status: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil data.' });
  }
});

module.exports = router;
