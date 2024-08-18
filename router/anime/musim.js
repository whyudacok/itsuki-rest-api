const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { aniUrl } = require('../base-url');

// Inisialisasi cache dengan TTL 10 menit (600 detik)
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:tahun', async (req, res) => {
  const { tahun } = req.params;
  const url = `${aniUrl}/musim/${tahun}/`;

  console.log('Mengambil URL:', url);

  // Cek cache terlebih dahulu
  const cacheKey = `musim_${tahun}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Cache hit');
    return res.json({
      status: true,
      data: cachedData
    });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    console.log('Respon diterima');

    const html = response.data;
    const $ = cheerio.load(html);
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    // Cek apakah halaman dimuat dengan benar
    if (!$('.newseason').length) {
      throw new Error('Struktur halaman telah berubah');
    }

    const musim = $('.newseason h1').text().trim();
    const daftarSeries = [];

    $('.card').each((_, ele) => {
      const link = $(ele).find('.card-box a').attr('href') || '';
      const gambar = $(ele).find('.card-thumb img').attr('src') || '';
      const judul = $(ele).find('.card-title h2').text().trim() || '';
      const studio = $(ele).find('.card-title .studio').text().trim() || '';
      const episode = $(ele).find('.left span').first().text().trim() || '';
      const status = $(ele).find('.left .status').text().trim() || '';
      const alternatif = $(ele).find('.left .alternative').text().trim() || '';
      const rating = $(ele).find('.right.blue span').text().trim() || '';
      const deskripsi = $(ele).find('.desc p').text().trim() || '';
      const tagList = [];

      $(ele).find('.card-info-bottom a').each((_, tagElement) => {
        const tagLink = $(tagElement).attr('href');
        const tagText = $(tagElement).text().trim();
        tagList.push({ link: tagLink, tag: tagText });
      });

      daftarSeries.push({
        link,
        gambar,
        judul,
        studio,
        episode,
        status,
        alternatif,
        rating,
        deskripsi,
        tags: tagList
      });
    });

    console.log('Data berhasil diparsing');

    const data = { musim, daftarSeries };

    // Simpan data ke cache
    cache.set(cacheKey, data);

    res.json({
      status: true,
      data
    });
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
    res.json({
      status: false,
      pesan: 'Terjadi kesalahan saat mengambil data.'
    });
  }
});

module.exports = router;
