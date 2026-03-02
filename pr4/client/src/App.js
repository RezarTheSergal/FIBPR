import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001/api'

function App() {
	const [products, setProducts] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [categories, setCategories] = useState([])
	const [selectedCategory, setSelectedCategory] = useState('Все')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [showDrunkGrandpa, setShowDrunkGrandpa] = useState(false)

	useEffect(() => {
		fetchProducts()
	}, [])

	useEffect(() => {
		if (selectedCategory === 'Все') {
			setFilteredProducts(products)
		} else {
			setFilteredProducts(products.filter(p => p.category === selectedCategory))
		}
	}, [selectedCategory, products])

	const fetchProducts = async () => {
		try {
			setLoading(true)
			const response = await fetch(`${API_URL}/products`)
			if (!response.ok) throw new Error('Ошибка загрузки данных')

			const data = await response.json()
			setProducts(data)
			setFilteredProducts(data)

			const uniqueCategories = ['Все', ...new Set(data.map(p => p.category))]
			setCategories(uniqueCategories)

			setError(null)
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const handleBuy = () => {
		setShowDrunkGrandpa(true)
		setTimeout(() => {
			setShowDrunkGrandpa(false)
		}, 2000)
	}

	return (
		<div className='App'>
			{showDrunkGrandpa && <DrunkGrandpa />}
			<header className='header'>
				<h1>Пописярику TM</h1>
				<p>Высший класс, низшая цена! Алкогольный рай в центре города!</p>
			</header>

			<div className='container'>
				{error && <div className='error'>Ошибка: {error}</div>}

				<div className='filters'>
					<h3>Категории</h3>
					<div className='category-buttons'>
						{categories.map(category => (
							<button
								key={category}
								className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
								onClick={() => setSelectedCategory(category)}
							>
								{category}
							</button>
						))}
					</div>
				</div>

				{loading ? (
					<div className='loading'>Загрузка товаров...</div>
				) : filteredProducts.length === 0 ? (
					<div className='empty-state'>
						<h3>Товары не найдены</h3>
						<p>Попробуйте выбрать другую категорию</p>
					</div>
				) : (
					<div className='products-grid'>
						{filteredProducts.map(product => (
							<ProductCard key={product.id} product={product} onBuy={handleBuy} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}

function ProductCard({ product, onBuy }) {
	return (
		<div className='product-card'>
			<div className='product-image-wrapper'>
				<img
					src={product.image}
					alt={product.name}
					className='product-image'
					onError={e => {
						const tries = Number(e.target.dataset.imgTries || 0)
						if (tries === 0) {
							e.target.dataset.imgTries = 1
							e.target.src = window.location.origin + product.image
							return
						}
						if (tries === 1) {
							e.target.dataset.imgTries = 2
							e.target.src = 'http://localhost:3001' + product.image
							return
						}
						e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
					}}
				/>
			</div>
			<div className='product-info'>
				<div className='product-category'>{product.category}</div>
				<h3 className='product-name'>{product.name}</h3>
				<p className='product-description'>{product.description}</p>

				{product.rating > 0 && (
					<div className='product-rating'>
						<span className='score'>{product.rating.toFixed(1)}</span>
					</div>
				)}

				<div className='product-footer'>
					<div className='product-price'>
						{product.price.toLocaleString('ru-RU')} ₽
					</div>
					<div className={`product-stock ${product.stock < 5 ? 'low' : ''}`}>
						{product.stock > 0
							? `Осталось: ${product.stock} шт.`
							: 'Нет в наличии'}
					</div>
				</div>
				<button className='buy-btn' onClick={onBuy} disabled={product.stock === 0}>
					Купить
				</button>
			</div>
		</div>
	)
}

function DrunkGrandpa() {
	return (
		<div className='drunk-grandpa-overlay'>
			<img src='./images/ded.jfif' alt='Пьяный дед' className='drunk-grandpa-image' />
		</div>
	)
}

export default App