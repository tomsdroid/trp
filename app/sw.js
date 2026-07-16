const CACHE_NAME = "theralog-v2"; // <-- NAIKKAN JADI v2 AGAR HP TERAPIS UPDATE OTOMATIS
const urlsToCache = [
  "./",
  "./onboarding.html",
  "./login.html",
  "./index.html",
  "./riwayat.html",       // <-- DITAMBAHKAN
  "./recap.html",         // <-- DITAMBAHKAN
  "./pengaturan.html",
  "./edit-profil.html",   // <-- DITAMBAHKAN (Agar aman)
  "./ubah-pin.html",      // <-- DITAMBAHKAN (Agar aman)
  "./kebijakan-privasi.html",
  "./syarat-ketentuan.html",
  "./css/style.css",
  "./js/db.js",
  "./js/script.js",       // <-- WAJIB DITAMBAHKAN KARENA ADA LOGIKA UTAMA
  "./manifest.json",
  "./favicon-96x96.png"
];

const cdnToCache = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css",
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // Memaksa SW baru langsung aktif
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all([
        cache.addAll(urlsToCache),
        ...cdnToCache.map(url => cache.add(url).catch(()=>{}))
      ])
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if(event.request.destination === 'document'){
          return caches.match('./onboarding.html');
        }
      });
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME && caches.delete(k)) // Menghapus memori versi lama (v1)
    )).then(() => self.clients.claim()) // Memaksa ambil alih halaman
  );
});
