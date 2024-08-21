const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { baseUrl } = require('../base-url');

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${baseUrl}/komik/${encodedEndpoint}/`;

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
        link: $(el).attr('href').trim()
      });
    });

    const sinopsis = $('.entry-content.entry-content-single p').text().trim();
    const informasiTambahan = {};
    $('.info-additional b').each((_, el) => {
      informasiTambahan[$(el).text().trim()] = $(el).next().text().trim();
    });

    const mangaTerkait = [];
    $('#similiar li').each((_, el) => {
      mangaTerkait.push({
        judul: $(el).find('h4 a.series').text().trim(),
        link: $(el).find('h4 a.series').attr('href'),
        gambar: $(el).find('img').attr('src'),
        info: $(el).find('.info-additional').text().trim(),
        type: $(el).find('.flag-country-type').text().trim(),
        kutipan: $(el).find('.excerpt-similiar').text().trim()
      });
    });

    const chapters = [];
    $('.box-list-chapter ul li').each((_, el) => {
      chapters.push({
        judul: $(el).find('span a').first().text().trim(),
        link: $(el).find('span a').first().attr('href'),
        tanggal: $(el).find('.list-chapter-date').text().trim(),
        linkUnduh: $(el).find('.dl a').attr('href')
      });
    });

    res.json({
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
    });
  } catch (error) {
    console.error(error); // Menambahkan logging untuk debugging
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data.'
    });
  }
});

module.exports = router;
