# FIBPR - Практические Проекты

Этот репозиторий содержит 5 практических проектов для изучения веб-разработки. Каждый проект демонстрирует различные уровни сложности и технологии.

## Содержание

- [Обзор проектов](#обзор-проектов)
- [PR1 - Статическая HTML страница](#pr1--статическая-html-страница)
- [PR2 - Express сервер с CRUD](#pr2--express-сервер-с-crud)
- [PR3 - Документация API](#pr3--документация-api)
- [PR4 - Full-Stack приложение со Swagger](#pr4--full-stack-приложение-со-swagger)
- [PR5 - Full-Stack приложение](#pr5--full-stack-приложение)

---

## PR1 - HTML Страница с scss

### Описание
Простая статическая HTML страница с карточкой продукта. Демонстрирует базовую HTML структуру и стилизацию с использованием CSS и SCSS.

### Структура
```
pr1/
├── index.html       
├── pelmeni.avif    
├── source.scss      
└── styles.css      
```

### Как запустить
1. Откройте файл `pr1/index.html` в браузере

## PR2 - Express Сервер с CRUD

### Описание
Простой REST API сервер на Express.js с операциями CRUD (Create, Read, Update, Delete) для управления товарами. Демонстрирует базовую архитектуру backend приложения.

### Структура
```
pr2/
├── package.json     
├── script.js       
└── public/
    └── index.html   
```

### Как запустить

```bash
# Перейти в директорию PR2
cd pr2

# Установить зависимости (если еще не установлены)
npm install

# Запустить сервер
npm start
# или
node script.js
```

**Сервер запустится на:** `http://localhost:3000`

### API Эндпоинты

| Метод | Эндпоинт | Описание |
|:-----:|:---------|:--------|
| GET | `/` | Главная страница |
| GET | `/products` | Получить все товары |
| GET | `/products/:id` | Получить товар по ID |
| POST | `/products` | Добавить новый товар |
| PATCH | `/products/:id` | Обновить товар |
| DELETE | `/products/:id` | Удалить товар |

### Примеры запросов

**GET - Получить все товары**
```bash
curl http://localhost:3000/products
```

**GET - Получить товар по ID**
```bash
curl http://localhost:3000/products/1
```

**POST - Добавить новый товар**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Новый Товар","price":159}'
```

**PATCH - Обновить товар**
```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":120}'
```

**DELETE - Удалить товар**
```bash
curl -X DELETE http://localhost:3000/products/1
```

---

## PR4 - Full-Stack Приложение

### Описание
Полнофункциональное веб-приложение интернет-магазина премиум-алкогольных напитков "Пописярику TM" (версия без Swagger документации). Упрощенная версия PR4 с тем же функционалом, но без встроенной Swagger документации.

### Структура
```
pr5/
├── package.json             # Root package.json
├── client/
│   ├── package.json         # React приложение
│   ├── .env                 # Переменные окружения (если нужны)
│   ├── public/
│   │   ├── index.html
│   │   └── images/          # Изображения товаров
│   └── src/
│       ├── App.js           # Главный компонент
│       ├── index.js         # Точка входа
│       ├── index.css        # Стили
│       └── index.scss       # SCSS стили
└── server/
    ├── package.json         # Express сервер
    └── server.js            # Главный файл сервера
```


### Как установить и запустить

**Вариант 1: Запустить клиент и сервер одновременно (рекомендуется)**
```bash
# Перейти в директорию PR5
cd pr5

# Установить все зависимости
npm run install-all

# Запустить сервер и клиент одновременно
npm start
```

### Доступ к приложению

- **React приложение:** `http://localhost:3000`
- **API сервер:** `http://localhost:3001`

### API Эндпоинты

**Товары - Получение**

| Метод | Эндпоинт | Описание |
|:-----:|:---------|:--------|
| GET | `/` | Главная страница с информацией магазина |
| GET | `/api/products` | Получить все товары |
| GET | `/api/products/:id` | Получить товар по ID |
| GET | `/api/products/category/:category` | Получить товары по категории |

**Товары - Модификация**

| Метод | Эндпоинт | Описание |
|:-----:|:---------|:--------|
| POST | `/api/products` | Добавить новый товар |
| PATCH | `/api/products/:id` | Обновить товар (частичное обновление) |
| DELETE | `/api/products/:id` | Удалить товар |

### Примеры запросов

**GET - Получить все товары**
```bash
curl http://localhost:3001/api/products
```

**GET - Получить товар по ID (ID: 1)**
```bash
curl http://localhost:3001/api/products/1
```

**GET - Получить товары по категории (категория: Водка)**
```bash
curl http://localhost:3001/api/products/category/Водка
```

**POST - Добавить новый товар**
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новый напиток",
    "category": "Водка",
    "description": "Отличный выбор",
    "price": 599.99,
    "stock": 50,
    "rating": 4.5,
    "image": "/images/product.jpg"
  }'
```

**PATCH - Обновить товар (ID: 1)**
```bash
curl -X PATCH http://localhost:3001/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 499.99, "stock": 100}'
```

**DELETE - Удалить товар (ID: 1)**
```bash
curl -X DELETE http://localhost:3001/api/products/1
```

## PR5 - Full-Stack Приложение со Swagger

### Описание
Полнофункциональное веб-приложение интернет-магазина "Пописярику TM". Включает React клиент, Express сервер с полной документацией Swagger.

### Структура
```
pr4/
├── package.json             # Root package.json для управления обоими приложениями
├── client/
│   ├── package.json         # React приложение
│   ├── public/
│   │   ├── index.html
│   │   └── images/          # Изображения товаров
│   └── src/
│       ├── App.js           # Главный компонент
│       ├── index.js         # Точка входа
│       ├── index.css        # Стили
│       └── index.scss       # SCSS стили
└── server/
    ├── package.json         # Express сервер
    ├── server.js            # Главный файл сервера
    └── swagger.js           # Конфигурация Swagger документации
```

### Как установить и запустить

**Вариант 1: Запустить клиент и сервер одновременно (рекомендуется)**
```bash
# Перейти в директорию PR4
cd pr5

# Установить все зависимости
npm run install-all

# Запустить сервер и клиент одновременно
npm start
```


### Доступ к приложению

- **React приложение:** `http://localhost:3000`
- **API сервер:** `http://localhost:3001`
- **Swagger документация:** `http://localhost:3001/api-docs`

### API Эндпоинты

**Товары - Получение**

| Метод | Эндпоинт | Описание |
|:-----:|:---------|:--------|
| GET | `/` | Главная страница с информацией магазина |
| GET | `/api/products` | Получить все товары |
| GET | `/api/products/:id` | Получить товар по ID |
| GET | `/api/products/category/:category` | Получить товары по категории |

**Товары - Модификация**

| Метод | Эндпоинт | Описание |
|:-----:|:---------|:--------|
| POST | `/api/products` | Добавить новый товар |
| PATCH | `/api/products/:id` | Обновить товар (частичное обновление) |
| DELETE | `/api/products/:id` | Удалить товар |


### Примеры запросов

**GET - Получить все товары**
```bash
curl http://localhost:3001/api/products
```

**GET - Получить товар по ID (ID: 1)**
```bash
curl http://localhost:3001/api/products/1
```

**GET - Получить товары по категории (категория: Водка)**
```bash
curl http://localhost:3001/api/products/category/Водка
```

**POST - Добавить новый товар**
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новый напиток",
    "category": "Водка",
    "description": "Отличный выбор",
    "price": 599.99,
    "stock": 50,
    "rating": 4.5,
    "image": "/images/product.jpg"
  }'
```

**PATCH - Обновить товар (ID: 1)**
```bash
curl -X PATCH http://localhost:3001/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 499.99, "stock": 100}'
```

**DELETE - Удалить товар (ID: 1)**
```bash
curl -X DELETE http://localhost:3001/api/products/1
```
