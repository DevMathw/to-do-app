import { useAuth } from '../context/AuthContext'
import s from './Sidebar.module.css'

const NAV = [
  { id: 'all',     label: 'Mis tareas',  icon: ListIcon  },
  { id: 'today',   label: 'Hoy',         icon: TodayIcon },
  { id: 'pending', label: 'Pendientes',  icon: ClockIcon },
  { id: 'done',    label: 'Completadas', icon: CheckIcon },
]

const PROJECTS = [
  { id: 'work',     label: 'Trabajo',  color: '#3B4FD4' },
  { id: 'personal', label: 'Personal', color: '#7C3DBF' },
  { id: 'design',   label: 'Diseño',   color: '#C4398A' },
  { id: 'dev',      label: 'Dev',      color: '#52C97A' },
]

export default function Sidebar({ view, setView, tasks, logout }) {
  const { user } = useAuth()

  const count = (id) => {
    if (id === 'all')     return tasks.length
    if (id === 'pending') return tasks.filter(t => !t.completed).length
    if (id === 'done')    return tasks.filter(t =>  t.completed).length
    if (id === 'today')   return tasks.filter(t => !t.completed).length
    return tasks.filter(t => t.tag === id).length
  }

  return (
    <aside className={s.sidebar}>
      {/* Brand */}
      <div className={s.brand}>
        <div className={s.brandIcon}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
            <rect x="1" y="2"    width="14" height="2.5" rx="1.2"/>
            <rect x="1" y="6.8"  width="9"  height="2.5" rx="1.2"/>
            <rect x="1" y="11.5" width="11" height="2.5" rx="1.2"/>
          </svg>
        </div>
        <span className={s.brandName}>To-Do App</span>
      </div>

      {/* Main nav */}
      <nav className={s.nav}>
        <p className={s.navLabel}>Menú</p>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${s.navItem} ${view === id ? s.active : ''}`}
            onClick={() => setView(id)}
          >
            <Icon />
            <span>{label}</span>
            <span className={s.count}>{count(id)}</span>
          </button>
        ))}
      </nav>

      {/* Projects */}
      <nav className={s.nav} style={{ marginTop: '8px' }}>
        <p className={s.navLabel}>Proyectos</p>
        {PROJECTS.map(({ id, label, color }) => (
          <button
            key={id}
            className={`${s.navItem} ${view === id ? s.active : ''}`}
            onClick={() => setView(id)}
          >
            <span className={s.dot} style={{ background: color }} />
            <span>{label}</span>
            <span className={s.count}>{count(id)}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={s.footer}>
        <div className={s.userRow}>
          <div className={s.avatar}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className={s.userName}>{user?.username}</div>
            <div className={s.userPlan}>Pro plan</div>
          </div>
        </div>
        <button className={s.logoutBtn} onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

/* Icons */
function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2"   width="14" height="2.2" rx="1"/>
      <rect x="1" y="6.9" width="9"  height="2.2" rx="1"/>
      <rect x="1" y="11.6" width="11" height="2.2" rx="1"/>
    </svg>
  )
}
function TodayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="3" width="12" height="11" rx="2"/>
      <path d="M5 1.5v3M11 1.5v3M2 7.5h12"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 5v3.2l2.2 2.2" strokeLinecap="round"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="6"/>
      <path d="M5.5 8l2 2L10.5 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
