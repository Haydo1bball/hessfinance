// Hess Finance service worker. Only handles notifications; it caches nothing,
// so the app always loads fresh code and data.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : "" }; }
  const title = d.title || "Hess Finance";
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "hess",
    data: { url: d.url || "./" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // only ever open pages inside Hess Finance, never another website
  let url = self.registration.scope;
  try {
    const u = new URL((event.notification.data && event.notification.data.url) || "./", self.registration.scope).href;
    if (u.startsWith(self.registration.scope)) url = u;
  } catch (e) {}
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) {
        await w.focus();
        try { await w.navigate(url); } catch (e) { w.postMessage({ open: url }); }
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
