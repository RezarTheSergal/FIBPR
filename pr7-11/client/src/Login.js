import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import './Pages.scss'

export function Login({ onNavigate }) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const { login, loading, error } = useAuth()

	const handleSubmit = async e => {
		e.preventDefault()
		const success = await login(username, password)
		if (success) {
			onNavigate('products')
		}
	}

	return (
		<div className='page'>
			<div className='auth-form'>
				<h2>Вход в систему</h2>
				{error && <div className='error-message'>{error}</div>}
				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label>Логин</label>
						<input
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							placeholder='Введите логин'
							required
						/>
					</div>
					<div className='form-group'>
						<label>Пароль</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder='Введите пароль'
							required
						/>
					</div>
					<button
						type='submit'
						disabled={loading}
						className='btn-primary'
					>
						{loading ? 'Загрузка...' : 'Вход'}
					</button>
				</form>
				<p className='auth-link'>
					Нет аккаунта?{' '}
					<a onClick={() => onNavigate('register')}>
						Зарегистрироваться
					</a>
				</p>
			</div>
		</div>
	)
}
