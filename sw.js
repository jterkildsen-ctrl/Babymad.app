// Service worker: gør appen tilgængelig offline på iPad'en.
// Strategi: prøv altid netværket først (så man får det nyeste), og fald tilbage
// til det, der er gemt i cachen, hvis der ikke er internetforbindelse.
//
// VIGTIGT: Hvis der tilføjes/omdøbes filer i appen, så husk at opdatere listen
// nedenfor OG bumpe CACHE_NAVN (fx til "babymad-cache-v2"), så browseren henter
// den nye version i stedet for at blive ved med den gamle cache.

const CACHE_NAVN = "babymad-cache-v2";

const PRECACHE_FILER = [
  "./",
  "index.html",
  "opskrifter.html",
  "opskrift.html",
  "koeleskab.html",
  "indkoeb.html",
  "ugeplan.html",
  "indstillinger.html",
  "koekkenvisning.html",
  "style.css",
  "app.js",
  "data.js",
  "favoritter.js",
  "indkoebsliste.js",
  "ingrediens-koeb.js",
  "koeleskab.js",
  "indkoeb.js",
  "opskrifter.js",
  "opskrift.js",
  "ugeplan.js",
  "indstillinger.js",
  "koekkenvisning.js",
  "manifest.json",
  "data/recipes.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-512-maskable.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAVN)
      .then((cache) => cache.addAll(PRECACHE_FILER))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((navne) => Promise.all(navne.filter((navn) => navn !== CACHE_NAVN).map((navn) => caches.delete(navn))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((svar) => {
        const kopi = svar.clone();
        caches.open(CACHE_NAVN).then((cache) => cache.put(event.request, kopi));
        return svar;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
