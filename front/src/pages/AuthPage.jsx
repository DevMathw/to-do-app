import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { startDemoSession } from '../api/demo'
import s from './AuthPage.module.css'

/** El backend gratuito se suspende por inactividad y tarda en despertar. */
const COLD_START_AFTER_MS = 4000

// Cada punto describe algo que la aplicación hace de verdad.
const FEATURES = [
  ['◈', 'Prioridades, etiquetas y fechas límite'],
  ['◉', 'Aviso de tareas vencidas'],
  ['⟡', 'Búsqueda y filtros combinables'],
  ['⊞', 'Tus tareas, solo tuyas'],
]

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false)
  const { login, register, adoptSession, sessionMessage } = useAuth()
  const navigate = useNavigate()
  const slowTimer = useRef(null)

  useEffect(() => () => clearTimeout(slowTimer.current), [])

  const startWaiting = () => {
    setLoading(true)
    setError('')
    slowTimer.current = setTimeout(() => setSlow(true), COLD_START_AFTER_MS)
  }

  const stopWaiting = () => {
    clearTimeout(slowTimer.current)
    setSlow(false)
    setLoading(false)
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    startWaiting()
    try {
      if (mode === 'register') await register(form)
      await login({ username: form.username, password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      stopWaiting()
    }
  }

  const onDemo = async () => {
    startWaiting()
    try {
      await startDemoSession(adoptSession)
      navigate('/', { replace: true })
    } catch (err) {
      setError(`No se pudo crear la cuenta de demostración: ${err.message}`)
      stopWaiting()
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
    setForm({ username: '', email: '', password: '' })
  }

  const isRegister = mode === 'register'

  return (
    <div className={s.layout}>
      <aside className={s.panel}>
        <div className={s.panelInner}>
          <div className={s.logo}>
            <div className={s.logoIcon} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                <rect x="1" y="2" width="14" height="2.5" rx="1.2" />
                <rect x="1" y="6.8" width="9" height="2.5" rx="1.2" />
                <rect x="1" y="11.5" width="11" height="2.5" rx="1.2" />
              </svg>
            </div>
            <span className={s.logoName}>To-Do App</span>
          </div>

          <h1 className={s.headline}>
            Organiza tu trabajo.
            <br />
            <span className={s.accentText}>Domina tu día.</span>
          </h1>
          <p className={s.sub}>
            Gestor de tareas con cuentas de usuario y aislamiento real de datos.
          </p>

          <ul className={s.features}>
            {FEATURES.map(([icon, text]) => (
              <li className={s.feature} key={text}>
                <span className={s.featureIcon} aria-hidden="true">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={s.panelBg} aria-hidden="true" />
      </aside>

      <main className={s.formSide}>
        <div className={s.formCard}>
          <div className={s.formHeader}>
            <h2 className={s.formTitle}>
              {isRegister ? 'Crear cuenta' : 'Bienvenido de nuevo'}
            </h2>
            <p className={s.formSub}>
              {isRegister
                ? 'Elige un usuario y una contraseña de al menos 8 caracteres'
                : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          {sessionMessage && (
            <p className={s.notice} role="status">
              {sessionMessage}
            </p>
          )}

          <form onSubmit={onSubmit} className={s.form} noValidate>
            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="username">
                Usuario
              </label>
              <input
                className={s.fieldInput}
                id="username"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="johndoe"
                autoComplete="username"
                required
              />
            </div>

            {isRegister && (
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="email">
                  Email
                </label>
                <input
                  className={s.fieldInput}
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="john@ejemplo.com"
                  autoComplete="email"
                  required
                />
              </div>
            )}

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="password">
                Contraseña
              </label>
              <input
                className={s.fieldInput}
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </div>

            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}

            {slow && (
              <p className={s.notice} role="status">
                Esto está tardando más de lo normal. El servidor gratuito se
                suspende por inactividad y la primera petición puede tardar
                hasta un minuto en despertarlo.
              </p>
            )}

            <button className={s.submit} type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className={s.spinner} aria-hidden="true" />
                  <span className={s.srOnly}>Enviando</span>
                </>
              ) : isRegister ? (
                'Crear cuenta'
              ) : (
                'Iniciar sesión'
              )}
            </button>

            <button
              className={s.demoBtn}
              type="button"
              onClick={onDemo}
              disabled={loading}
            >
              Probar la demo sin registrarme
            </button>
          </form>

          <p className={s.switchRow}>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button className={s.switchBtn} onClick={switchMode} type="button">
              {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
