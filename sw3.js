const CACHE_NAME = 'reading-helper-v5';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// 不缓存 index.html，始终从网络获取最新版本
// 只在离线时作为后备
self.addEventListener('fetch', (event) => {
    // 不拦截 html 请求，让浏览器直接从网络加载
    if (event.request.url.endsWith('.html') || event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }
    // 其他资源（manifest 等）用 network-first
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
