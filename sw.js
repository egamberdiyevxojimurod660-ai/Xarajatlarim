// Service worker: ilovani internetsiz ham ochilishini ta'minlaydi
const KESH = "xarajatlar-v1";
const FAYLLAR = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(KESH).then(function (k) { return k.addAll(FAYLLAR); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (nomlar) {
    return Promise.all(nomlar.filter(function (n) { return n !== KESH; })
      .map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
});
