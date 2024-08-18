const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { baseUrl } = require('../base-url');

// Inisialisasi cache dengan TTL 10 menit
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${baseUrl}/komik/${encodedEndpoint}/`;

  // Cek cache terlebih dahulu
  const cachedData = cache.get(url);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'Origin': baseUrl,
        'Cookie': '_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1',
        'Referer': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Perbarui href yang dimulai dengan base URL
    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

    const judul = $('h1.entry-title').text().trim();
    const thumbnail = $('.thumb img').attr('src');
    const linkChapterPertama = $('.hl-firstlast-ch.first-chapter a').attr('href');
    const teksChapterPertama = $('.hl-firstlast-ch.first-chapter .barunew').text().trim();
    const linkChapterTerakhir = $('.hl-firstlast-ch a').not('.first-chapter a').attr('href');
    const teksChapterTerakhir = $('.hl-firstlast-ch a').not('.first-chapter a').find('.barunew').text().trim();
    const rating = $('i[itemprop="ratingValue"]').text().trim();

    const informasi = {};
    $('.col-info-manga-box span').each((_, el) => {
      const key = $(el).find('b').text().trim().replace(':', '');
      const value = $(el).find('a').length ? $(el).find('a').text().trim() : $(el).text().replace($(el).find('b').text().trim(), '').trim();
      informasi[key] = value;
    });

    const genre = [];
    $('.genre-info-manga a').each((_, el) => {
      genre.push({
        judul: $(el).attr('title').trim(),
        href: $(el).attr('href').trim()
      });
    });

    const sinopsis = $('.entry-content.entry-content-single p').text().trim();
    const informasiTambahan = {};
    $('.info-additional b').each((_, el) => {
      informasiTambahan[$(el).text().trim()] = $(el).next().text().trim();
    });

    const mangaTerkait = [];
    $('#similiar li').each((_, el) => {
      const judulManga = $(el).find('h4 a.series').text().trim();
      const linkManga = $(el).find('h4 a.series').attr('href');
      const gambarManga = $(el).find('img').attr('src');
      const infoTambahan = $(el).find('.info-additional').text().trim();
      const benderaNegara = $(el).find('.flag-country-type').text().trim();
      const kutipanManga = $(el).find('.excerpt-similiar').text().trim();
      mangaTerkait.push({
        judul: judulManga,
        href: linkManga,
        img: gambarManga,
        informasiTambahan: infoTambahan,
        benderaNegara: benderaNegara,
        kutipan: kutipanManga
      });
    });

    const chapters = [];
    $('.box-list-chapter ul li').each((_, el) => {
      const judulBab = $(el).find('span a').first().text().trim();
      const linkBab = $(el).find('span a').first().attr('href');
      const tanggalBab = $(el).find('.list-chapter-date').text().trim();
      const linkUnduh = $(el).find('.dl a').attr('href');
      chapters.push({ judul: judulBab, link: linkBab, tanggal: tanggalBab, linkUnduh });
    });

    const data = {
      status: true,
      judul,
      thumbnail,
      chapterPertama: {
        teks: teksChapterPertama,
        link: linkChapterPertama
      },
      chapterTerakhir: {
        teks: teksChapterTerakhir,
        link: linkChapterTerakhir
      },
      rating,
      informasi,
      genre,
      sinopsis,
      informasiTambahan,
      mangaTerkait,
      chapters
    };

    // Simpan data ke cache
    cache.set(url, data);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data.'
    });
  }
});

module.exports = router;
