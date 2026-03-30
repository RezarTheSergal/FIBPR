import React, { createContext, useState, useEffect } from 'react'
import { auth } from './api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		// Check if user is still logged in on mount
		const accessToken = localStorage.getItem('accessToken')
		if (accessToken) {
			validateToken()
		} else {
			setLoading(false)
		}
	}, [])

	const validateToken = async () => {
		try {
			const response = await auth.me()
			setUser(response.data)
			setError(null)
		} catch (err) {
			localStorage.removeItem('accessToken')
			localStorage.removeItem('refreshToken')
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	const login = async (username, password) => {
		try {
			setLoading(true)
			setError(null)
			const response = await auth.login(username, password)
			const { accessToken, refreshToken } = response.data

			localStorage.setItem('accessToken', accessToken)
			localStorage.setItem('refreshToken', refreshToken)

			await validateToken()
			return true
		} catch (err) {
			const message = err.response?.data?.error || 'Login failed'
			setError(message)
			return false
		} finally {
			setLoading(false)
		}
	}

	const register = async (username, password, role = 'user') => {
		try {
			setLoading(true)
			setError(null)
			await auth.register(username, password, role)

			// Auto-login after registration
			const loginResponse = await auth.login(username, password)
			const { accessToken, refreshToken } = loginResponse.data

			localStorage.setItem('accessToken', accessToken)
			localStorage.setItem('refreshToken', refreshToken)

			await validateToken()
			return true
		} catch (err) {
			const message = err.response?.data?.error || 'Registration failed'
			setError(message)
			return false
		} finally {
			setLoading(false)
		}
	}

	const logout = () => {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		setUser(null)
		setError(null)
	}

	const value = {
		user,
		loading,
		error,
		login,
		register,
		logout,
		isAuthenticated: !!user,
	}

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = React.useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
