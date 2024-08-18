const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { status: false, message: 'Terlalu banyak permintaan dari IP ini, coba lagi nanti.' }
});

// Manga routes
const chapterRoute = require('./komik/chapter');
const mangaRoute = require('./komik/manga');
const updateRoute = require('./komik/update');
const mangaGenreRoute = require('./komik/genre');
const daftarRoute = require('./komik/daftar');
const typeRoute = require('./komik/type'); 
const cariRoute = require('./komik/cari');
const searchRoute = require('./komik/search');

// Anime routes
const homeRoute = require('./anime/home');
const animeRoute = require('./anime/anime');
const nontonRoute = require('./anime/nonton');
const anilistRoute = require('./anime/anilist');
const carianimeRoute = require('./anime/cari');
const animeGenreRoute = require('./anime/genre');
const studioRoute = require('./anime/studio');
const musimRoute = require('./anime/musim');
const karakterRoute = require('./anime/karakter');
const searchhRoute = require('./anime/search');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Apply the rate limiting middleware to all routes
app.use(limiter);

// Anime routes
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

// Manga routes
app.use('/api/komik/manga', mangaRoute);
app.use('/api/komik/chapter', chapterRoute);
app.use('/api/komik/cari', cariRoute);
app.use('/api/komik/type', typeRoute);
app.use('/api/komik/update', updateRoute);
app.use('/api/komik/genre', mangaGenreRoute);
app.use('/api/komik/daftar', daftarRoute);
app.use('/api/komik/search', searchRoute);

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

const fetchChapterData = async (endpoint) => {
  try {
    const response = await axios.get(`https://cihuyy-api.vercel.app/api/komik/chapter/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data chapter.:', error);
    return null;
  }
};

app.get('/api/komik/next-chapter/:endpoint', async (req, res, next) => {
  const endpoint = req.params.endpoint;
  const data = await fetchChapterData(endpoint);
  if (!data) {
    return next(new Error('Chapter tidak ditemukan'));
  }
  res.json(data);
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
