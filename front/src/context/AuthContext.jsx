import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  SESSION_EXPIRED,
  getMe,
  login as apiLogin,
  register as apiRegister,
  tokenStorage,
} from '../api/client'
import { useTaskStore } from '../store/useTaskStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionMessage, setSessionMessage] = useState('')

  const logout = useCallback(() => {
    tokenStorage.clear()
    useTaskStore.getState().reset()
    setUser(null)
  }, [])

  /**
   * Al arrancar se valida el token contra el servidor en lugar de confiar en
   * lo que haya en localStorage: un token caducado o manipulado dejaba antes
   * la aplicación en un estado "autenticado" que no lo estaba.
   */
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      if (!tokenStorage.get()) {
        setLoading(false)
        return
      }
      try {
        const me = await getMe()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) logout()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [logout])

  // Cualquier 401 del cliente cierra la sesión y explica por qué.
  useEffect(() => {
    const handleExpired = () => {
      setSessionMessage('Tu sesión ha caducado. Vuelve a iniciar sesión.')
      logout()
    }
    window.addEventListener(SESSION_EXPIRED, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED, handleExpired)
  }, [logout])

  /**
   * Activa en la interfaz una sesión cuyo token ya está guardado.
   * Se separa de `login` porque el flujo de demostración necesita crear las
   * tareas de ejemplo antes de que la app navegue al dashboard: en cuanto se
   * fija el usuario, el enrutador redirige.
   */
  const adoptSession = async () => {
    const me = await getMe()
    setSessionMessage('')
    setUser(me)
    return me
  }

  const login = async (credentials) => {
    const { access_token } = await apiLogin(credentials)
    tokenStorage.set(access_token)
    return adoptSession()
  }

  const register = (data) => apiRegister(data)

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, adoptSession, sessionMessage }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
