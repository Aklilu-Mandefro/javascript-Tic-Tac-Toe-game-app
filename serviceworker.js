self.addEventListener('install', function(e) {
    e.waitUntil(
      caches.open('v1.3').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/scripts/game.js',
          '/css/style.css',
          '/assets/icons/hamburger_icon.svg',
          '/assets/favicons/favicon.ico',
          '/assets/favicons/android-chrome-192x192.png',
          '/assets/favicons/android-chrome-512x512.png',
          '/assets/favicons/apple-touch-icon.png',
          '/assets/favicons/favicon-16x16.png',
          '/assets/favicons/favicon-32x32.png',
          '/site.webmanifest'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    console.log(event.request.url);
   
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  
  const deleteCache = async (key) => {
    await caches.delete(key);
  };
  
  const deleteOldCaches = async () => {
    const cacheKeepList = ["v1.3"];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(deleteCache));
  };
  
  self.addEventListener("activate", (event) => {
    event.waitUntil(deleteOldCaches());
  });
  