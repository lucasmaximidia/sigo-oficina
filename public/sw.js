// Service worker só para push notifications — SIGO Oficina não é um PWA
// offline-first (sem cache de assets/rotas), então não há nada de
// install/activate/fetch aqui além do necessário pra registrar o worker.

self.addEventListener("push", (event) => {
  let data = { title: "SIGO Oficina", body: "" };
  try {
    if (event.data) data = event.data.json();
  } catch {
    data.body = event.data ? event.data.text() : "";
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192",
      badge: "/icon-192",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).pathname === url && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
