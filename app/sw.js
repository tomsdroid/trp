const CACHE_NAME = "theralog-v5"; // Naikkan ke v5 untuk memancing popup
const urlsToCache = [
  "./",
  "./onboarding.html",
  "./login.html",
  "./index.html",
  "./riwayat.html",       
  "./recap.html",         
  "./pengaturan.html",
  "./edit-profil.html",   
  "./ubah-pin.html",      
  "./kebijakan-privasi.html",
  "./syarat-ketentuan.html",
  "./css/style.css",
  "./js/db.js",
  "./js/script.js",       
  "./manifest.json",
  "./favicon-96x96.png"
];

const cdnToCache = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
];

self.addEventListener("install", event => {
  // KITA HAPUS self.skipWaiting() DI SINI
  // Biarkan dia menunggu instruksi dari tombol Popup
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
  if (event.request.method !== 'GET') return; 
  if (event.request.url.includes("script.google.com") || event.request.url.includes("api.github.com")) return;

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
      keys.map(k => k !== CACHE_NAME && caches.delete(k)) 
    )).then(() => self.clients.claim()) 
  );
});

// MENERIMA PESAN DARI TOMBOL "UPDATE" DI HTML
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting(); // Memaksa hapus cache lama dan pakai yang baru
  }
});
