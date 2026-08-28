exports.getDashboard = async (req, res, next) => {
    try {
        res.send("coming soon")
   } catch (error) {
        console.error("Gagal memuat Dashboard : ", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat dashbard.' 
        });
    }
};
exports.postLogin = (req, res) => {
    // Di masa depan lu bisa tambahin logika verifikasi database di sini
    // const { username, password } = req.body;
    
    // Karena sekarang cuma tampilan, langsung arahkan ke Dashboard
    res.redirect('/member/dashboard');
};
