document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. EFEK STICKY NAVBAR SAAT DI-SCROLL
    // ==========================================
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
            navbar.style.background = 'rgba(30, 29, 43, 0.95)'; // Transparan dikit
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'var(--bg-main)'; // Sesuai dengan revisi kedua lu
        }
    });

    // ==========================================
    // 2. INTERAKSI TAB 'DAFTAR POPULER'
    // ==========================================
    const popTabs = document.querySelectorAll('.popular-sidebar .tabs button');
    
    popTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            popTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            console.log(`Tab ${this.innerText} diklik!`);
        });
    });

    // ==========================================
    // 3. PEMBUATAN MODAL SEARCH & MENU MOBILE
    // ==========================================
    const searchBtn = document.querySelector('.nav-right .icon-btn:nth-child(1)'); // Tombol Search
    const menuBtn = document.querySelector('.menu-btn'); // Tombol Hamburger

    // Buat elemen modal search secara dinamis jika belum ada di HTML
    let searchModal = document.querySelector('.global-search-modal');
    if (!searchModal) {
        searchModal = document.createElement('div');
        searchModal.className = 'global-search-modal';
        searchModal.innerHTML = `
            <div class="search-modal-content">
                <form action="/pustaka" method="GET" class="search-form" style="position: relative;">
                    <div style="display: flex; gap: 10px; width: 100%;">
                        <input type="text" name="q" id="searchInputLive" placeholder="nano..." autocomplete="off" style="width: 100%; padding: 10px; border-radius: 4px; background: #232232; color: white; border: 1px solid #00d26a;">
                        <button type="submit" style="background: #00d26a; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">Search</button>
                    </div>
                    
                    <!-- WADAH DROPDOWN HASIL LIVE SEARCH (Awalnya disembunyikan) -->
                    <div id="liveSearchResults" class="live-search-dropdown" style="display: none;"></div>
                </form>
                <button class="close-search-modal">&times;</button>
            </div>
        `;
        document.body.appendChild(searchModal);
    }

    // Buat elemen mobile menu drawer secara dinamis jika belum ada
    let mobileMenu = document.querySelector('.global-mobile-menu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'global-mobile-menu';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                   <img src="/ngomikuy.png" alt="Ngomikuy" class="logo-img">
                    <button class="close-mobile-menu">&times;</button>
                </div>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/pustaka" class="active">Pustaka</a></li>
                    <li><a href="/genre">Genre List</a></li>
                    <li><a href="/bookmark">Bookmark</a></li>
                </ul>
            </div>
        `;
        document.body.appendChild(mobileMenu);
    }

    // ==========================================
    // 4. LOGIKA BUKA/TUTUP MODAL & MENU
    // ==========================================
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchModal.classList.add('active');
            searchModal.querySelector('input').focus();
        });
    }

    const closeSearch = searchModal.querySelector('.close-search-modal');
    closeSearch.addEventListener('click', () => {
        searchModal.classList.remove('active');
    });

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    const closeMenu = mobileMenu.querySelector('.close-mobile-menu');
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });

    // ==========================================
    // 5. LOGIKA LIVE SEARCH (AMAN VIA BACKEND PROXY)
    // ==========================================
    // Elemen ini baru bisa ditangkap SETELAH modal di-appendChild di atas
    const searchInputLive = document.getElementById('searchInputLive');
    const searchResults = document.getElementById('liveSearchResults');
    let debounceTimer;

    if (searchInputLive && searchResults) {
        searchInputLive.addEventListener('input', function() {
            clearTimeout(debounceTimer); 
            const query = this.value.trim();
            
            console.log("Gwe lagi ngetik:", query);

            if (query.length < 3) {
                searchResults.style.display = 'none';
                return;
            }

            searchResults.innerHTML = '<div style="padding: 10px; color: #8b899f; text-align: center;">Mencari komik...</div>';
            searchResults.style.display = 'flex';

            debounceTimer = setTimeout(async () => {
                try {
                    // NEMBAK AMAN KE NODE.JS LU SENDIRI
                    const apiUrl = `/api/search?q=${encodeURIComponent(query)}`;
                    const response = await fetch(apiUrl);
                    const result = await response.json();

                    if (result.success && result.data && result.data.komik && result.data.komik.length > 0) {
                        searchResults.innerHTML = ''; 
                        
                        result.data.komik.slice(0, 5).forEach(manga => {
                            const coverImg = manga.cover_portrait || manga.cover || manga.image || manga.thumbnail;
                            const descText = manga.description || 'Tidak ada sinopsis tersedia.';
                            
                            const html = `
                                <a href="/manga/${manga.manga_id || manga.id}" class="search-result-card">
                                    <img src="${coverImg}" alt="Cover" class="search-result-thumb">
                                    <div class="search-result-info">
                                        <h4 class="search-result-title">${manga.title || manga.name}</h4>
                                        <p class="search-result-desc">${descText}</p>
                                    </div>
                                </a>
                            `;
                            searchResults.insertAdjacentHTML('beforeend', html);
                        });
                    } else {
                        searchResults.innerHTML = '<div style="padding: 10px; color: #ff3b5c; text-align: center;">Komik tidak ditemukan.</div>';
                    }
                } catch (error) {
                    console.error("Error fetching live search:", error);
                    searchResults.innerHTML = '<div style="padding: 10px; color: #ff3b5c; text-align: center;">Gagal mengambil data.</div>';
                }
            }, 500); 
            
        });
        // ==========================================
    // PEMBUATAN MODAL LOGIN (Dinamis)
    // ==========================================
    let loginModal = document.querySelector('.global-login-modal');
    if (!loginModal) {
        loginModal = document.createElement('div');
        loginModal.className = 'global-login-modal';
        loginModal.innerHTML = `
            <div class="login-modal-content">
                <button class="close-login-modal">&times;</button>
                <div class="login-tabs">
                    <button class="login-tab active" data-target="social-login">Social</button>
                    <button class="login-tab" data-target="password-login">Password</button>
                </div>
                
                <!-- TAB SOCIAL LOGIN -->
                <div id="social-login" class="login-tab-content active">
                    <h3 class="login-title">Sign In</h3>
                    <a href="/member/dashboard" class="social-btn">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style="width: 18px;"> Google
                    </a>
                    <a href="/member/dashboard" class="social-btn">
                        <i class="fab fa-discord" style="color: #5865F2; font-size: 18px;"></i> Discord
                    </a>
                    <a href="/member/dashboard" class="social-btn">
                        <i class="fa-brands fa-x-twitter" style="color: #000; font-size: 18px;"></i> Twitter
                    </a>
                    
                    <div class="login-divider"><span>OR</span></div>
                    
                    <p class="login-footer-text">Untuk mendapatkan password lihat tutorial ini:<br><a href="#">Mengatur Password</a></p>
                </div>

                <!-- TAB PASSWORD LOGIN -->
                <div id="password-login" class="login-tab-content" style="display: none;">
                    <h3 class="login-title">Sign In</h3>
                    <!-- Form ini nembak ke endpoint dummy lu -->
                    <form action="/member/login" method="POST" class="password-form">
                        <input type="text" name="username" placeholder="Username" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit" class="submit-login-btn">Login</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(loginModal);
    }

    // ==========================================
    // LOGIKA CEGAT TOMBOL USER & SWITCH TAB
    // ==========================================
    // Cari tombol user (a tag yang ngarah ke dashboard)
    const userBtn = document.querySelector('a[href="/member/dashboard"]');
    
    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop redirect ke halaman!
            loginModal.classList.add('active'); // Buka modal aja
        });
    }

    const closeLoginBtn = loginModal.querySelector('.close-login-modal');
    closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });

    // Fitur ganti tab Social vs Password
    const loginTabs = loginModal.querySelectorAll('.login-tab');
    const loginContents = loginModal.querySelectorAll('.login-tab-content');
    
    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Hapus class active dari semua tab dan sembunyikan semua konten
            loginTabs.forEach(t => t.classList.remove('active'));
            loginContents.forEach(c => c.style.display = 'none');
            
            // Aktifkan tab yang diklik
            tab.classList.add('active');
            loginModal.querySelector('#' + tab.dataset.target).style.display = 'block';
        });
    });

    // Tutup kalau klik di luar kotak modal
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
        // Tutup dropdown kalau ngeklik di luar area input & dropdown
        document.addEventListener('click', (e) => {
            if (!searchInputLive.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
});
