import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage     from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/auth" replace />
}
function Public({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<Public><AuthPage /></Public>} />
        <Route path="/"     element={<Private><DashboardPage /></Private>} />
        <Route path="*"     element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
