const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Import semua route yang sudah kamu buat
const chapterRoute = require('./komik/chapter');
const mangaRoute = require('./komik/manga');
const updateRoute = require('./komik/update');
const mangaGenreRoute = require('./komik/genre');
const daftarRoute = require('./komik/daftar');
const typeRoute = require('./komik/type');
const cariRoute = require('./komik/cari');
const searchRoute = require('./komik/search');
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

// Rate limiter untuk setiap router
const animeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request per 15 menit
  message: { status: false, message: "Limit permintaan tercapai untuk rute anime ini." }
});

const mangaRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request per 15 menit
  message: { status: false, message: "Limit permintaan tercapai untuk rute manga ini." }
});

// Anime routes dengan rate limiter
app.use('/api/anime/home', animeRateLimiter, homeRoute);
app.use('/api/anime/anime', animeRateLimiter, animeRoute);
app.use('/api/anime/nonton', animeRateLimiter, nontonRoute);
app.use('/api/anime/anilist', animeRateLimiter, anilistRoute);
app.use('/api/anime/cari', animeRateLimiter, carianimeRoute);
app.use('/api/anime/genre', animeRateLimiter, animeGenreRoute);
app.use('/api/anime/studio', animeRateLimiter, studioRoute);
app.use('/api/anime/musim', animeRateLimiter, musimRoute);
app.use('/api/anime/karakter', animeRateLimiter, karakterRoute);
app.use('/api/anime/search', animeRateLimiter, searchhRoute);

// Manga routes dengan rate limiter
app.use('/api/komik/manga', mangaRateLimiter, mangaRoute);
app.use('/api/komik/chapter', mangaRateLimiter, chapterRoute);
app.use('/api/komik/cari', mangaRateLimiter, cariRoute);
app.use('/api/komik/type', mangaRateLimiter, typeRoute);
app.use('/api/komik/update', mangaRateLimiter, updateRoute);
app.use('/api/komik/genre', mangaRateLimiter, mangaGenreRoute);
app.use('/api/komik/daftar', mangaRateLimiter, daftarRoute);
app.use('/api/komik/search', mangaRateLimiter, searchRoute);

// Middleware untuk serve file statis
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
