import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import s from './AuthPage.module.css'

export default function AuthPage() {
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ username: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register }   = useAuth()
  const navigate              = useNavigate()

  const onChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (mode === 'register') await register(form)
      await login({ username: form.username, password: form.password })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setForm({ username: '', email: '', password: '' })
  }

  return (
    <div className={s.layout}>
      <aside className={s.panel}>
        <div className={s.panelInner}>
          <div className={s.logo}>
            <div className={s.logoIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                <rect x="1" y="2"    width="14" height="2.5" rx="1.2"/>
                <rect x="1" y="6.8"  width="9"  height="2.5" rx="1.2"/>
                <rect x="1" y="11.5" width="11" height="2.5" rx="1.2"/>
              </svg>
            </div>
            <span className={s.logoName}>To-Do App</span>
          </div>

          <h1 className={s.headline}>
            Organiza tu trabajo.<br />
            <span className={s.accentText}>Domina tu día.</span>
          </h1>
          <p className={s.sub}>
            La herramienta que los equipos de alto rendimiento usan para hacer más, en menos tiempo.
          </p>

          <div className={s.features}>
            {[
              ['◈', 'Gestión de tareas con prioridades'],
              ['◉', 'Dashboard en tiempo real'],
              ['⟡', 'Organización por proyectos'],
              ['⊞', 'Drag & drop intuitivo'],
            ].map(([icon, text]) => (
              <div className={s.feature} key={text}>
                <span className={s.featureIcon}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={s.panelBg} aria-hidden />
      </aside>

      <main className={s.formSide}>
        <div className={s.formCard} key={mode}>
          <div className={s.formHeader}>
            <h2 className={s.formTitle}>
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h2>
            <p className={s.formSub}>
              {mode === 'login'
                ? 'Ingresa tus credenciales para continuar'
                : 'Empieza gratis, sin tarjeta de crédito'}
            </p>
          </div>

          <form onSubmit={onSubmit} className={s.form}>
            <div>
              <label className={s.fieldLabel}>Usuario</label>
              <input className={s.fieldInput} name="username" value={form.username}
                onChange={onChange} placeholder="johndoe" autoComplete="username" required />
            </div>

            {mode === 'register' && (
              <div>
                <label className={s.fieldLabel}>Email</label>
                <input className={s.fieldInput} name="email" type="email" value={form.email}
                  onChange={onChange} placeholder="john@ejemplo.com" required />
              </div>
            )}

            <div>
              <label className={s.fieldLabel}>Contraseña</label>
              <input className={s.fieldInput} name="password" type="password"
                value={form.password} onChange={onChange} placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
            </div>

            {error && <div className={s.error}>{error}</div>}

            <button className={s.submit} type="submit" disabled={loading}>
              {loading ? <span className={s.spinner} /> : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <p className={s.switchRow}>
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button className={s.switchBtn} onClick={switchMode} type="button">
              {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
