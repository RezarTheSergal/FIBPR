// =====================================================================
// SERVICE WORKER - PWA Notes App
// Практическое занятие 13: Service Worker для офлайн-доступа
// =====================================================================

const CACHE_NAME = 'pwa-notes-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// === Жизненный цикл Service Worker ===

// Событие install - кэшируем необходимые ресурсы
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Skipping waiting, activating immediately');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Событие activate - очищаем старые кэши
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// === Функциональные события ===

// Событие fetch - перехватываем сетевые запросы
self.addEventListener('fetch', event => {
  const { request } = event;

  // Игнорируем non-GET запросы (POST, PUT, DELETE и т.д.)
  if (request.method !== 'GET') {
    return;
  }

  // Стратегия: кэш сначала, потом сеть (Cache First)
  // для статических ресурсов
  if (isStaticAsset(request.url)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            console.log('[Service Worker] Cache hit:', request.url);
            return response;
          }

          // Если нет в кэше, загружаем из сети
          return fetch(request)
            .then(response => {
              // Не кэшируем, если ответ не успешен
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }

              // Клонируем ответ для кэширования
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              console.log('[Service Worker] Offline - returning cached or fallback');
              // Если оба не сработали, возвращаем кэшированный ответ
              return caches.match(request)
                .then(response => response || new Response('Offline', { status: 503 }));
            });
        })
    );
  }

  // Стратегия: сеть сначала, потом кэш (Network First)
  // для динамического контента и API
  event.respondWith(
    fetch(request)
      .then(response => {
        // Клонируем ответ для кэширования
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(request, responseClone);
          });
        return response;
      })
      .catch(() => {
        // Если сеть недоступна, используем кэш
        return caches.match(request)
          .then(response => {
            if (response) {
              return response;
            }
            // Если нет в кэше, возвращаем offline страницу
            return new Response('Offline - no cached response', { status: 503 });
          });
      })
  );
});

// === Push-уведомления ===
// Практическое занятие 16: WebSocket + Push

self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received');

  let notificationData = {
    title: 'PWA Заметки',
    options: {
      body: 'Вам пришло уведомление',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'notification',
      requireInteraction: false,
      actions: [
        { action: 'close', title: 'Закрыть' },
        { action: 'open', title: 'Открыть' }
      ]
    }
  };

  // Парсим данные из push-уведомления, если они есть
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        options: data.options || notificationData.options
      };
    } catch (e) {
      notificationData.options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

// === Обработка действий в уведомлениях ===
// Практическое занятие 17: Детализация Push

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event.action);

  const notification = event.notification;

  if (event.action === 'snooze') {
    // Откладываем напоминание на 5 минут
    notification.close();
    
    setTimeout(() => {
      self.registration.showNotification(
        notification.title,
        {
          ...notification,
          body: notification.options.body + ' (отложено)',
          actions: notification.options.actions
        }
      );
    }, 5 * 60 * 1000); // 5 минут

    // Отправляем сообщение в окно приложения
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'REMINDER_SNOOZED',
            reminderId: notification.tag
          });
        });
      })
    );
  } else if (event.action === 'close' || !event.action) {
    notification.close();
    
    // Открываем приложение в окне или вкладке
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Ищем уже открытое окно приложения
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }

        // Если окно не найдено, открываем новое
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Событие notificationclose - когда пользователь закрывает уведомление
self.addEventListener('notificationclose', event => {
  console.log('[Service Worker] Notification closed');
  // Можно отправить аналитику или удалить напоминание
});

// === Сообщения от клиента ===

self.addEventListener('message', event => {
  const { type, data } = event.data;

  console.log('[Service Worker] Message received:', type);

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(CACHE_NAME)
          .then(() => {
            console.log('[Service Worker] Cache cleared');
            return event.ports[0].postMessage({ success: true });
          })
      );
      break;

    case 'GET_CACHE_STATS':
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            return cache.keys().then(requests => {
              event.ports[0].postMessage({
                cachedAssets: requests.length
              });
            });
          })
      );
      break;

    default:
      console.log('[Service Worker] Unknown message type:', type);
  }
});

// === Фоновая синхронизация ===
// Практическое занятие 13: События жизненного цикла

self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-notes') {
    event.waitUntil(
      // Синхронизируем заметки с сервером
      fetch('/api/notes')
        .then(response => response.json())
        .then(notes => {
          // Сохраняем синхронизированные заметки
          return caches.open(CACHE_NAME)
            .then(cache => {
              cache.put('/api/notes', new Response(JSON.stringify(notes)));
            });
        })
        .catch(error => {
          console.error('[Service Worker] Background sync failed:', error);
          throw error; // Retry
        })
    );
  }
});

// === Вспомогательные функции ===

/**
 * Проверяет, является ли URL статическим ресурсом
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ico'];
  return staticExtensions.some(ext => url.includes(ext)) || 
         url.includes('/icons/') ||
         url.includes('/css/');
}

/**
 * Функция для логирования в фоновом потоке
 */
function logToServer(message, level = 'info') {
  if (level === 'error') {
    console.error('[Service Worker]', message);
  } else {
    console.log('[Service Worker]', message);
  }
}

// Инициализация Service Worker
console.log('[Service Worker] Initialized');
