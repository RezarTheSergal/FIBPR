import React, { useState, useEffect } from 'react'
import { users } from './api'
import { useAuth } from './AuthContext'
import './Pages.scss'

export function AdminUsersPage() {
	const [usersList, setUsersList] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [editingUser, setEditingUser] = useState(null)
	const [newRole, setNewRole] = useState('')

	const { user } = useAuth()

	useEffect(() => {
		// Protect this page - only admin can access
		if (user?.role !== 'admin') {
			setLoading(false);
			return;
		}
		
		loadUsers()
	}, [user?.role])

	const loadUsers = async () => {
		try {
			setLoading(true)
			const response = await users.getAll()
			setUsersList(response.data)
			setError(null)
		} catch (err) {
			setError('Failed to load users')
		} finally {
			setLoading(false)
		}
	}

	const handleUpdateRole = async userId => {
		if (!newRole) {
			alert('Select a new role')
			return
		}

		try {
			await users.update(userId, { role: newRole })
			setEditingUser(null)
			setNewRole('')
			loadUsers()
		} catch (err) {
			alert('Failed to update user role')
		}
	}

	const handleBlockUser = async userId => {
		try {
			await users.block(userId)
			loadUsers()
		} catch (err) {
			alert('Failed to block/unblock user')
		}
	}

	if (loading) return <div className='page'>Loading...</div>	
	// Show access denied message if user is not admin
	if (user?.role !== 'admin') {
		return (
			<div className='page'>
				<div className='error-message'>
					Access denied. Admin only.
				</div>
			</div>
		)
	}
	return (
		<div className='page'>
			{error && <div className='error-message'>{error}</div>}

			<h1>Управление пользователями</h1>

			<table className='users-table'>
				<thead>
					<tr>
						<th>ID</th>
						<th>Пользователь</th>
						<th>Роль</th>
						<th>Статус</th>
						<th>Действия</th>
					</tr>
				</thead>
				<tbody>
					{usersList.map(u => (
						<tr key={u.id}>
							<td>{u.id}</td>
							<td>{u.username}</td>
							<td>
								{editingUser === u.id ? (
									<select
										value={newRole}
										onChange={e =>
											setNewRole(e.target.value)
										}
									>
										<option value=''>
											Select role
										</option>
										<option value='user'>User</option>
										<option value='seller'>Seller</option>
										<option value='admin'>Admin</option>
									</select>
								) : (
									<span className={`role-badge role-${u.role}`}>
										{u.role}
									</span>
								)}
							</td>
							<td>
								{u.blocked ? (
									<span className='blocked-badge'>
										Blocked
									</span>
								) : (
									<span className='active-badge'>
										Active
									</span>
								)}
							</td>
							<td>
								{editingUser === u.id ? (
									<>
										<button
											className='btn-success'
											onClick={() =>
												handleUpdateRole(u.id)
											}
										>
											Save
										</button>
										<button
											className='btn-secondary'
											onClick={() => {
												setEditingUser(null)
												setNewRole('')
											}}
										>
											Cancel
										</button>
									</>
								) : (
									<>
										<button
											className='btn-secondary'
											onClick={() => {
												setEditingUser(u.id)
												setNewRole(u.role)
											}}
										>
											Edit
										</button>
										<button
											className={
												u.blocked
													? 'btn-success'
													: 'btn-danger'
											}
											onClick={() =>
												handleBlockUser(u.id)
											}
										>
											{u.blocked
												? 'Unblock'
												: 'Block'}
										</button>
									</>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
