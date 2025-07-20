// Service Worker desativado (sem registro e sem cache)

// const CACHE_NAME = 'scannerqq-cache-v2'; // Não necessário sem o Service Worker
// const urlsToCache = [
//   '.',
//   './index.html',
//   './js/scan.js',
//   './styles.css',
//   'https://cdn.jsdelivr.net/npm/@zxing/library@0.18.6/umd/index.min.js',
//   './dados/produtos.json'
// ];

// Evento de instalação do Service Worker (agora não será usado)
// self.addEventListener('install', event => {
//   console.log('Service Worker Instalado...');
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(cache => {
//       console.log('Arquivos sendo armazenados em cache durante a instalação');
//       return cache.addAll(urlsToCache);  // Não será mais executado
//     })
//   );
// });

// Evento de ativação do Service Worker (agora não será usado)
// self.addEventListener('activate', event => {
//   console.log('Service Worker Ativado...');
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return Promise.all(
//         cacheNames.map(cacheName => {
//           if (cacheName !== CACHE_NAME) {
//             console.log('Excluindo cache antigo', cacheName);
//             return caches.delete(cacheName);  // Não será mais executado
//           }
//         })
//       );
//     })
//   );
// });

// Evento de captura das requisições (fetch) e gerenciamento do cache (não será mais executado)
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(response => {
//       return response || fetch(event.request).then(networkResponse => {
//         caches.open(CACHE_NAME).then(cache => {
//           cache.put(event.request, networkResponse.clone());  // Não será mais executado
//         });
//         return networkResponse;
//       });
//     })
//   );
// });
