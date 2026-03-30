import React, { useState, useEffect } from 'react'
import { products } from './api'
import { useAuth } from './AuthContext'
import './Pages.scss'

export function ProductsPage() {
	const [productsList, setProductsList] = useState([])
	const [categories, setCategories] = useState(['Все'])
	const [selectedCategory, setSelectedCategory] = useState('Все')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [showForm, setShowForm] = useState(false)
	const [editingProduct, setEditingProduct] = useState(null)
	const [formData, setFormData] = useState({
		name: '',
		category: '',
		description: '',
		price: '',
		stock: '',
		rating: '',
		image: '',
	})

	const { user } = useAuth()
	const canCreate = user?.role === 'seller' || user?.role === 'admin'
	const canDelete = user?.role === 'admin'

	useEffect(() => {
		loadProducts()
	}, [])

	const loadProducts = async () => {
		try {
			setLoading(true)
			const response = await products.getAll()
			setProductsList(response.data)

			const uniqueCategories = [
				'Все',
				...new Set(response.data.map(p => p.category)),
			]
			setCategories(uniqueCategories)
			setError(null)
		} catch (err) {
			setError('Failed to load products')
		} finally {
			setLoading(false)
		}
	}

	const filteredProducts =
		selectedCategory === 'Все'
			? productsList
			: productsList.filter(p => p.category === selectedCategory)

	const handleFormChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async e => {
		e.preventDefault()

		try {
			if (editingProduct) {
				await products.update(editingProduct.id, formData)
			} else {
				await products.create(formData)
			}

			setFormData({
				name: '',
				category: '',
				description: '',
				price: '',
				stock: '',
				rating: '',
				image: '',
			})
			setEditingProduct(null)
			setShowForm(false)
			loadProducts()
		} catch (err) {
			alert('Failed to save product')
		}
	}

	const handleEdit = product => {
		setEditingProduct(product)
		setFormData({
			name: product.name,
			category: product.category,
			description: product.description,
			price: product.price,
			stock: product.stock,
			rating: product.rating,
			image: product.image,
		})
		setShowForm(true)
	}

	const handleDelete = async productId => {
		if (!window.confirm('Are you sure?')) return

		try {
			await products.delete(productId)
			loadProducts()
		} catch (err) {
			alert('Failed to delete product')
		}
	}

	const handleCancel = () => {
		setShowForm(false)
		setEditingProduct(null)
		setFormData({
			name: '',
			category: '',
			description: '',
			price: '',
			stock: '',
			rating: '',
			image: '',
		})
	}

	if (loading) return <div className='page'>Loading...</div>

	return (
		<div className='page'>
			{error && <div className='error-message'>{error}</div>}

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<h1>Товары</h1>
				{canCreate && (
					<button
						className='btn-success'
						onClick={() => setShowForm(true)}
					>
						{editingProduct ? 'Редактировать' : '+ Добавить товар'}
					</button>
				)}
			</div>

			{showForm && (
				<div className='product-form'>
					<h3>
						{editingProduct ? 'Редактировать товар' : 'Добавить товар'}
					</h3>
					<form onSubmit={handleSubmit}>
						<div className='form-group'>
							<label>Название</label>
							<input
								type='text'
								name='name'
								value={formData.name}
								onChange={handleFormChange}
								required
							/>
						</div>
						<div className='form-group'>
							<label>Категория</label>
							<input
								type='text'
								name='category'
								value={formData.category}
								onChange={handleFormChange}
								required
							/>
						</div>
						<div className='form-group'>
							<label>Описание</label>
							<textarea
								name='description'
								value={formData.description}
								onChange={handleFormChange}
								rows='3'
								style={{
									padding: '10px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontFamily: 'inherit',
								}}
							/>
						</div>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '15px',
							}}
						>
							<div className='form-group'>
								<label>Цена</label>
								<input
									type='number'
									name='price'
									value={formData.price}
									onChange={handleFormChange}
									step='0.01'
									required
								/>
							</div>
							<div className='form-group'>
								<label>Складе</label>
								<input
									type='number'
									name='stock'
									value={formData.stock}
									onChange={handleFormChange}
								/>
							</div>
							<div className='form-group'>
								<label>Рейтинг</label>
								<input
									type='number'
									name='rating'
									value={formData.rating}
									onChange={handleFormChange}
									step='0.1'
									min='0'
									max='5'
								/>
							</div>
							<div className='form-group'>
								<label>Изображение (URL)</label>
								<input
									type='text'
									name='image'
									value={formData.image}
									onChange={handleFormChange}
								/>
							</div>
						</div>
						<div className='form-actions'>
							<button
								type='button'
								className='btn-secondary'
								onClick={handleCancel}
							>
								Отмена
							</button>
							<button type='submit' className='btn-primary'>
								{editingProduct ? 'Обновить' : 'Добавить'}
							</button>
						</div>
					</form>
				</div>
			)}

			<div className='categories-filter'>
				{categories.map(cat => (
					<button
						key={cat}
						className={
							selectedCategory === cat ? 'active' : ''
						}
						onClick={() => setSelectedCategory(cat)}
					>
						{cat}
					</button>
				))}
			</div>

			<div className='products-list'>
				{filteredProducts.map(product => (
					<div key={product.id} className='product-card'>
						<img
							src={product.image}
							alt={product.name}
							onError={e => {
								e.target.src =
									'https://via.placeholder.com/300x200?text=No+Image'
							}}
						/>
						<div className='product-info'>
							<h3>{product.name}</h3>
							<p>{product.category}</p>
							<p>{product.description}</p>
							<div className='price'>
								₽{product.price.toFixed(2)}
							</div>
							<p>
								<strong>Складе:</strong> {product.stock}
							</p>
							<p>
								<strong>Рейтинг:</strong> {product.rating}/5
							</p>
							<div className='actions'>
								{canCreate && (
									<button
										className='btn-secondary'
										onClick={() => handleEdit(product)}
									>
										Редактировать
									</button>
								)}
								{canDelete && (
									<button
										className='btn-danger'
										onClick={() =>
											handleDelete(product.id)
										}
									>
										Удалить
									</button>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
