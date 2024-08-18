const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Rute Anime
const anilistRoute = require('./anime/anilist');
const carianimeRoute = require('./anime/cari');
const animeGenreRoute = require('./anime/genre');
const studioRoute = require('./anime/studio');
const musimRoute = require('./anime/musim');
const karakterRoute = require('./anime/karakter');
const homeRoute = require('./anime/home');
const animeRoute = require('./anime/anime');
const nontonRoute = require('./anime/nonton');
const searchhRoute = require('./anime/search');

// Rute Manga
const chapterRoute = require('./komik/chapter');
const mangaRoute = require('./komik/manga');
const updateRoute = require('./komik/update');
const mangaGenreRoute = require('./komik/genre');
const daftarRoute = require('./komik/daftar');
const typeRoute = require('./komik/type');
const cariRoute = require('./komik/cari');
const searchRoute = require('./komik/search');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rute Anime
app.use('/api/anime/anilist', anilistRoute);
app.use('/api/anime/cari', carianimeRoute);
app.use('/api/anime/genre', animeGenreRoute);
app.use('/api/anime/studio', studioRoute);
app.use('/api/anime/musim', musimRoute);
app.use('/api/anime/karakter', karakterRoute);
app.use('/api/anime/home', homeRoute);
app.use('/api/anime/anime', animeRoute);
app.use('/api/anime/nonton', nontonRoute);
app.use('/api/anime/search', searchhRoute);

// Rute Manga
app.use('/api/komik/manga', mangaRoute);
app.use('/api/komik/chapter', chapterRoute);
app.use('/api/komik/cari', cariRoute);
app.use('/api/komik/type', typeRoute);
app.use('/api/komik/update', updateRoute);
app.use('/api/komik/genre', mangaGenreRoute);
app.use('/api/komik/daftar', daftarRoute);
app.use('/api/komik/search', searchRoute);

// Proxy untuk gambar
app.get('/img', async (req, res, next) => {
  const imageUrl = req.query.url;
  try {
    const response = await axios({
      url: imageUrl,
      responseType: 'stream',
    });
    response.data.pipe(res);
  } catch (error) {
    next(new Error('Error proxying image'));
  }
});

// Ambil data chapter
const fetchChapterData = async (endpoint) => {
  try {
    const response = await axios.get(`https://kizoy.vercel.app/api/komik/chapter/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data chapter:', error);
    return null;
  }
};

// Rute untuk chapter berikutnya
app.get('/next-chapter/:endpoint', async (req, res, next) => {
  const endpoint = req.params.endpoint;
  const data = await fetchChapterData(endpoint);
  if (!data) {
    return next(new Error('Chapter not found'));
  }
  res.json(data);
});

// Serve static files dari direktori "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
