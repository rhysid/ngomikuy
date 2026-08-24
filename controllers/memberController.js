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
