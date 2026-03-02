const swaggerJsdoc = require('swagger-jsdoc')

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Пописярику TM API',
			version: '1.0.0',
			description: 'API интернет-магазина премиум алкогольных напитков "Пописярику TM"',
			contact: {
				name: 'Support',
				email: 'support@popisyriku.ru',
			},
		},
		servers: [
			{
				url: 'http://localhost:3001',
				description: 'Development server',
			},
		],
		components: {
			schemas: {
				Product: {
					type: 'object',
					required: ['id', 'name', 'category', 'price'],
					properties: {
						id: {
							type: 'number',
							example: 1,
							description: 'Уникальный идентификатор товара',
						},
						name: {
							type: 'string',
							example: 'Водка "Белая Березка" Premium',
							description: 'Название товара',
						},
						category: {
							type: 'string',
							example: 'Водка',
							description: 'Категория товара',
						},
						description: {
							type: 'string',
							example: 'Классическая русская водка высокого качества',
							description: 'Подробное описание товара',
						},
						price: {
							type: 'number',
							format: 'float',
							example: 549.99,
							description: 'Цена товара в рублях',
						},
						stock: {
							type: 'number',
							example: 156,
							description: 'Количество товара на складе',
						},
						rating: {
							type: 'number',
							format: 'float',
							example: 4.9,
							description: 'Рейтинг товара от 0 до 5',
							minimum: 0,
							maximum: 5,
						},
						image: {
							type: 'string',
							example: '/images/belaya.jfif',
							description: 'Путь к изображению товара',
						},
					},
				},
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							description: 'Описание ошибки',
						},
					},
				},
				Message: {
					type: 'object',
					properties: {
						message: {
							type: 'string',
							description: 'Информационное сообщение',
						},
					},
				},
			},
		},
	},
	apis: ['./server.js'],
}

const specs = swaggerJsdoc(options)

module.exports = specs
