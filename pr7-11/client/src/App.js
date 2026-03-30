import React, { useState } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import { Login } from './Login'
import { Register } from './Register'
import { ProductsPage } from './ProductsPage'
import { AdminUsersPage } from './AdminUsersPage'

function AppContent() {
	const { user, isAuthenticated, logout } = useAuth()
	const [currentPage, setCurrentPage] = useState('products')

	if (!isAuthenticated) {
		return (
			<div>
				<div className='header'>
					<h1>Пописярику TM</h1>
				</div>
				{currentPage === 'login' ? (
					<Login onNavigate={setCurrentPage} />
				) : (
					<Register onNavigate={setCurrentPage} />
				)}
			</div>
		)
	}

	return (
		<div>
			<div className='header'>
				<div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
					<h1 style={{ margin: 0 }}>Пописярику TM</h1>
					<nav>
						<button
							className={currentPage === 'products' ? 'active' : ''}
							onClick={() => setCurrentPage('products')}
						>
							Товары
						</button>
						{(user.role === 'admin' || user.role === 'seller') && (
							<button
								className={currentPage === 'products' ? 'active' : ''}
								onClick={() => setCurrentPage('products')}
							>
								Мои товары
							</button>
						)}
						{user.role === 'admin' && (
							<button
								className={currentPage === 'admin' ? 'active' : ''}
								onClick={() => setCurrentPage('admin')}
							>
								Управление пользователями
							</button>
						)}
					</nav>
				</div>
				<div className='user-info'>
					<span>Пользователь: {user.username} ({user.role})</span>
					<button onClick={logout}>Выход</button>
				</div>
			</div>

			<div className='page-content'>
				{currentPage === 'products' && <ProductsPage />}
				{currentPage === 'admin' && <AdminUsersPage />}
			</div>
		</div>
	)
}

function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	)
}

export default App