const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger')
const app = express()
const port = 3001

// ===== CONFIGURATION =====
const ACCESS_SECRET = 'access_secret_key_pr7_11'
const REFRESH_SECRET = 'refresh_secret_key_pr7_11'
const ACCESS_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_IN = '7d'

// ===== MIDDLEWARE =====
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))

// ===== DATABASE (IN-MEMORY) =====
let users = []
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

const refreshTokens = new Set()

// ===== UTILITY FUNCTIONS =====
function generateAccessToken(user) {
	return jwt.sign(
		{
			sub: user.id,
			username: user.username,
			role: user.role,
		},
		ACCESS_SECRET,
		{ expiresIn: ACCESS_EXPIRES_IN }
	)
}

function generateRefreshToken(user) {
	return jwt.sign(
		{
			sub: user.id,
			username: user.username,
			role: user.role,
		},
		REFRESH_SECRET,
		{ expiresIn: REFRESH_EXPIRES_IN }
	)
}

async function hashPassword(password) {
	return bcrypt.hash(password, 10)
}

async function verifyPassword(password, passwordHash) {
	return bcrypt.compare(password, passwordHash)
}

// ===== MIDDLEWARE =====
function authMiddleware(req, res, next) {
	const header = req.headers.authorization || ''
	const [scheme, token] = header.split(' ')

	if (scheme !== 'Bearer' || !token) {
		return res.status(401).json({
			error: 'Missing or invalid Authorization header',
		})
	}

	try {
		const payload = jwt.verify(token, ACCESS_SECRET)
		req.user = payload
		next()
	} catch (err) {
		return res.status(401).json({
			error: 'Invalid or expired token',
		})
	}
}

function roleMiddleware(allowedRoles) {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				error: 'Forbidden',
			})
		}
		next()
	}
}

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
	res.json({
		message: 'API магазина "Пописярику TM" - Премиум алкоголь, нижайшие цены!',
	})
})

// ===== AUTH ROUTES =====

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: ivan
 *               password:
 *                 type: string
 *                 example: qwerty123
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 */
app.post('/api/auth/register', async (req, res) => {
	const { username, password, role } = req.body

	if (!username || !password) {
		return res.status(400).json({
			error: 'username and password are required',
		})
	}

	const exists = users.some(u => u.username === username)
	if (exists) {
		return res.status(409).json({
			error: 'username already exists',
		})
	}

	const passwordHash = await hashPassword(password)
	const user = {
		id: String(users.length + 1),
		username,
		passwordHash,
		role: role || 'user',
		blocked: false,
	}

	users.push(user)
	res.status(201).json({
		id: user.id,
		username: user.username,
		role: user.role,
	})
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     description: Аутентифицирует пользователя и возвращает токены
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: ivan
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/auth/login', async (req, res) => {
	const { username, password } = req.body

	if (!username || !password) {
		return res.status(400).json({
			error: 'username and password are required',
		})
	}

	const user = users.find(u => u.username === username)
	if (!user) {
		return res.status(401).json({
			error: 'Invalid credentials',
		})
	}

	if (user.blocked) {
		return res.status(403).json({
			error: 'User is blocked',
		})
	}

	const isValid = await verifyPassword(password, user.passwordHash)
	if (!isValid) {
		return res.status(401).json({
			error: 'Invalid credentials',
		})
	}

	const accessToken = generateAccessToken(user)
	const refreshToken = generateRefreshToken(user)
	refreshTokens.add(refreshToken)

	res.json({
		accessToken,
		refreshToken,
	})
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить токены
 *     description: Выпускает новую пару access и refresh токенов
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Токены успешно обновлены
 *       401:
 *         description: Invalid or expired refresh token
 */
app.post('/api/auth/refresh', (req, res) => {
	const { refreshToken } = req.body

	if (!refreshToken) {
		return res.status(400).json({
			error: 'refreshToken is required',
		})
	}

	if (!refreshTokens.has(refreshToken)) {
		return res.status(401).json({
			error: 'Invalid refresh token',
		})
	}

	try {
		const payload = jwt.verify(refreshToken, REFRESH_SECRET)
		const user = users.find(u => u.id === payload.sub)

		if (!user) {
			return res.status(401).json({
				error: 'User not found',
			})
		}

		refreshTokens.delete(refreshToken)
		const newAccessToken = generateAccessToken(user)
		const newRefreshToken = generateRefreshToken(user)
		refreshTokens.add(newRefreshToken)

		res.json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		})
	} catch (err) {
		return res.status(401).json({
			error: 'Invalid or expired refresh token',
		})
	}
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     description: Возвращает информацию о текущем аутентифицированном пользователе
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *       401:
 *         description: Unauthorized
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
	const userId = req.user.sub
	const user = users.find(u => u.id === userId)

	if (!user) {
		return res.status(404).json({
			error: 'User not found',
		})
	}

	res.json({
		id: user.id,
		username: user.username,
		role: user.role,
		blocked: user.blocked,
	})
})

// ===== USER MANAGEMENT ROUTES (Admin only) =====

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     description: Возвращает список всех пользователей (только для администраторов)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       403:
 *         description: Forbidden
 */
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
	const userList = users.map(u => ({
		id: u.id,
		username: u.username,
		role: u.role,
		blocked: u.blocked,
	}))
	res.json(userList)
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о конкретном пользователе (только для администраторов)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
app.get(
	'/api/users/:id',
	authMiddleware,
	roleMiddleware(['admin']),
	(req, res) => {
		const user = users.find(u => u.id === req.params.id)

		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			})
		}

		res.json({
			id: user.id,
			username: user.username,
			role: user.role,
			blocked: user.blocked,
		})
	}
)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя
 *     description: Обновляет информацию о пользователе (только для администраторов)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *               blocked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
app.put(
	'/api/users/:id',
	authMiddleware,
	roleMiddleware(['admin']),
	(req, res) => {
		const user = users.find(u => u.id === req.params.id)

		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			})
		}

		const { role, blocked } = req.body

		if (role !== undefined) user.role = role
		if (blocked !== undefined) user.blocked = blocked

		res.json({
			id: user.id,
			username: user.username,
			role: user.role,
			blocked: user.blocked,
		})
	}
)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя
 *     description: Блокирует пользователя (только для администраторов)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
app.delete(
	'/api/users/:id',
	authMiddleware,
	roleMiddleware(['admin']),
	(req, res) => {
		const user = users.find(u => u.id === req.params.id)

		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			})
		}

		user.blocked = true

		res.json({
			message: 'User blocked',
			user: {
				id: user.id,
				username: user.username,
				blocked: user.blocked,
			},
		})
	}
)

// ===== PRODUCT ROUTES =====

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     description: Возвращает список всех товаров (доступно всем)
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Список всех товаров
 */
app.get('/api/products', (req, res) => {
	res.json(products)
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Возвращает информацию о товаре (доступно всем)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Информация о товаре
 *       404:
 *         description: Product not found
 */
app.get('/api/products/:id', (req, res) => {
	const product = products.find(p => p.id === Number(req.params.id))
	if (!product) {
		return res.status(404).json({ error: 'Product not found' })
	}
	res.json(product)
})

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Получить товары по категории
 *     description: Возвращает товары по категории (доступно всем)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список товаров по категории
 */
app.get('/api/products/category/:category', (req, res) => {
	const filtered = products.filter(p => p.category === req.params.category)
	res.json(filtered)
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     description: Создает новый товар (только для продавцов и администраторов)
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
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
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар создан
 *       403:
 *         description: Forbidden
 */
app.post(
	'/api/products',
	authMiddleware,
	roleMiddleware(['seller', 'admin']),
	(req, res) => {
		const { name, category, description, price, stock, rating, image } =
			req.body

		if (!name || !category || price === undefined) {
			return res.status(400).json({
				error: 'name, category and price are required',
			})
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
	}
)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     description: Обновляет товар (только для продавцов и администраторов)
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
app.put(
	'/api/products/:id',
	authMiddleware,
	roleMiddleware(['seller', 'admin']),
	(req, res) => {
		const product = products.find(p => p.id === Number(req.params.id))

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		const { name, category, description, price, stock, rating, image } =
			req.body

		if (name !== undefined) product.name = name
		if (category !== undefined) product.category = category
		if (description !== undefined) product.description = description
		if (price !== undefined) product.price = Number(price)
		if (stock !== undefined) product.stock = Number(stock)
		if (rating !== undefined) product.rating = Number(rating)
		if (image !== undefined) product.image = image

		res.json(product)
	}
)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Удаляет товар (только для администраторов)
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Товар удален
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
app.delete(
	'/api/products/:id',
	authMiddleware,
	roleMiddleware(['admin']),
	(req, res) => {
		const index = products.findIndex(p => p.id === Number(req.params.id))

		if (index === -1) {
			return res.status(404).json({ error: 'Product not found' })
		}

		products.splice(index, 1)
		res.json({ message: 'Product deleted' })
	}
)

// ===== PATCH ROUTE FOR BACKWARD COMPATIBILITY =====
app.patch(
	'/api/products/:id',
	authMiddleware,
	roleMiddleware(['seller', 'admin']),
	(req, res) => {
		const product = products.find(p => p.id === Number(req.params.id))

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		const { name, category, description, price, stock, rating, image } =
			req.body

		if (name !== undefined) product.name = name
		if (category !== undefined) product.category = category
		if (description !== undefined) product.description = description
		if (price !== undefined) product.price = Number(price)
		if (stock !== undefined) product.stock = Number(stock)
		if (rating !== undefined) product.rating = Number(rating)
		if (image !== undefined) product.image = image

		res.json(product)
	}
)

// ===== START SERVER =====
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`)
})