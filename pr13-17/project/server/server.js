const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// VAPID ключи (генерируются командой: npx web-push generate-vapid-keys)
const vapidKeys = {
  publicKey: 'BMjh_J1gF91170v8EU1L6c0v4ZZhqjmIE74i8UU1ARa3upLseE3hFBZ0XMbNGIS8aYEzJb9rWYf5RHAtxWH7l4o',
  privateKey: 'qlvJeOw_ekP2tyjzGeN7oqwh4uHdNl8BJpVZw0alJew'
};

webpush.setVapidDetails(
  'mailto:admin@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Хранилище подписок
let subscriptions = [];

// === REST Endpoints ===

// Получить публичный VAPID ключ
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Сохранить подписку на push-уведомления
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  
  // Проверяем, не существует ли уже такая подписка
  const exists = subscriptions.some(sub => 
    JSON.stringify(sub) === JSON.stringify(subscription)
  );
  
  if (!exists) {
    subscriptions.push(subscription);
  }
  
  res.status(201).json({ success: true });
});

// Удалить подписку
app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  res.json({ success: true });
});

// Получить все активные подписки (для отладки)
app.get('/api/subscriptions/count', (req, res) => {
  res.json({ count: subscriptions.length });
});

// === WebSocket Events ===

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Событие добавления заметки
  socket.on('newTask', async (noteData) => {
    console.log('New task received:', noteData);
    
    // Отправляем событие всем подключенным клиентам
    io.emit('taskAdded', {
      id: noteData.id,
      text: noteData.text,
      reminder: noteData.reminder,
      timestamp: new Date()
    });

    // Отправляем push-уведомления всем подписанным пользователям
    if (subscriptions.length > 0) {
      const notificationTitle = 'Новая заметка';
      const notificationOptions = {
        body: `"${noteData.text}"`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'new-note',
        requireInteraction: false
      };

      // Если есть напоминание, добавляем информацию о нем
      if (noteData.reminder) {
        const reminderDate = new Date(noteData.reminder);
        notificationOptions.body += ` (Напоминание: ${reminderDate.toLocaleString()})`;
      }

      subscriptions.forEach(subscription => {
        webpush.sendNotification(subscription, JSON.stringify({
          title: notificationTitle,
          options: notificationOptions
        }))
        .catch(error => {
          console.error('Error sending push notification:', error);
          // Удаляем невалидную подписку
          if (error.statusCode === 410) {
            subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
          }
        });
      });
    }
  });

  // Событие удаления заметки
  socket.on('taskDeleted', (noteId) => {
    io.emit('taskRemoved', { id: noteId });
  });

  // Событие отложить напоминание
  socket.on('snoozeReminder', (data) => {
    io.emit('reminderSnoozed', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// === Запуск сервера ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket готов к подключениям`);
  console.log(`⚠️  Измените VAPID ключи перед использованием в продакшене!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
