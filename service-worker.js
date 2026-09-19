const CACHE_NAME = "tattoo-v3";
const APP_SHELL = ["./","./index.html","./chat.html","./memories.html","./style.css","./app.js","./manifest.json","./icon.svg","./notifications.js"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  event.waitUntil(self.registration.showNotification(data.title || "💗 Tattoo", {
    body: data.body || "Something new is waiting for you.",
    icon: "./icon.svg",
    badge: "./icon.svg",
    tag: data.tag || "tattoo",
    renotify: true,
    data: { url: data.url || "./" }
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
    for (const client of clientList) {
      if ("focus" in client) { client.navigate(target); return client.focus(); }
    }
    return clients.openWindow(target);
  }));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname.includes("supabase.co")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(async response => {
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;
      const html = await response.text();
      const patched = html.includes("notifications.js") ? html : html.replace(/<\/body>/i, '<script src="./notifications.js"></script></body>');
      const result = new Response(patched, { status: response.status, statusText: response.statusText, headers: response.headers });
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, result.clone());
      return result;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html"))));
    return;
  }

  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html"))));
});
