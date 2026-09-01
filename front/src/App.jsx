import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

function Splash() {
  return (
    <div className="app-splash" role="status">
      <span className="app-spinner" aria-hidden="true" />
      <span className="sr-only">Cargando</span>
    </div>
  )
}

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return user ? children : <Navigate to="/auth" replace />
}

function Public({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<Public><AuthPage /></Public>} />
        <Route path="/" element={<Private><DashboardPage /></Private>} />
        {/* Una ruta desconocida muestra un 404 en lugar de redirigir en
            silencio: así un enlace roto es visible en vez de disfrazarse. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
