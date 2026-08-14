const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// Route halaman utama
router.get('/', indexController.getHomePage);
router.get('/read/:id', indexController.getReadingPage)
router.get('/pustaka', indexController.getPustakaPage)
// Route halaman detail komik (manga_id bersifat dinamis)
router.get('/manga/:id', indexController.getMangaDetail);
router.get('/genre', indexController.getGenrePage);
router.get('/bookmark', indexController.getBookmarkPage);
router.get('/latest-update', indexController.getLatest)
module.exports = router;
