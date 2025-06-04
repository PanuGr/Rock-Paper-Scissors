const CACHE_NAME = "rps-cache-v1.4";
const urlsToCache = [
  "/Rock-Paper-Scissors/",
  "/Rock-Paper-Scissors/index.html",
  "/Rock-Paper-Scissors/main.js",
  "/Rock-Paper-Scissors/modules/playerName.js",
  "/Rock-Paper-Scissors/modules/scoreboard.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
];
// Install event: cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching...');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache', error);
      })
  );
});

// Activate event: cleanup old caches if any
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});

// Fetch event: serve cached content when offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
