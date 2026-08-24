const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const memberController = require('../controllers/memberController');
// Route halaman utama
router.get('/', indexController.getHomePage);
router.get('/read/:id', indexController.getReadingPage)
router.get('/pustaka', indexController.getPustakaPage)
// Route halaman detail komik (manga_id bersifat dinamis)
router.get('/manga/:id', indexController.getMangaDetail);
router.get('/genre', indexController.getGenrePage);
router.get('/bookmark', indexController.getBookmarkPage);
router.get('/latest-update', indexController.getLatest)

router.get('/member/dashboard', memberController.getDashboard);
module.exports = router;
