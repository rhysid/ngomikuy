const axios = require('axios');

exports.getBookmarkPage = async (req, res, next) => {
    try {
        res.render('bookmark');
    } catch (error) {
        console.error("Gagal memuat halaman bookmark:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat halaman bookmark.' 
        });
    }
};
exports.getGenrePage = async (req, res, next) => {
    try {
        // 1. Siapkan URL Local API lu
        // Catatan: Pastikan port-nya benar (3000 atau 5000 sesuai server API lu)
        const apiUrl = 'http://217.216.111.75:50033/comic/genre?apikey=kontol';

        // 2. Fetch data dari Local API
        const response = await axios.get(apiUrl);

        // 3. Pastikan response sukses
        if (!response.data || !response.data.success || !response.data.data) {
            throw new Error('Data API tidak valid atau sukses: false');
        }

        // 4. Ekstrak array genres dari struktur JSON baru lu
        const genresData = response.data.data.genres || [];

        // 5. Lempar data ke view genre.ejs
        res.render('genre', {
            genres: genresData
        });
        
    } catch (error) {
        console.error("Gagal memuat halaman genre dari Local API:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat daftar genre.' 
        });
    }
};
exports.getGenrePageLama = async (req, res, next) => {
    try {
        const genresUrl = 'https://www.sankavollerei.web.id/comic/shinigami/genres';
        const response = await axios.get(genresUrl);
        const genresData = response.data.data || [];

        res.render('genre', {
            genres: genresData
        });
    } catch (error) {
        console.error("Gagal memuat halaman genre:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat daftar genre.' 
        });
    }
};
exports.getProxyImage = async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.status(400).send('URL gambar tidak valid');

        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        // Teruskan header tipe konten (image/jpeg, image/png, dll)
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Gagal memuat gambar.');
    }
};
exports.getPustakaPage = async (req, res, next) => {
    try {
        // 1. Tangkap semua parameter dari browser user (misal: ?q=solo&sort=latest&genre_include=action)
        const userQuery = req.query;

        // 2. Gabungkan parameter user dengan API Key untuk ditembak ke lokal API lu
        const apiParams = {
            apikey: 'kontol',
            ...userQuery 
        };

        // 3. Tembak API Pustaka lokal lu
        // Catatan: Kalau API lu jalan di port 5000 kayak sebelumnya, ganti 3000 jadi 5000 ya!
        const apiUrl = 'http://217.216.111.75:50033/comic/pustaka';
        
        // Axios bakal otomatis nerjemahin apiParams jadi query string URL (?apikey=...&q=...&sort=...)
        const response = await axios.get(apiUrl, { params: apiParams });

        // Pastikan response sukses dan data tersedia
        if (!response.data || !response.data.success || !response.data.data) {
            throw new Error('Data API tidak valid atau success: false');
        }

        const resultData = response.data.data;

        // 4. Langsung oper semua datanya ke view pustaka.ejs
        res.render('pustaka', {
            komik: resultData.komik || [],
            pagination: resultData.pagination || {},
            genres: resultData.genres || [],
            types: resultData.types || [],
            formats: resultData.formats || [],
            authors: resultData.authors || [],
            artists: resultData.artists || [],
            currentQuery: resultData.currentQuery || userQuery // Mempertahankan state filter di sidebar
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat fetching Pustaka:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat halaman Pustaka.' 
        });
    }
};
exports.getPustakaPageLama = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 24;

        // Tangkap parameter query dari URL
        const query = req.query.q || '';
        const genreInclude = req.query.genre_include || '';
        const genreIncludeMode = req.query.genre_include_mode || 'or';
        const sort = req.query.sort || 'popular';
        const type = req.query.type || '';
        const format = req.query.format || '';
        const author = req.query.author || '';
        const artist = req.query.artist || '';

        // 1. Susun URL Advanced Search untuk daftar komik
        let searchApiUrl = `https://www.sankavollerei.web.id/comic/shinigami/advanced-search?page=${page}&page_size=${pageSize}&sort=${sort}`;

        if (query) searchApiUrl += `&q=${encodeURIComponent(query)}`;
        if (genreInclude) searchApiUrl += `&genre_include=${encodeURIComponent(genreInclude)}&genre_include_mode=${genreIncludeMode}`;
        if (type) searchApiUrl += `&type=${encodeURIComponent(type)}`;
        if (format) searchApiUrl += `&format=${encodeURIComponent(format)}`;
        if (author) searchApiUrl += `&author=${encodeURIComponent(author)}`;
        if (artist) searchApiUrl += `&artist=${encodeURIComponent(artist)}`;

        // 2. Endpoint untuk dropdown filter (Genre, Type, Format, Author, Artist)
        const genresUrl = 'https://www.sankavollerei.web.id/comic/shinigami/genres';
        const typesUrl = 'https://www.sankavollerei.web.id/comic/shinigami/types';
        const formatsUrl = 'https://www.sankavollerei.web.id/comic/shinigami/formats';
        const authorsUrl = 'https://www.sankavollerei.web.id/comic/shinigami/authors?q=&page=1';
        const artistsUrl = 'https://www.sankavollerei.web.id/comic/shinigami/artists?q=&page=1';

        // 3. Fetch semuanya secara paralel
        const [searchRes, genresRes, typesRes, formatsRes, authorsRes, artistsRes] = await Promise.all([
            axios.get(searchApiUrl),
            axios.get(genresUrl).catch(() => ({ data: { data: [] } })),
            axios.get(typesUrl).catch(() => ({ data: { data: [] } })),
            axios.get(formatsUrl).catch(() => ({ data: { data: [] } })),
            axios.get(authorsUrl).catch(() => ({ data: { data: [] } })),
            axios.get(artistsUrl).catch(() => ({ data: { data: [] } }))
        ]);

        // 4. Render ke view pustaka.ejs
        res.render('pustaka', {
            komik: searchRes.data.data || [],
            pagination: searchRes.data.pagination || {},
            genres: genresRes.data.data || [],
            types: typesRes.data.data || [],
            formats: formatsRes.data.data || [],
            authors: (authorsRes.data.data || []).filter(item => item.id),
            artists: (artistsRes.data.data || []).filter(item => item.id),
            currentQuery: req.query
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat fetching Pustaka:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat halaman Pustaka.' 
        });
    }
};
/*
exports.getReadingPage = async (req, res, next) => {
    try {
        const chapterId = req.params.id;
        
        // 1. Fetch data chapter (isi gambar-gambar komiknya)
        const readUrl = `https://www.sankavollerei.web.id/comic/shinigami/read/${chapterId}`;
        const readRes = await axios.get(readUrl);
        const readData = readRes.data?.data;

        if (!readData) {
            return res.status(404).render('404', { 
                url: req.originalUrl,
                message: 'Data chapter tidak ditemukan.' 
            });
        }

        const mangaId = readData.manga_id;

        // 2. Fetch Detail Manga (untuk judul/thumbnail) & List Chapter (untuk Dropdown) secara paralel
        const detailUrl = `https://www.sankavollerei.web.id/comic/shinigami/detail/${mangaId}`;
        const chaptersUrl = `https://www.sankavollerei.web.id/comic/shinigami/chapters/${mangaId}`;

        const [detailRes, chaptersRes] = await Promise.all([
            axios.get(detailUrl).catch(() => ({ data: { data: {} } })),
            axios.get(chaptersUrl).catch(() => ({ data: { data: [] } }))
        ]);

        const mangaDetail = detailRes.data?.data || {};
        const chaptersList = chaptersRes.data?.data || [];

        // 3. Parsing semua datanya ke view read.ejs
        res.render('read', {
            read: readData,
            manga: mangaDetail,
            chapters: chaptersList
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat fetching halaman baca:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat halaman baca komik.' 
        });
    }
};
*/
exports.getMangaDetail = async (req, res, next) => {
    try {
        const mangaId = req.params.id;
        
        // 1. Fetch data dari Local API (Halaman 1)
        const apiUrl = `http://217.216.111.75:50033/comic/detail/${mangaId}?apikey=kontol`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.success) {
            throw new Error('Data API tidak valid atau sukses: false');
        }

        // Ekstrak data utama
        const mangaData = response.data.data.manga;
        const chaptersData = response.data.data.chapters || [];
        const paginationData = response.data.data.pagination || {};

        if (!mangaData) {
            return res.status(404).render('404', { url: req.originalUrl, message: 'Data komik tidak ditemukan.' });
        }

        // ==========================================
        // LOGIKA MENCARI ID CHAPTER 1
        // ==========================================
        let firstChapterId = null;

        if (chaptersData.length > 0) {
            const totalPages = paginationData.total_pages || 1;

            if (totalPages > 1) {
                // Jika halaman lebih dari 1, Chapter 1 ada di halaman terakhir
                // Kita tambahkan parameter &page=X sesuai total_pages
                const lastPageUrl = `http://217.216.111.75:50033/comic/detail/${mangaId}?apikey=kontol&page=${totalPages}`;
                
                try {
                    const lastPageRes = await axios.get(lastPageUrl);
                    if (lastPageRes.data && lastPageRes.data.success) {
                        const lastPageChapters = lastPageRes.data.data.chapters;
                        if (lastPageChapters && lastPageChapters.length > 0) {
                            // Ambil chapter yang posisinya paling bawah (terakhir di array)
                            firstChapterId = lastPageChapters[lastPageChapters.length - 1].chapter_id;
                        }
                    }
                } catch (err) {
                    console.error("Gagal fetch halaman terakhir untuk chapter 1", err.message);
                }
            } else {
                // Jika total_pages cuma 1, Chapter 1 langsung ada di array paling bawah
                firstChapterId = chaptersData[chaptersData.length - 1].chapter_id;
            }
        }

        // 2. Lempar data komik, chapter, pagination, DAN ID Chapter 1 ke View
        res.render('detail', { 
            manga: mangaData,
            chapters: chaptersData,
            pagination: paginationData,
            firstChapterId: firstChapterId // <- Variabel baru untuk tombol Chapter 1
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat fetching detail komik:", error.message);
        res.status(404).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat detail komik atau endpoint API tidak valid.' 
        });
    }
};
exports.getMangaDetailLama = async (req, res, next) => {
    try {
        const mangaId = req.params.id;
        
        // 1. Siapkan URL untuk Detail Komik dan List Chapter
        const detailUrl = `https://www.sankavollerei.web.id/comic/shinigami/detail/${mangaId}`;
        const chaptersUrl = `https://www.sankavollerei.web.id/comic/shinigami/chapters/${mangaId}`;

        // 2. Fetch kedua API secara bersamaan (paralel)
        // Tambahkan .catch pada chaptersUrl agar kalau API chapter error, halaman detail tetep bisa kebuka
        const [detailRes, chaptersRes] = await Promise.all([
            axios.get(detailUrl),
            axios.get(chaptersUrl).catch(err => ({ data: { data: [], pagination: {} } }))
        ]);

        // 3. Ekstrak data dari response JSON
        const mangaData = detailRes.data?.data;
        const chaptersData = chaptersRes.data?.data || [];
        const paginationData = chaptersRes.data?.pagination || {};

        // Jika data komik tidak ditemukan
        if (!mangaData) {
            return res.status(404).render('404', { 
                url: req.originalUrl,
                message: 'Data komik tidak ditemukan di server.' 
            });
        }

        // 4. Passing data komik, chapter, dan pagination ke view
        res.render('detail', { 
            manga: mangaData,
            chapters: chaptersData,
            pagination: paginationData
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat fetching detail komik:", error.message);
        res.status(404).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat detail komik atau endpoint API tidak valid.' 
        });
    }
};


exports.getHomePageLama = async (req, res, next) => {
    try {
        // 1. Setup endpoint dengan logic random untuk Hero Banners
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const heroUrl = `https://www.sankavollerei.web.id/comic/shinigami/latest?page=${randomPage}`;
        const popularUrl = 'https://www.sankavollerei.web.id/comic/shinigami/popular?page=1&page_size=16';
        const latestUrl = 'https://www.sankavollerei.web.id/comic/shinigami/latest?page=1&page_size=24';
        const recommendedUrl = 'https://www.sankavollerei.web.id/comic/shinigami/recommended?page=1';

        // 2. Fetch API tahap pertama secara PARALEL
        const [heroRes, popularRes, latestRes, recommendedRes] = await Promise.all([
            axios.get(heroUrl),
            axios.get(popularUrl),
            axios.get(latestUrl),
            axios.get(recommendedUrl)
        ]);

        // Ekstrak data (menyesuaikan format respons API standar, asumsikan berada di .data atau .data.data)
        const rawHero = heroRes.data?.data || heroRes.data || [];
        const popularToday = popularRes.data?.data || popularRes.data || [];
        const rawLatest = latestRes.data?.data || latestRes.data || [];
        const topSeries = recommendedRes.data?.data || recommendedRes.data || [];

        // Logic Hero: Ambil hanya 3 item pertama
        const heroBanners = rawHero.slice(0, 3);

        // 3. Logic Latest Updates & Chapters: Fetch chapter untuk setiap manga secara paralel
        const latestUpdatesPromises = rawLatest.map(async (manga) => {
            try {
                // Asumsi ID manga tersimpan di field 'id', 'manga_id', atau 'slug'
                const mangaId = manga.manga_id || manga.id || manga.slug; 
                
                // Fetch chapter berdasarkan ID
                const chapterRes = await axios.get(`https://www.sankavollerei.web.id/comic/shinigami/chapters/${mangaId}`);
                const chaptersData = chapterRes.data?.data || chapterRes.data || [];

                // Ambil 3 chapter terakhir/teratas lalu gabungkan ke object manga
                manga.latest_chapters = chaptersData.slice(0, 3);
            } catch (error) {
                console.error(`Gagal mengambil chapter untuk ID: ${manga.manga_id || manga.id}`, error.message);
                manga.latest_chapters = []; // Fallback agar tidak crash jika API 1 manga error
            }
            return manga;
        });

        // Tunggu semua proses fetch chapter selesai
        const latestUpdates = await Promise.all(latestUpdatesPromises);

        // 4. Parsing semua data utuh ke view EJS
        res.render('index', {
            heroBanners,
            popularToday,
            latestUpdates,
            topSeries
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat fetching API:", error.message);
        // Bisa dilempar ke middleware error handler atau render halaman error khusus

         return res.status(500).render('500', { 
                url: req.originalUrl,
                message: 'SERVER E JEK GENDENG.' 
            });
    }
};
exports.getLatest = async (req, res, next) => {
    try {
        // URL API Lokal lu yang baru
        const apiUrl = 'http://217.216.111.75:50033/comic/homepage?apikey=kontol';

        // Tembak API-nya (sekarang cuma 1 request, jadi jauh lebih cepat)
        const response = await axios.get(apiUrl);
        
        // Cek apakah response sukses dan datanya ada
        if (response.data && response.data.success) {
            const komikData = response.data.data;

            // Lempar data ke view index.ejs
            res.render('latest', {
                latestUpdates: komikData.latestUpdates || [],
               
            });
        } else {
            throw new Error("Format data API tidak sesuai atau success: false");
        }

    } catch (error) {
        console.error("Gagal memuat homepage dari Local API:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat halaman utama.' 
        });
    }
};
exports.getHomePage = async (req, res, next) => {
    try {
        // PERBAIKAN DI SINI COY 👇 Ganti req.params jadi req.query
        const pages = parseInt(req.query.page) || 1; 
        
        console.log("Mencoba Fetch Page: " + pages);
        
        // URL API Lokal lu yang baru
        const apiUrl = `http://217.216.111.75:50033/comic/homepage?apikey=kontol&page=${pages}&page_size=30`;

        // Tembak API-nya
        const response = await axios.get(apiUrl);
        
        // Cek apakah response sukses dan datanya ada
        if (response.data && response.data.success) {
            const komikData = response.data.data;

            // Lempar data ke view index.ejs
            res.render('index', {
                heroBanners: komikData.heroBanners || [],
                popularToday: komikData.popularToday || [],
                latestUpdates: komikData.latestUpdates || [],
                pagination: komikData.pagination || {},
                topSeries: komikData.topSeries || []
            });
        } else {
            throw new Error("Format data API tidak sesuai atau success: false");
        }

    } catch (error) {
        console.error("Gagal memuat homepage dari Local API:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat halaman utama.' 
        });
    }
};
exports.getReadingPage = async (req, res, next) => {
    try {
        const chapterId = req.params.id;
        
        // 1. Fetch SEMUA data (gambar, info manga, dan list chapter) dari 1 endpoint lokal!
        const apiUrl = `http://217.216.111.75:50033/comic/read/${chapterId}?apikey=kontol`;
        const response = await axios.get(apiUrl);

        // Pastikan response sukses dan datanya ada
        if (!response.data || !response.data.success || !response.data.data) {
            return res.status(404).render('404', { 
                url: req.originalUrl,
                message: 'Data chapter tidak ditemukan.' 
            });
        }

        // 2. Ekstrak data langsung dari struktur JSON baru lu
        const readData = response.data.data.read; // Isi array gambar
        const mangaDetail = response.data.data.manga || {}; // Info komik[cite: 9]
        const chaptersList = response.data.data.chapters || []; // List buat dropdown[cite: 9]

        if (!readData) {
            return res.status(404).render('404', { 
                url: req.originalUrl,
                message: 'Gambar chapter kosong.' 
            });
        }

        // 3. Lempar datanya ke view read.ejs
        res.render('read', {
            read: readData,
            manga: mangaDetail,
            chapters: chaptersList
        });

    } catch (error) {
        console.error("Terjadi kesalahan saat fetching halaman baca:", error.message);
        res.status(500).render('404', { 
            url: req.originalUrl,
            message: 'Gagal memuat halaman baca komik.' 
        });
    }
};
