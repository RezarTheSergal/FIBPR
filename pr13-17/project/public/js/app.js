// =====================================================================
// MAIN APP JAVASCRIPT - PWA Notes App
// =====================================================================

/**
 * Глобальное состояние приложения
 */
const app = {
  // WebSocket соединение
  socket: null,
  
  // Service Worker регистрация
  swRegistration: null,
  
  // Состояние онлайна
  isOnline: navigator.onLine,
  
  // Push подписка
  pushSubscription: null,
  
  // Идентификатор установки
  installPrompt: null,
  
  // Готовы ли все функции
  ready: false
};

/**
 * Инициализация приложения при загрузке DOM
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Инициализация приложения...');
  
  try {
    // 1. Компилируем SASS в CSS (на стороне сервера)
    // 2. Регистрируем Service Worker
    await registerServiceWorker();
    
    // 3. Инициализируем UI
    initializeUI();
    
    // 4. Инициализируем функции
    initNotes();
    initReminders();
    initPushNotifications();
    initWebSocket();
    
    // 5. Проверяем возможность установки приложения
    setupInstallPrompt();
    
    // 6. Проверяем поддержку браузера
    checkBrowserSupport();
    
    // 7. Загружаем статус соединения
    updateConnectionStatus();
    
    app.ready = true;
    console.log('Приложение готово к использованию');
    
    showNotification('Добро пожаловать!', 'success');
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    showNotification('Ошибка инициализации приложения', 'error');
  }
});

// ========================================================================
// 1. SERVICE WORKER REGISTRATION (PR13)
// ========================================================================

/**
 * Регистрация Service Worker для офлайн-поддержки
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker не поддерживается в этом браузере');
    return;
  }

  try {
    app.swRegistration = await navigator.serviceWorker.register('/js/sw.js', {
      scope: '/'
    });

console.log('Service Worker зарегистрирован успешно');

    // Проверяем обновления каждый час
    setInterval(() => {
      app.swRegistration.update();
    }, 3600000);

    // Проверяем, есть ли обновления при запуске
    app.swRegistration.update();

    // Слушаем обновления Service Worker
    app.swRegistration.addEventListener('updatefound', () => {
      const newWorker = app.swRegistration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showNotification('Доступно обновление приложения', 'info', () => {
            window.location.reload();
          });
        }
      });
    });

    updateSWStatus('Активен');
  } catch (error) {
    console.error('Ошибка регистрации Service Worker:', error);
    updateSWStatus('Ошибка');
  }
}

/**
 * Обновляет статус Service Worker в UI
 */
function updateSWStatus(status) {
  const swStatusElement = document.getElementById('sw-status');
  if (swStatusElement) {
    swStatusElement.textContent = status;
    swStatusElement.className = 'badge ' + (status === 'Активен' ? 'success' : 'danger');
  }
}

// ========================================================================
// 2. WEB APP MANIFEST & INSTALL (PR14)
// ========================================================================

/**
 * Инициализация функции установки приложения
 */
function setupInstallPrompt() {
  // Событие beforeinstallprompt срабатывает, когда браузер готов предложить установку
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    app.installPrompt = e;

    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.classList.add('show');
      installBtn.addEventListener('click', () => {
        if (app.installPrompt) {
          app.installPrompt.prompt();
          app.installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('Пользователь принял установку приложения');
              showNotification('Приложение установлено!', 'success');
            } else {
              console.log('Пользователь отказался от установки');
            }
            app.installPrompt = null;
          });
        }
      });
    }
  });

  // Событие appinstalled срабатывает после успешной установки
  window.addEventListener('appinstalled', () => {
    console.log('PWA успешно установлено');
    app.installPrompt = null;
  });
}

// ========================================================================
// 3. CONNECTION STATUS & OFFLINE SUPPORT
// ========================================================================

/**
 * Обновляет статус соединения
 */
function updateConnectionStatus() {
  const connectionStatus = document.getElementById('connection-status');
  
  if (navigator.onLine) {
    app.isOnline = true;
    if (connectionStatus) {
      connectionStatus.classList.remove('offline');
      connectionStatus.classList.add('online');
      connectionStatus.querySelector('.status-text').textContent = 'Онлайн';
    }
    console.log('Соединение восстановлено');
  } else {
    app.isOnline = false;
    if (connectionStatus) {
      connectionStatus.classList.remove('online');
      connectionStatus.classList.add('offline');
      connectionStatus.querySelector('.status-text').textContent = 'Офлайн';
    }
    console.log('Соединение потеряно');
  }
}

// Слушаем события онлайн/офлайн
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// ========================================================================
// 4. NOTES MANAGEMENT (PR13-15: localStorage + offline)
// ========================================================================

/**
 * Инициализация функции управления заметками
 */
function initNotes() {
  const form = document.getElementById('note-form');
  const input = document.getElementById('note-input');
  const list = document.getElementById('notes-list');
  const clearBtn = document.getElementById('clear-notes-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();

      if (text) {
        addNote(text);
        input.value = '';
        input.focus();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Вы уверены? Все заметки будут удалены.')) {
        clearAllNotes();
      }
    });
  }

  loadNotes();
}

/**
 * Добавляет новую заметку
 */
function addNote(text, reminderId = null) {
  const notes = loadNotesFromStorage();
  const newNote = {
    id: Date.now(),
    text: text,
    reminder: reminderId,
    created: new Date().toISOString(),
    completed: false
  };

  notes.push(newNote);
  localStorage.setItem('notes', JSON.stringify(notes));

  // Отправляем через WebSocket, если соединение активно
  if (app.socket && app.socket.connected) {
    app.socket.emit('newTask', newNote);
  }

  renderNotes();
  updateNotesCount();

    console.log('Заметка добавлена:', newNote);
}

/**
 * Загружает заметки из хранилища и отображает их
 */
function loadNotes() {
  renderNotes();

  // Слушаем события обновления заметок через WebSocket
  if (window.addEventListener) {
    window.addEventListener('notesUpdated', renderNotes);
  }
}

/**
 * Отображает список заметок
 */
function renderNotes() {
  const notes = loadNotesFromStorage();
  const list = document.getElementById('notes-list');

  if (!list) return;

  if (notes.length === 0) {
    list.innerHTML = '<li class="list-item text-muted is-center"><p>Нет заметок. Добавьте первую заметку выше!</p></li>';
    return;
  }

  list.innerHTML = notes
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .map(note => {
      const date = new Date(note.created);
      const reminderInfo = note.reminder ? 
        `<br><small class="note-reminder">⏰ Напоминание установлено</small>` : '';

      return `
        <li class="note-item ${note.completed ? 'done' : ''}">
          <div class="note-content">
            <p class="note-text">${escapeHtml(note.text)}</p>
            <div class="note-meta">
              Добавлено: ${date.toLocaleString()}
              ${reminderInfo}
            </div>
          </div>
          <div class="note-actions">
            <button class="button secondary small" onclick="toggleNoteCompletion(${note.id})">
              ${note.completed ? '↩️' : '✓'}
            </button>
            <button class="button danger small" onclick="deleteNote(${note.id})">
              🗑️
            </button>
          </div>
        </li>
      `;
    })
    .join('');

  updateNotesCount();
}

/**
 * Удаляет заметку
 */
function deleteNote(id) {
  const notes = loadNotesFromStorage();
  const index = notes.findIndex(n => n.id === id);

  if (index !== -1) {
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));

    // Отправляем событие удаления через WebSocket
    if (app.socket && app.socket.connected) {
      app.socket.emit('taskDeleted', id);
    }

    renderNotes();
    console.log('Заметка удалена');
  }
}

/**
 * Переключает статус завершения заметки
 */
function toggleNoteCompletion(id) {
  const notes = loadNotesFromStorage();
  const note = notes.find(n => n.id === id);

  if (note) {
    note.completed = !note.completed;
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
  }
}

/**
 * Очищает все заметки
 */
function clearAllNotes() {
  localStorage.removeItem('notes');
  renderNotes();
    console.log('Все заметки удалены');
  showNotification('Все заметки удалены', 'info');
}

/**
 * Загружает заметки из localStorage
 */
function loadNotesFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('notes')) || [];
  } catch {
    return [];
  }
}

/**
 * Обновляет счётчик заметок
 */
function updateNotesCount() {
  const count = loadNotesFromStorage().length;
  const countElement = document.getElementById('notes-count');
  if (countElement) {
    countElement.textContent = count;
  }
}

// ========================================================================
// 5. REMINDERS MANAGEMENT (PR17)
// ========================================================================

/**
 * Инициализация функции управления напоминаниями
 */
function initReminders() {
  const form = document.getElementById('reminder-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const text = document.getElementById('reminder-text').value.trim();
      const timeStr = document.getElementById('reminder-time').value;

      if (text && timeStr) {
        const reminderTime = new Date(timeStr).getTime();
        if (reminderTime > Date.now()) {
          addNote(text, reminderTime);
          addReminder(text, reminderTime);
          renderReminders();
          form.reset();
          showNotification('Напоминание добавлено', 'success');
        } else {
          showNotification('Выберите время в будущем', 'error');
        }
      }
    });
  }

  loadReminders();
}

/**
 * Добавляет напоминание
 */
function addReminder(text, timeStamp) {
  const reminders = loadRemindersFromStorage();
  const reminder = {
    id: Date.now(),
    text: text,
    time: timeStamp,
    snoozed: false
  };

  reminders.push(reminder);
  localStorage.setItem('reminders', JSON.stringify(reminders));

  // Проверяем напоминания каждые 30 секунд
  scheduleReminderCheck(reminder);
}

/**
 * Загружает и отображает напоминания
 */
function loadReminders() {
  const reminders = loadRemindersFromStorage();

  reminders.forEach(reminder => {
    if (reminder.time > Date.now()) {
      scheduleReminderCheck(reminder);
    }
  });

  renderReminders();
}

/**
 * Отображает список напоминаний
 */
function renderReminders() {
  const reminders = loadRemindersFromStorage().filter(r => r.time > Date.now());
  const list = document.getElementById('reminders-list');

  if (!list) return;

  if (reminders.length === 0) {
    list.innerHTML = '<li class="list-item text-muted is-center"><p>Нет активных напоминаний. Добавьте первое выше!</p></li>';
  } else {
    list.innerHTML = reminders
      .sort((a, b) => a.time - b.time)
      .map(reminder => {
        const date = new Date(reminder.time);
        const now = new Date();
        const diffMinutes = Math.ceil((reminder.time - now) / 60000);

        let diffText = '';
        if (diffMinutes < 1) {
          diffText = 'Сейчас';
        } else if (diffMinutes < 60) {
          diffText = `через ${diffMinutes} мин`;
        } else {
          const diffHours = Math.ceil(diffMinutes / 60);
          diffText = `через ${diffHours} ч`;
        }

        return `
          <li class="note-item">
            <div class="note-content">
              <p class="note-text">${escapeHtml(reminder.text)}</p>
              <div class="note-meta">
                Время: ${date.toLocaleString()} (${diffText})
              </div>
            </div>
            <div class="note-actions">
              <button class="button warning small" onclick="snoozeReminder(${reminder.id}, 5)">
                5 мин
              </button>
              <button class="button danger small" onclick="deleteReminder(${reminder.id})">
                Отмена
              </button>
            </div>
          </li>
        `;
      })
      .join('');
  }

  updateRemindersCount();
}

/**
 * Планирует проверку напоминания
 */
function scheduleReminderCheck(reminder) {
  const timeUntilReminder = reminder.time - Date.now();

  if (timeUntilReminder > 0) {
    setTimeout(() => {
      triggerReminder(reminder);
    }, timeUntilReminder);
  }
}

/**
 * Срабатывает напоминание
 */
function triggerReminder(reminder) {
  console.log('Срабатывает напоминание:', reminder.text);

  // Отправляем push-уведомление
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Напоминание', {
        body: reminder.text,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
        actions: [
          { action: 'snooze', title: 'Отложить на 5 мин' },
          { action: 'close', title: 'Закрыть' }
        ]
      });
    });
  }

  // Играем звук уведомления
  playNotificationSound();

  // Удаляем напоминание после срабатывания
  setTimeout(() => {
    deleteReminder(reminder.id);
  }, 1000);
}

/**
 * Откладывает напоминание на N минут
 */
function snoozeReminder(id, minutes) {
  const reminders = loadRemindersFromStorage();
  const reminder = reminders.find(r => r.id === id);

  if (reminder) {
    reminder.time = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('reminders', JSON.stringify(reminders));

    if (app.socket && app.socket.connected) {
      app.socket.emit('snoozeReminder', { id, minutes });
    }

    scheduleReminderCheck(reminder);
    renderReminders();
    showNotification(`Напоминание отложено на ${minutes} мин`, 'info');
  }
}

/**
 * Удаляет напоминание
 */
function deleteReminder(id) {
  let reminders = loadRemindersFromStorage();
  reminders = reminders.filter(r => r.id !== id);
  localStorage.setItem('reminders', JSON.stringify(reminders));
  renderReminders();
}

/**
 * Загружает напоминания из хранилища
 */
function loadRemindersFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('reminders')) || [];
  } catch {
    return [];
  }
}

/**
 * Обновляет счётчик напоминаний
 */
function updateRemindersCount() {
  const count = loadRemindersFromStorage().filter(r => r.time > Date.now()).length;
  const countElement = document.getElementById('reminders-count');
  if (countElement) {
    countElement.textContent = count;
  }
}

// ========================================================================
// 6. WEBSOCKET & REAL-TIME (PR16)
// ========================================================================

/**
 * Инициализация WebSocket соединения для real-time функций
 */
function initWebSocket() {
  if (typeof io === 'undefined') {
    console.warn('⚠️ Socket.io не загружена');
    return;
  }

  app.socket = io({
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  // События соединения
  app.socket.on('connect', () => {
    console.log('WebSocket соединение установлено');
    updateConnectionStatus();
    showNotification('Соединение восстановлено', 'success');
  });

  app.socket.on('disconnect', () => {
    console.log('WebSocket соединение потеряно');
    updateConnectionStatus();
  });

  // Событие добавления заметки через WebSocket
  app.socket.on('taskAdded', (task) => {
    console.log('📩 Новая заметка получена через WebSocket:', task);
    // Обновляем UI, если заметка не добавлена нами
    renderNotes();
  });

  // Событие удаления заметки
  app.socket.on('taskRemoved', (data) => {
    console.log('📤 Заметка удалена:', data.id);
    renderNotes();
  });

  // Событие отложения напоминания
  app.socket.on('reminderSnoozed', (data) => {
    console.log('⏰ Напоминание отложено:', data);
    renderReminders();
  });

  // Ошибки соединения
  app.socket.on('error', (error) => {
    console.error('❌ Ошибка WebSocket:', error);
  });
}

// ========================================================================
// 7. PUSH NOTIFICATIONS (PR16-17)
// ========================================================================

/**
 * Инициализация push-уведомлений
 */
function initPushNotifications() {
  const subscribePushBtn = document.getElementById('subscribe-push-btn');

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push API не поддерживается');
    updatePushStatus('не поддерживается');
    return;
  }

  updatePushStatus('Поддерживается');

  if (subscribePushBtn) {
    subscribePushBtn.addEventListener('click', async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Проверяем, есть ли уже подписка
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          // Отписываемся
          await unsubscribeFromPush(subscription);
          subscribePushBtn.textContent = '🔔 Подписаться на уведомления';
          showNotification('Вы отписались от уведомлений', 'info');
        } else {
          // Подписываемся
          await subscribeForPush(registration);
          subscribePushBtn.textContent = '🔕 Отписаться от уведомлений';
          showNotification('Вы подписались на уведомления', 'success');
        }
      } catch (error) {
        console.error('Ошибка управления push подпиской:', error);
        showNotification('Ошибка при управлении подпиской', 'error');
      }
    });

    // Проверяем текущий статус подписки
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        subscribePushBtn.textContent = '🔕 Отписаться от уведомлений';
      }
    });
  }
}

/**
 * Подписывает пользователя на push-уведомления
 */
async function subscribeForPush(registration) {
  try {
    // Получаем публичный VAPID ключ
    const response = await fetch('/api/vapid-public-key');
    const data = await response.json();

    // Подписываемся на push-уведомления
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey)
    });

    // Отправляем подписку на сервер
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    console.log('Подписка на push-уведомления успешна');
  } catch (error) {
    console.error('❌ Ошибка подписки:', error);
    throw error;
  }
}

/**
 * Отписывает пользователя от push-уведомлений
 */
async function unsubscribeFromPush(subscription) {
  try {
    // Отправляем запрос на удаление подписки на сервер
    await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });

    // Отписываемся локально
    await subscription.unsubscribe();

    console.log('Отписка от push-уведомлений успешна');
  } catch (error) {
    console.error('Ошибка отписки:', error);
    throw error;
  }
}

/**
 * Преобразует base64 строку в Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Обновляет статус Push API в UI
 */
function updatePushStatus(status) {
  const pushStatusElement = document.getElementById('browser-push');
  if (pushStatusElement) {
    const className = status === 'Поддерживается' ? 'success' : 'danger';
    pushStatusElement.textContent = status;
    pushStatusElement.className = `badge ${className}`;
  }
}

// ========================================================================
// 8. UI INITIALIZATION
// ========================================================================

/**
 * Инициализация интерфейса приложения
 */
function initializeUI() {
  // Инициализация навигации
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.dataset.page + '-page';

      // Убираем активный класс со всех элементов
      navItems.forEach(nav => nav.classList.remove('active'));
      pages.forEach(page => page.classList.remove('active'));

      // Добавляем активный класс текущему элементу
      item.classList.add('active');
      const page = document.getElementById(pageId);
      if (page) {
        page.classList.add('active');
      }
    });
  });
}

// ========================================================================
// 9. BROWSER SUPPORT CHECK
// ========================================================================

/**
 * Проверяет поддержку технологий браузером
 */
function checkBrowserSupport() {
  // Service Worker
  const swBadge = document.getElementById('browser-sw');
  if (swBadge) {
    if ('serviceWorker' in navigator) {
      swBadge.textContent = '✓ Поддерживается';
      swBadge.className = 'badge success';
    } else {
      swBadge.textContent = '✗ Не поддерживается';
      swBadge.className = 'badge danger';
    }
  }

  // Push API
  const pushBadge = document.getElementById('browser-push');
  if (pushBadge) {
    if ('PushManager' in window) {
      pushBadge.textContent = '✓ Поддерживается';
      pushBadge.className = 'badge success';
    } else {
      pushBadge.textContent = '✗ Не поддерживается';
      pushBadge.className = 'badge danger';
    }
  }

  // IndexedDB
  const idbBadge = document.getElementById('browser-idb');
  if (idbBadge) {
    if ('indexedDB' in window) {
      idbBadge.textContent = '✓ Поддерживается';
      idbBadge.className = 'badge success';
    } else {
      idbBadge.textContent = '✗ Не поддерживается';
      idbBadge.className = 'badge danger';
    }
  }
}

// ========================================================================
// 10. NOTIFICATIONS & UTILITIES
// ========================================================================

/**
 * Показывает уведомление пользователю
 */
function showNotification(message, type = 'info', callback = null) {
  const container = document.getElementById('notifications-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="content">${escapeHtml(message)}</div>
    <button class="close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(notification);

  // Автоматически удаляем уведомление через 4 секунды
  const timeout = setTimeout(() => {
    notification.remove();
  }, 4000);

  notification.querySelector('.close').addEventListener('click', () => {
    clearTimeout(timeout);
    if (callback) callback();
  });
}

/**
 * Экранирует HTML-спецсимволы
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Воспроизводит звук уведомления
 */
function playNotificationSound() {
  // Используем Web Audio API для генерации простого звука
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn('⚠️ Не удалось воспроизвести звук:', e);
  }
}

// ========================================================================
// 11. SERVICE WORKER MESSAGE HANDLING
// ========================================================================

/**
 * Слушаем сообщения от Service Worker
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    const { type, reminderId } = event.data;

    if (type === 'REMINDER_SNOOZED') {
      console.log('Service Worker: Напоминание отложено:', reminderId);
      renderReminders();
    }
  });
}

// ========================================================================
// Export для использования в консоли
// ========================================================================

window.appDebug = {
  app,
  loadNotes: loadNotesFromStorage,
  loadReminders: loadRemindersFromStorage,
  clearAllNotes,
  clearAllReminders: () => {
    localStorage.removeItem('reminders');
    renderReminders();
  }
};

console.log('Используйте appDebug для отладки (например: appDebug.loadNotes())');
