// kodnas.de — minimalni service worker (samo da PWA bude instalabilan).
// NAMJERNO bez keširanja sadržaja, da vijesti nikad ne budu zastarjele.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => Response.error()));
});
