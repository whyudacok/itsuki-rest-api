const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { baseUrl } = require('../base-url');

// Buat instance cache baru dengan TTL 10 menit (600 detik)
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:page', async (req, res) => {
  const { page } = req.params;
  const url = `${baseUrl}/komik-terbaru/page/${page}/`;

  // Cek apakah data ada di cache
  const cachedData = cache.get(url);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'Origin': baseUrl,
        'Referer': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Update semua href yang diawali dengan baseUrl
    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

    const updateKomik = [];
    $('.post-item-box').each((_, el) => {
      const link = $(el).find('a').attr('href');
      const jenis = $(el).find('.flag-country-type').attr('class').split(' ').pop();
      const gambar = $(el).find('.post-item-thumb img').attr('src');
      const Title = $(el).find('.post-item-title h4').text().trim();
      const chapterLink = $(el).find('.lsch a').attr('href');
      const chapterJudul = $(el).find('.lsch a').text().trim();
      const chapterTanggal = $(el).find('.datech').text().trim();
      const warna = $(el).find('.color-label-manga').text().trim();

      updateKomik.push({
        link,
        jenis,
        gambar,
        Title,
        warna,
        chapter: {
          link: chapterLink,
          Title: chapterJudul,
          Date: chapterTanggal
        }
      });
    });

    const komikPopuler = [];
    $('.list-series-manga.pop li').each((_, el) => {
      const populerLink = $(el).find('.thumbnail-series a.series').attr('href');
      const populerGambar = $(el).find('.thumbnail-series img').attr('src');
      const peringkat = $(el).find('.ctr').text().trim();
      const populerJudul = $(el).find('h4 a.series').text().trim();
      const rating = $(el).find('.loveviews').text().trim();

      komikPopuler.push({
        link: populerLink,
        gambar: populerGambar,
        peringkat,
        Title: populerJudul,
        rating
      });
    });

    const Totalpages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

    const data = {
      status: true,
      updateKomik,
      Totalpages,
      komikPopuler
    };

    // Simpan data ke cache
    cache.set(url, data);

    // Kirim respons JSON ke client
    res.json(data);
  } catch (error) {
    res.status(500).send('Terjadi kesalahan saat mengambil data.');
  }
});

module.exports = router;
