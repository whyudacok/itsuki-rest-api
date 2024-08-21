<p align="center">
  <a href="https://github.com/ZeroneDoo/zeronewatch-api">
    <img src="https://i.ibb.co.com/KwxRnB6/06d91bc4-ac34-47f2-96e5-818bf495cf57-1.jpg" alt="Logo" width="200" height="200">
  </a>
</p>

<h3 align="center">Itsuki Rest API</h3>

<p align="center">
  <b>Restful API Komik & Anime Subtitle Indonesia</b><br />
  <span>Dibuat untuk belajar pengembangan API</span><br />
</p>

<h1>Daftar Isi</h1>

- [Instalasi](#instalasi)
- [Sumber Data](#sumber-data)
    - [Animisme](#animisme)
    - [Komikcast](#komikcast)

## Sumber Data

- [Komikcast](https://komikcast.cx)
- [Animisme](https://tv.animisme.net)

## Komik
### Komikcast
Komikcast menyediakan koleksi komik terlengkap dalam bahasa Indonesia.

- #### latest Komik
  Mendapatkan komik terbaru.
  
  `/api/komik/latest/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/komik/latest/1](https://cihuyy-api.vercel.app/api/komik/latest/1)

- #### Daftar Komik
  Mendapatkan daftar semua komik.
  
  `/api/komik/daftar/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/komik/daftar/1](https://cihuyy-api.vercel.app/api/komik/daftar/1)
  
- #### Detail Tipe
  Mendapatkan daftar tipe manga atau manhua.
  
  `/api/komik/type/:endpoint/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/komik/type/manga/1](https://cihuyy-api.vercel.app/api/komik/type/manga/1)

- #### Detail Pencarian
  Mendapatkan komik berdasarkan pencarian.
  
  `/api/komik/cari/:endpoint/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/komik/cari/waka%20chan/1](https://cihuyy-api.vercel.app/api/komik/cari/waka%20chan/1)

- #### Detail Genre
  Mendapatkan komik berdasarkan genre.
  
  `/api/komik/genre/:endpoint/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/komik/genre/action/1](https://cihuyy-api.vercel.app/api/komik/genre/action/1)

- #### Pencarian Komik
  Mencari komik berdasarkan genre, type, format, status, project, dan title. Untuk endpoint bisa cek di [Komikcast](https://komikcast.cx/daftar-komik).
  
  `/api/komik/search/:page?genre%5B%5D=:endpoint&status=:endpoint&type=:endpoint&format=:endpoint&order=:endpoint&project=no&title=:endpoint`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/komik/search/1?genre%5B%5D=action&status=Ongoing&type=Manga&format=0&order=title&project=no&title=my](https://cihuyy-api.vercel.app/api/komik/search/1?genre%5B%5D=action&status=Ongoing&type=Manga&format=0&order=title&project=no&title=my)

- #### Detail Manga
  Mendapatkan detail komik.
  
  `/api/komik/manga/:endpoint`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/komik/manga/waka-chan-wa-kyou-mo-azatoi/](https://cihuyy-api.vercel.app/api/komik/manga/waka-chan-wa-kyou-mo-azatoi/)
  
- #### Chapter
  Mendapatkan chapter 
  
  `/api/komik/chapter/:endpoint`
  
  Contoh: [https://cihuyy-api.vercel.app/api/komik/chapter/waka-chan-wa-kyou-mo-azatoi-chapter-1/](https://cihuyy-api.vercel.app/api/komik/chapter/waka-chan-wa-kyou-mo-azatoi-chapter-1/)
  
- #### proxy 
  Untuk chapter gambar 
  
  `/img?url=`
  
  Contoh: [https://cihuyy-api.vercel.app/img?url=https://pinjamduluseratus.buzz/data/png](https://cihuyy-api.vercel.app/img?url=https://pinjamduluseratus.buzz/data/305770/5/70e7bcb1a59f3db133dcb86f2e17c3b1/tvgEMpobFW2WoPSuRbKrsEBKZTv60PzdhTcX33Uf.jpg)
  
### Animisme
Animisme adalah tempat kumpulan anime batch & movie bahasa Indonesia.

- #### Latest Anime
  Mendapatkan anime terbaru.
  
  `/api/anime/latest`
  
  Contoh: [https://cihuyy-api.vercel.app/api/anime/latest](https://cihuyy-api.vercel.app/api/anime/latest)
  
- #### daftar anime
  Mendapatkan Daftar anime
  
  `/api/anime/anilist/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/anime/anilist/1](https://cihuyy-api.vercel.app/api/anime/anilist/1)
  
- #### Detail Anime
  Mendapatkan detail anime.
  
  `/api/anime/anime/:endpoint`
  
      Contoh: [https://cihuyy-api.vercel.app/api/anime/anime/boku-no-pico/](https://cihuyy-api.vercel.app/api/anime/anime/boku-no-pico/)
  
- #### Detail episode 
  Mendapatkan Episode anime
  
  `/api/anime/nonton/:endpoint`
  
  Contoh: [https://cihuyy-api.vercel.app/api/anime/nonton/nonton-boku-no-pico-episode-1/](https://cihuyy-api.vercel.app/api/anime/nonton/nonton-boku-no-pico-episode-1/)
  
- #### Cari anime
  Mencari anime
  
  `/api/anime/cari/:endpoint/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/anime/cari/boku no p/1](https://cihuyy-api.vercel.app/api/anime/cari/boku%20no%20p/1)
  
- #### Search Anime
  Mencari anime. untuk detail endpoint cek [Animisme](https://tv.animisme.net/anime/?status=&type=&order=update)
  
  `/api/anime/search/1/?genre%5B%5D=:endpoint&season%5B%5D=:endpoint&studio%5B%5D=:endpoint&status=:endpoint&type=:endpoint&sub=&order=update`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/anime/search/1/?genre%5B%5D=aksi&season%5B%5D=summer-2020&studio%5B%5D=mappa&status=completed&type=tv&sub=&order=update](https://cihuyy-api.vercel.app/api/anime/search/1/?genre%5B%5D=aksi&season%5B%5D=summer-2020&studio%5B%5D=mappa&status=completed&type=tv&sub=&order=update)
  
- #### Studio
  Mendapatkan anime dari Studio 
  
  `/api/anime/studio/:endpoint/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/anime/studio/8bit/1](https://cihuyy-api.vercel.app/api/anime/studio/8bit/1)

- #### karakter 
  Mendapatkan Tokoh kepribadian anime
  
  `/api/anime/karakter/:endpoint/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/anime/karakter/anak-anak/1](https://cihuyy-api.vercel.app/api/anime/karakter/anak-anak/1)

- #### Season 
  Mendapatkan Musim anime
  
  `/api/anime/musim/:endpoint/`
  
  Contoh: [https://cihuyy-api.vercel.app/api/anime/musim/fall-2020](https://cihuyy-api.vercel.app/api/anime/musim/fall-2020)

- #### Studio
  Mendapatkan anime dari Studio 
  
  `/api/anime/studio/:endpoint/:page`
  
  Default page adalah 1. Contoh: [https://cihuyy-api.vercel.app/api/anime/studio/8bit/1](https://cihuyy-api.vercel.app/api/anime/studio/8bit/1)
