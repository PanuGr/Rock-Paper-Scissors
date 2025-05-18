const CACHE_NAME = "rps-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/main.js",
  "/modules/playerName.js",
  "/modules/scoreboard.js"
  // Add additional files you want cached for offline use (CSS, JS, icons, etc.)
];

// Install event: cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
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