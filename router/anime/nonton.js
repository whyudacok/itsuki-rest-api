const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${aniUrl}/${encodedEndpoint}/`;

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
    const vidutama = $('.video-content #embed_holder #pembed iframe').attr('src');
    const video = $('select.mirror option').map((_, element) => {
      const value = $(element).attr('value');
      const decodedValue = value ? Buffer.from(value, 'base64').toString('utf-8') : '';
      const iframeSrc = cheerio.load(decodedValue)('iframe').attr('src');
      const server = $(element).text().trim();
      return iframeSrc ? { server, src: iframeSrc } : null;
    }).get();

    // Extract episode list
    const episodes = $('.episodelist ul li a').map((_, el) => {
      const link = $(el).attr('href') || '';
      const gambar = $(el).find('img').attr('src') || '';
      const judul = $(el).find('.playinfo h3').text().trim() || '';
      let eps = $(el).find('.playinfo span').text().trim() || '';
      eps = eps.includes('-') ? eps.split('-')[0].trim() : eps;
      return { link, gambar, judul, eps };
    }).get();

    // Extract additional details
    const data = {
      vidutama,
      video,
      episodes,
      judul: $('h1.entry-title').text().trim(),
      episodeNumber: $('meta[itemprop="episodeNumber"]').attr('content'),
      episodeExt: $('span.epx').text().trim(),
      updateDate: $('span.updated').text().trim(),
      allLink: $('span.year a').attr('href'),
      allJudul: $('span.year a').text().trim(),
      previous: $('div.naveps.bignav a[aria-label="prev"]').attr('href'),
      prevText: $('div.naveps.bignav a[aria-label="prev"] span.tex').text().trim(),
      allEpisode: $('div.naveps.bignav div.nvs.nvsc a').attr('href'),
      allEpText: $('div.naveps.bignav div.nvs.nvsc a span.tex').text().trim(),
      next: $('div.naveps.bignav a[aria-label="next"]').attr('href'),
      nextText: $('div.naveps.bignav a[aria-label="next"] span.tex').text().trim(),
      download: $('div.releases h3').text().trim(),
      servers: $('div.soraurlx').map((_, el) => {
        const server = $(el).find('strong').text().trim();
        const links = $(el).find('a').map((_, a) => ({
          url: $(a).attr('href'),
          text: $(a).text().trim()
        })).get();
        return { server, links };
      }).get(),
      gambar: $('div.thumb img').attr('src'),
      judul: $('h2[itemprop="partOfSeries"]').text().trim(),
      altJudul: $('span.alter').text().trim(),
      rating: $('div.rating strong').text().trim(),
      detail: $('div.spe span').map((_, el) => {
        const label = $(el).find('b').text().replace(':', '').trim();
        const value = $(el).find('a').length ? {
          text: $(el).find('a').text().trim(),
          link: $(el).find('a').attr('href')
        } : $(el).text().replace(label, '').trim();
        return { [label]: value };
      }).get().reduce((acc, cur) => ({ ...acc, ...cur }), {}),
      genres: $('div.genxed a').map((_, el) => ({
        genre: $(el).text().trim(),
        link: $(el).attr('href')
      })).get(),
      description: $('div.desc.mindes').text().trim()
    };

    res.json({ status: true, data });
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).json({ status: false, message: 'terjadi kesalahan saat mengambil data.' });
  }
});

module.exports = router;
