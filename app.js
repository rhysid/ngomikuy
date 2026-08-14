const express = require('express');
const path = require('path');
const indexRoute = require('./routes/indexRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup View Engine ke EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup folder public untuk file statis (CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// Mendaftarkan Routing Utama
app.use('/', indexRoute);

// Middleware Penanganan 404 (Not Found)
app.use((req, res, next) => {
    res.status(404).render('404', { 
        url: req.originalUrl,
        message: 'Halaman tidak ditemukan' 
    });
});

// Menjalankan server & Ngrok Tunnel
app.listen(PORT, async () => {
    console.log(`Server SSR berjalan di http://localhost:${PORT}`);

    // 2. Tambahkan pemanggilan ngrok di dalam listen
   
});