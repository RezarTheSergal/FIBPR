const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger')
const app = express()
const port = 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))

// База данных товаров магазина "Пописярику TM" (в памяти)
let products = [
	{
		id: 1,
		name: 'Водка "Белая Березка" Premium',
		category: 'Водка',
		description:
			'Классическая русская водка высокого качества. Изготовлена из отборного зернового спирта класса «Люкс» и чистейшей природной воды. Гладкий, нейтральный вкус. 0.7 л, 40%.',
		price: 549.99,
		stock: 156,
		rating: 4.9,
		image:
			'/images/belaya.jfif',
	},
	{
		id: 2,
		name: 'Водка "Родопи" Спецвыпуск',
		category: 'Водка',
		description:
			'Премиальная водка болгарского производства. Мягкая, со слегка сладковатым послевкусием. Идеальна для коктейлей и чистого питья. 0.5 л, 40%.',
		price: 399.99,
		stock: 89,
		rating: 4.7,
		image:
			'/images/rodopi.jpg',
	},
	{
		id: 3,
		name: 'Ликёр Jägermeister',
		category: 'Ликёры',
		description:
			'Немецкий крепкий ликер, настоянный на 56 травах, кореньях, фруктах и специях. Горько-сладкий вкус. Идеален как дижестив или в коктейлях. 0.7 л, 35%.',
		price: 1899.99,
		stock: 34,
		rating: 4.8,
		image:
			'/images/jager.jfif',
	},
	{
		id: 4,
		name: 'Ликёр Baileys Irish Cream',
		category: 'Ликёры',
		description:
			'Ирландский сливочный ликер со вкусом шоколада и ирландского виски. Нежный, кремовый вкус. Perfect для десертных коктейлей. 0.7 л, 17%.',
		price: 849.99,
		stock: 67,
		rating: 4.9,
		image:
			'/images/baileys.jfif',
	},
	{
		id: 5,
		name: 'Ром "Captain Morgan" Spiced',
		category: 'Ром',
		description:
			'Специальный пряный ром карибского происхождения. Пряный букет с нотками специй и ванили. 0.7 л, 35%.',
		price: 1299.99,
		stock: 51,
		rating: 4.6,
		image:
			'/images/captain.jpeg',
	},
	{
		id: 6,
		name: 'Коньяк "Хеннесси" V.S.',
		category: 'Коньяк',
		description:
			'Легендарный французский коньяк. Освежающий, легкий, с фруктовыми нотками. Готов к употреблению прямо из бутылки. 0.7 л, 40%.',
		price: 2899.99,
		stock: 28,
		rating: 4.8,
		image:
			'/images/hennessy.jpeg',
	},
	{
		id: 7,
		name: 'Виски "Jack Daniels" Old No.7',
		category: 'Виски',
		description:
			'Американский виски теннесси, самый популярный в мире. Гладкий, с дымными нотками и оттенком черного дерева. 0.7 л, 40%.',
		price: 2199.99,
		stock: 43,
		rating: 4.9,
		image:
			'/images/jack_black.jfif',
	},
	{
		id: 8,
		name: 'Настойка "Боровичка"',
		category: 'Настойки',
		description:
			'Классическая русская можжевеловая настойка. Крепкая хвойная, пряная, с острым послевкусием. 0.5 л, 46%.',
		price: 299.99,
		stock: 123,
		rating: 4.5,
		image:
			'/images/borov.jfif',
	},
	{
		id: 9,
		name: 'Шампанское "Абрау-Дюрсо" Брют',
		category: 'Шампанское',
		description:
			'Российское шампанское премиум-класса. Живое, свежее, с нотками цветов и фруктов. Идеально для праздников. 0.75 л, 12%.',
		price: 649.99,
		stock: 78,
		rating: 4.7,
		image:
			'/images/abrau.webp',
	},
	{
		id: 10,
		name: 'Красное вино "Фанагория" Каберне',
		category: 'Вина',
		description:
			'Российское сухое красное вино из Крыма. Полное, насыщенное, с ягодными нотками. Идеально к мясу и сырам. 0.75 л, 12%.',
		price: 549.99,
		stock: 95,
		rating: 4.6,
		image:
			'/images/bebe.jfif',
	},
	{
		id: 11,
		name: 'Белое вино "Inkerman" Шардоне',
		category: 'Вина',
		description:
			'Крымское белое вино виноградника Inkerman. Легкое, свежее, с цветочными нотками и легкой кислотностью. 0.75 л, 11%.',
		price: 449.99,
		stock: 112,
		rating: 4.8,
		image:
			'/images/inkerman.jfif',
	},
	{
		id: 12,
		name: 'Пиво "Балтика №7" Экспортное',
		category: 'Пиво',
		description:
			'Легендарное питерское пиво с насыщенным вкусом. Легкий хмелевой привкус и тонкая горечь. 0.5 л, 5.4%.',
		price: 89.99,
		stock: 287,
		rating: 4.5,
		image:
			'/images/baaaaaa4.jfif',
	},
	{
		id: 13,
		name: 'Джин "Beefeater" London Dry',
		category: 'Джин',
		description:
			'Британский джин премиум-класса. Хвойный аромат с нотками цитрусов и специй. Идеален в джин-тонике. 0.7 л, 40%.',
		price: 1299.99,
		stock: 56,
		rating: 4.7,
		image:
			'/images/funny.jfif',
	},
	{
		id: 14,
		name: 'Текила "Jose Cuervo" Gold',
		category: 'Текила',
		description:
			'Мексиканская текила золотого цвета. Сладкая с нотками карамели и ванили. Идеальна для маргариты. 0.7 л, 38%.',
		price: 999.99,
		stock: 71,
		rating: 4.4,
		image:
			'/images/jose.jfif',
	},
]

// Маршруты API
app.get('/', (req, res) => {
	res.json({
		message: 'API магазина "Пописярику TM" - Премиум алкоголь, нижайшие цены!',
	})
})

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     description: Возвращает список всех товаров в магазине
 *     tags:
 *       - Товары
 *     responses:
 *       200:
 *         description: Успешно получен список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// Получить все товары
app.get('/api/products', (req, res) => {
	res.json(products)
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Возвращает информацию о конкретном товаре по его уникальному идентификатору
 *     tags:
 *       - Товары
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Уникальный идентификатор товара
 *     responses:
 *       200:
 *         description: Товар успешно найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Получить товар по ID
app.get('/api/products/:id', (req, res) => {
	const product = products.find(p => p.id === Number(req.params.id))
	if (!product) {
		return res.status(404).json({ error: 'Товар не найден' })
	}
	res.json(product)
})

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Получить товары по категории
 *     description: Возвращает список товаров, отфильтрованных по категории
 *     tags:
 *       - Товары
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Название категории (Водка, Ликёры, Ром, Коньяк, и т.д.)
 *     responses:
 *       200:
 *         description: Список товаров найден
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// Получить товары по категории
app.get('/api/products/category/:category', (req, res) => {
	const filtered = products.filter(p => p.category === req.params.category)
	res.json(filtered)
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Добавить новый товар
 *     description: Создает новый товар в базе данных магазина
 *     tags:
 *       - Товары
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новый напиток"
 *                 description: Название товара
 *               category:
 *                 type: string
 *                 example: "Водка"
 *                 description: Категория товара
 *               description:
 *                 type: string
 *                 example: "Описание напитка"
 *                 description: Подробное описание
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 999.99
 *                 description: Цена в рублях
 *               stock:
 *                 type: number
 *                 example: 50
 *                 description: Количество на складе
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *                 description: Рейтинг товара
 *               image:
 *                 type: string
 *                 example: "/images/product.jpg"
 *                 description: Путь к изображению
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Отсутствуют обязательные поля (name, category, price)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Добавить новый товар
app.post('/api/products', (req, res) => {
	const { name, category, description, price, stock, rating, image } = req.body

	if (!name || !category || !price) {
		return res
			.status(400)
			.json({ error: 'Необходимо указать name, category и price' })
	}

	const newProduct = {
		id: Date.now(),
		name,
		category,
		description: description || '',
		price: Number(price),
		stock: stock || 0,
		rating: rating || 0,
		image: image || '',
	}

	products.push(newProduct)
	res.status(201).json(newProduct)
})

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     description: Обновляет информацию о товаре (полностью или частично). Можно обновить любое из полей товара
 *     tags:
 *       - Товары
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Уникальный идентификатор товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Обновленное название"
 *                 description: Название товара
 *               category:
 *                 type: string
 *                 example: "Водка"
 *                 description: Категория товара
 *               description:
 *                 type: string
 *                 example: "Новое описание"
 *                 description: Подробное описание
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 599.99
 *                 description: Цена в рублях
 *               stock:
 *                 type: number
 *                 example: 100
 *                 description: Количество на складе
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.8
 *                 description: Рейтинг товара
 *               image:
 *                 type: string
 *                 example: "/images/new-image.jpg"
 *                 description: Путь к изображению
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Обновить товар
app.patch('/api/products/:id', (req, res) => {
	const product = products.find(p => p.id === Number(req.params.id))

	if (!product) {
		return res.status(404).json({ error: 'Товар не найден' })
	}

	const { name, category, description, price, stock, rating, image } = req.body

	if (name !== undefined) product.name = name
	if (category !== undefined) product.category = category
	if (description !== undefined) product.description = description
	if (price !== undefined) product.price = Number(price)
	if (stock !== undefined) product.stock = Number(stock)
	if (rating !== undefined) product.rating = Number(rating)
	if (image !== undefined) product.image = image

	res.json(product)
})

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Удаляет товар из базы данных магазина по его ID
 *     tags:
 *       - Товары
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Уникальный идентификатор товара для удаления
 *     responses:
 *       200:
 *         description: Товар успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Удалить товар
app.delete('/api/products/:id', (req, res) => {
	const index = products.findIndex(p => p.id === Number(req.params.id))

	if (index === -1) {
		return res.status(404).json({ error: 'Товар не найден' })
	}

	products.splice(index, 1)
	res.json({ message: 'Товар удалён' })
})

// Запуск сервера
app.listen(port, () => {
	console.log(`Сервер запущен на http://localhost:${port}`)
})