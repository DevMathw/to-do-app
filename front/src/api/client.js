/**
 * Cliente HTTP de la API.
 *
 * Centraliza la cabecera de autorización, la normalización de errores y la
 * detección de sesión caducada. Los componentes nunca llaman a fetch
 * directamente.
 */

const BASE = import.meta.env.VITE_API_URL || '/api/v1'

const TOKEN_KEY = 'todo.token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

/** Error de API que conserva el código HTTP, para poder actuar sobre él. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Se emite cuando el servidor rechaza el token. AuthContext lo escucha y
 * cierra la sesión: antes se comprobaba el texto del mensaje, que dependía
 * del idioma de la respuesta y nunca coincidía.
 */
export const SESSION_EXPIRED = 'api:session-expired'

function parseErrorDetail(data, status) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  // Red de seguridad por si alguna respuesta escapa al normalizador del backend.
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  return `Error ${status}`
}

async function request(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {}
  if (auth) {
    const token = tokenStorage.get()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let payload
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    payload = new URLSearchParams(form).toString()
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${BASE}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Comprueba tu conexión.',
      0,
    )
  }

  if (response.status === 401 && auth) {
    tokenStorage.clear()
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED))
    throw new ApiError('Tu sesión ha caducado. Vuelve a iniciar sesión.', 401)
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(parseErrorDetail(data, response.status), response.status)
  }
  return data
}

/* --- Autenticación ------------------------------------------------------ */

export const register = ({ username, email, password }) =>
  request('/auth/register', {
    method: 'POST',
    body: { username, email, password },
    auth: false,
  })

export const login = ({ username, password }) =>
  request('/auth/login', {
    method: 'POST',
    form: { username, password },
    auth: false,
  })

/** Valida el token guardado contra el servidor al arrancar la aplicación. */
export const getMe = () => request('/auth/me')

/* --- Tareas ------------------------------------------------------------- */

export const getTasks = (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  const query = params.toString()
  return request(`/tasks${query ? `?${query}` : ''}`)
}

export const createTask = (data) =>
  request('/tasks', { method: 'POST', body: data })

export const updateTask = (id, data) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: data })

export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: 'DELETE' })
