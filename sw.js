/* ============================================================
   SERVICE WORKER — Xarajatlarim v6.0.0
   ============================================================ */

   var CACHE = "xarajatlarim-v6.0.0";
   var ASSETS = [
     "./",
     "./index.html",
     "./manifest.json"
   ];
   
   /* ============================================================
      INSTALL
      ============================================================ */
   self.addEventListener("install", function (e) {
     e.waitUntil(
       caches.open(CACHE).then(function (cache) {
         // Har bir assetni alohida qo'shish (biri topilmasa, qolganlari qo'shiladi)
         return Promise.all(
           ASSETS.map(function (url) {
             return cache.add(url).catch(function () {});
           })
         );
       }).catch(function () {})
     );
     self.skipWaiting();
   });
   
   /* ============================================================
      ACTIVATE — eski keshlarni o'chirish
      ============================================================ */
   self.addEventListener("activate", function (e) {
     e.waitUntil(
       caches.keys().then(function (keys) {
         return Promise.all(
           keys.filter(function (k) { return k !== CACHE; })
               .map(function (k) { return caches.delete(k); })
         );
       }).catch(function () {})
     );
     self.clients.claim();
   });
   
   /* ============================================================
      FETCH — cache first, network fallback
      ============================================================ */
   self.addEventListener("fetch", function (e) {
     // Faqat GET so'rovlar
     if (e.request.method !== "GET") return;
   
     // Faqat o'z domenimiz
     var url;
     try {
       url = new URL(e.request.url);
     } catch (err) {
       return;
     }
     if (url.origin !== self.location.origin) return;
   
     e.respondWith(
       caches.match(e.request).then(function (cached) {
         // 1. Cache'da bo'lsa — qaytarish
         if (cached) return cached;
   
         // 2. Cache'da yo'q — network'dan olish
         return fetch(e.request).then(function (res) {
           if (res && res.ok) {
             var copy = res.clone();
             caches.open(CACHE).then(function (c) {
               c.put(e.request, copy).catch(function () {});
             }).catch(function () {});
           }
           return res;
         }).catch(function () {
           // 3. Offline — index.html qaytarish
           return caches.match("./index.html");
         });
       })
     );
   });