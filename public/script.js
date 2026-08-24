document.addEventListener('DOMContentLoaded', () => {
    // Efek sticky navbar saat di-scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
            navbar.style.background = 'rgba(30, 29, 43, 0.95)'; // Transparan dikit
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'var(--bg-surface)';
        }
    });

    // Interaksi simple ganti tab 'Daftar Populer'
    const popTabs = document.querySelectorAll('.popular-sidebar .tabs button');
    
    popTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Hapus class active dari semua tab
            popTabs.forEach(t => t.classList.remove('active'));
            // Tambah class active ke tab yang diklik
            this.classList.add('active');
            
            // Di sini lo bisa tambahin logic AJAX buat fetch data komik beneran coy
            console.log(`Tab ${this.innerText} diklik!`);
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // 1. Efek sticky navbar saat di-scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
            navbar.style.background = 'rgba(30, 29, 43, 0.95)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'var(--bg-main)';
        }
    });

    // 2. Interaksi Tombol Search & Hamburger Mobile Menu
    const searchBtn = document.querySelector('.nav-right .icon-btn:nth-child(1)'); // Tombol Search
    const menuBtn = document.querySelector('.menu-btn'); // Tombol Hamburger

    // Buat elemen modal search secara dinamis jika belum ada di HTML
    let searchModal = document.querySelector('.global-search-modal');
    if (!searchModal) {
        searchModal = document.createElement('div');
        searchModal.className = 'global-search-modal';
        searchModal.innerHTML = `
            <div class="search-modal-content">
                <form action="/pustaka" method="GET">
                    <input type="text" name="q" placeholder="Ketik judul komik yang ingin dicari..." autocomplete="off">
                    <button type="submit"><i class="fas fa-search"></i></button>
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

    // Logika Buka/Tutup Modal Search
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

    // Logika Buka/Tutup Mobile Menu (Hamburger)
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    const closeMenu = mobileMenu.querySelector('.close-mobile-menu');
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});
