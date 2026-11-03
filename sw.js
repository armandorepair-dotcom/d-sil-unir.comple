const CACHE = 'letra-d-v1';
const ARCHIVOS = ['./','./index.html','./manifest.json','./apps/unir.html','./apps/duende.html','./apps/barco.html','./icons/icon-192.png','./icons/icon-512.png'];
const EXTERNOS = ['https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Open+Sans:wght@600;800&family=Pacifico&display=swap',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Quicksand:wght@500;700&display=swap'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(ARCHIVOS);
    // Recursos externos: si alguno falla, no se cancela la instalación
    await Promise.all(EXTERNOS.map(u => fetch(u, {mode:'no-cors'}).then(r => c.put(u, r)).catch(()=>{})));
  }).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: new URL(e.request.url).origin === location.origin });
    const red = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(e.request, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(red); return hit; }
    return (await red) || new Response('Sin conexión', { status: 503 });
  })());
});
