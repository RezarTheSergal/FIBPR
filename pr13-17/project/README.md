# 📝 PWA Заметки - Progressive Web App

Полнофункциональное веб-приложение для управления заметками с поддержкой **offline**, **WebSocket** для real-time синхронизации и **push-уведомлений**.

## 🎓 Практические занятия (PR13-17)

Это приложение объединяет все практические задания по фронтенд и бэкенд разработке:

- **PR13**: Service Worker - офлайн-кэширование и work offline
- **PR14**: Web App Manifest - установка как приложение
- **PR15**: HTTPS + App Shell - быстрая загрузка интерфейса
- **PR16**: WebSocket + Push - синхронизация в реальном времени
- **PR17**: Напоминания - планирование push-уведомлений

## 🚀 Технологический стек

### Frontend
- HTML5 с семантической разметкой
- **SASS** (вместо Tailwind) для стилизации
- Vanilla JavaScript (без фреймворков)
- Service Worker для offline-режима
- Web App Manifest для PWA

### Backend
- Node.js + Express.js
- Socket.io для WebSocket
- web-push для push-уведомлений
- body-parser + CORS

### PWA Features
- ✅ Service Worker (кэширование, offline)
- ✅ Web App Manifest (установка)
- ✅ App Shell архитектура
- ✅ WebSocket (real-time)
- ✅ Push Notifications
- ✅ LocalStorage (persistent data)

## 📦 Установка

### Предварительные требования
- Node.js 14+ и npm
- Modern браузер (Chrome, Firefox, Edge, Safari 12+)

### Шаг 1: Установка зависимостей

```bash
cd project
npm install
```

### Шаг 2: Генерация VAPID ключей для push-уведомлений

```bash
npx web-push generate-vapid-keys
```

Скопируйте ключи и обновите файл `server/server.js`:

```javascript
const vapidKeys = {
  publicKey: 'ВАША_ПУБЛИЧНЫЙ_КЛЮЧ',
  privateKey: 'ВАШ_ПРИВАТНЫЙ_КЛЮЧ'
};
```

### Шаг 3: Компилирование SASS в CSS

```bash
npm run sass:build
```

Или для watch mode:

```bash
npm run sass
```

### Шаг 4: Запуск сервера

```bash
npm start
```

Или в режиме разработки с автоперезагрузкой:

```bash
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:3000**

## 🔒 HTTPS для локальной разработки (опционально)

Для полной поддержки всех PWA функций требуется HTTPS. Используйте `mkcert`:

### Windows (Chocolatey)
```bash
choco install mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### macOS (Homebrew)
```bash
brew install mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### Linux
```bash
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

Затем запустите сервер с HTTPS:
```bash
http-server --ssl --cert localhost.pem --key localhost-key.pem -p 3000
```

## 🎯 Основные функции

### 1️⃣ Управление Заметками
- Добавление новых заметок
- Просмотр списка заметок
- Отметить как выполненную
- Удаление заметок
- Работает в офлайн-режиме

### 2️⃣ Напоминания
- Установка время для напоминания
- Автоматические push-уведомления в нужное время
- Откладывание напоминаний на 5+ минут
- Сохранение в localStorage

### 3️⃣ Синхронизация в реальном времени
- WebSocket соединение через Socket.io
- Автоматическое обновление при добавлении заметок
- Real-time события между клиентами
- Graceful fallback на HTTP polling

### 4️⃣ Push-уведомления
- Подписка на уведомления
- Отправка при добавлении заметок
- Действия в уведомлениях (snooze, close)
- Работает даже при закрытом приложении

### 5️⃣ Офлайн-поддержка
- Service Worker кэширует всё
- Работа без интернета
- Фоновая синхронизация при возврате в сеть
- App Shell для мгновенной загрузки

### 6️⃣ Установка как приложение
- Кнопка "Установить приложение"
- Домашний экран / меню приложений
- Полноэкранный режим
- Собственные иконки и тема

## 📁 Структура проекта

```
project/
├── public/
│   ├── index.html           # Главная страница (App Shell)
│   ├── manifest.json        # Web App Manifest
│   ├── css/
│   │   └── main.css         # Скомпилированные стили
│   ├── js/
│   │   ├── app.js          # Основное приложение
│   │   └── sw.js           # Service Worker
│   └── icons/
│       ├── icon-192.svg     # Иконка 192x192
│       ├── icon-512.svg     # Иконка 512x512
│       └── favicon.svg      # Favicon
├── server/
│   ├── server.js           # Express сервер
│   └── styles/
│       └── main.scss       # SASS стили
├── package.json            # Зависимости
└── README.md              # Этот файл
```

## 🔧 Скрипты npm

```bash
npm start           # Запуск сервера
npm run dev         # Запуск с nodemon (автоперезагрузка)
npm run sass        # Компилирование SASS в watch mode
npm run sass:build  # Однократное компилирование SASS
```

## 🧪 Тестирование функций

### Офлайн-режим
1. Откройте приложение в браузере
2. В DevTools (F12) → Application → Service Workers → проверьте регистрацию
3. В DevTools → Network → Offline → перезагрузитесь
4. Приложение должно работать!

### Push-уведомления
1. На странице "Возможности" нажмите "Подписаться на уведомления"
2. Разрешите браузеру отправлять уведомления
3. Добавьте заметку → получите push-уведомление

### WebSocket
1. Откройте приложение в двух вкладках
2. Добавьте заметку в одной → она появится в другой вкладке в реальном времени

### Установка приложения
1. В адресной строке должна появиться кнопка "Установить аппликацию"
2. На мобильных устройствах работает через меню браузера
3. Приложение доступно с домашнего экрана / меню приложений

## 🐛 Отладка

### Консоль разработчика

В консоли доступен объект `appDebug`:

```javascript
// Получить все заметки
appDebug.loadNotes()

// Получить все напоминания
appDebug.loadReminders()

// Очистить все заметки
appDebug.clearAllNotes()

// Очистить все напоминания
appDebug.clearAllReminders()
```

### DevTools
- **Application** → **Service Workers** - статус Service Worker
- **Application** → **Manifest** - содержание манифеста
- **Application** → **Storage** → **Local Storage** - сохранённые данные
- **Console** - логи приложения и Service Worker

## 📊 Поддержка браузерами

| Функция | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ 40+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| Web App Manifest | ✅ 39+ | ⚠️ 57+ | ✅ 15+ | ✅ 79+ |
| Push API | ✅ 50+ | ✅ 48+ | ⚠️ 16+ | ✅ 17+ |
| WebSocket | ✅ All | ✅ All | ✅ All | ✅ All |
| IndexedDB | ✅ All | ✅ All | ✅ All | ✅ All |

## 📚 Дополнительные ресурсы

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN: WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)

## 👨‍🏫 Преподаватели

- **Загородних Николай Анатольевич**
- **Краснослободцева Дарья Борисовна**

Кафедра: Индустриального программирования  
Дисциплина: Фронтенд и бэкенд разработка  
Семестр: 4 семестр, 2025/2026 учебный год

## 📝 Лицензия

Этот проект создан в образовательных целях.

## 🤝 Благодарности

Спасибо всем, кто помогал в разработке и тестировании этого приложения!

---

**Версия:** 1.0.0  
**Последнее обновление:** 2025-04-13  
**Статус:** ✅ Production Ready
