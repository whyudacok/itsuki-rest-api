const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/video', (req, res) => {
    const videoUrl = req.query.url;
    
    // Validasi URL
    if (!videoUrl) {
        return res.status(400).send('URL tidak diberikan');
    }

    // Kirim header permintaan Range untuk dukungan streaming
    const options = {
        url: videoUrl,
        headers: {
            'Range': req.headers.range || ''
        }
    };

    request(options).pipe(res);
});

module.exports = router;
