const BASE = import.meta.env.VITE_API_URL || '/api'

const getToken = () => localStorage.getItem('token')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

async function handle(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

/* Auth */
export const register = ({ username, email, password }) =>
  fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  }).then(handle)

export const login = ({ username, password }) => {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  }).then(handle)
}

/* Tasks */
export const getTasks = () =>
  fetch(`${BASE}/tasks/`, { headers: authHeaders() }).then(handle)

export const createTask = (data) =>
  fetch(`${BASE}/tasks/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handle)

export const updateTask = (id, data) =>
  fetch(`${BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handle)

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.detail || `Error ${res.status}`)
  }
}
