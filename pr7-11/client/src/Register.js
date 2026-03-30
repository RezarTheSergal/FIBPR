import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import './Pages.scss'

export function Register({ onNavigate }) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [role, setRole] = useState('user')
	const { register, loading, error } = useAuth()

	const handleSubmit = async e => {
		e.preventDefault()

		if (password !== confirmPassword) {
			alert('Пароли не совпадают')
			return
		}

		const success = await register(username, password, role)
		if (success) {
			onNavigate('products')
		}
	}

	return (
		<div className='page'>
			<div className='auth-form'>
				<h2>Регистрация</h2>
				{error && <div className='error-message'>{error}</div>}
				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label>Логин</label>
						<input
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							placeholder='Придумайте логин'
							required
						/>
					</div>
					<div className='form-group'>
						<label>Роль</label>
						<select
							value={role}
							onChange={e => setRole(e.target.value)}
						>
							<option value='user'>Пользователь</option>
							<option value='seller'>Продавец</option>
							<option value='admin'>Администратор</option>
						</select>
					</div>
					<div className='form-group'>
						<label>Пароль</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder='Придумайте пароль'
							required
						/>
					</div>
					<div className='form-group'>
						<label>Подтверждение пароля</label>
						<input
							type='password'
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							placeholder='Повторите пароль'
							required
						/>
					</div>
					<button
						type='submit'
						disabled={loading}
						className='btn-primary'
					>
						{loading ? 'Загрузка...' : 'Зарегистрироваться'}
					</button>
				</form>
				<p className='auth-link'>
					Уже есть аккаунт?{' '}
					<a onClick={() => onNavigate('login')}>Войти</a>
				</p>
			</div>
		</div>
	)
}
