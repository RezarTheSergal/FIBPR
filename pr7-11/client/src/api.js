import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
	config => {
		const accessToken = localStorage.getItem('accessToken')
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`
		}
		return config
	},
	error => Promise.reject(error)
)

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				const refreshToken = localStorage.getItem('refreshToken')
				if (!refreshToken) {
					localStorage.removeItem('accessToken')
					localStorage.removeItem('refreshToken')
					window.location.href = '/login'
					return Promise.reject(error)
				}

				const response = await axios.post(`${API_URL}/auth/refresh`, {
					refreshToken,
				})

				const { accessToken, refreshToken: newRefreshToken } = response.data
				localStorage.setItem('accessToken', accessToken)
				localStorage.setItem('refreshToken', newRefreshToken)

				originalRequest.headers.Authorization = `Bearer ${accessToken}`
				return apiClient(originalRequest)
			} catch (refreshError) {
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				window.location.href = '/login'
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)

// Auth endpoints
export const auth = {
	register: (username, password, role = 'user') =>
		apiClient.post('/auth/register', { username, password, role }),
	login: (username, password) =>
		apiClient.post('/auth/login', { username, password }),
	refresh: refreshToken =>
		apiClient.post('/auth/refresh', { refreshToken }),
	me: () => apiClient.get('/auth/me'),
}

// Product endpoints
export const products = {
	getAll: () => apiClient.get('/products'),
	getById: id => apiClient.get(`/products/${id}`),
	getByCategory: category =>
		apiClient.get(`/products/category/${category}`),
	create: productData => apiClient.post('/products', productData),
	update: (id, productData) =>
		apiClient.put(`/products/${id}`, productData),
	patch: (id, productData) =>
		apiClient.patch(`/products/${id}`, productData),
	delete: id => apiClient.delete(`/products/${id}`),
}

// User endpoints
export const users = {
	getAll: () => apiClient.get('/users'),
	getById: id => apiClient.get(`/users/${id}`),
	update: (id, userData) => apiClient.put(`/users/${id}`, userData),
	block: id => apiClient.delete(`/users/${id}`),
}

export default apiClient
