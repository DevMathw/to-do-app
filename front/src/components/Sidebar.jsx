import { useAuth } from '../context/AuthContext'
import { TAGS } from '../store/useTaskStore'
import { matchesView } from '../lib/taskFilters'
import s from './Sidebar.module.css'

const NAV = [
  { id: 'all', label: 'Mis tareas', icon: ListIcon },
  { id: 'today', label: 'Para hoy', icon: TodayIcon },
  { id: 'pending', label: 'Pendientes', icon: ClockIcon },
  { id: 'done', label: 'Completadas', icon: CheckIcon },
]

// Los colores del punto vienen de los mismos tokens que usan las etiquetas
// en las tarjetas, para que un "Dev" del menú y un "Dev" de una tarea
// coincidan siempre.
const TAG_DOT = {
  work: 'var(--tag-work-t)',
  personal: 'var(--tag-personal-t)',
  design: 'var(--tag-design-t)',
  dev: 'var(--tag-dev-t)',
}

export default function Sidebar({ view, setView, tasks, logout, open, onClose }) {
  const { user } = useAuth()

  const count = (id) => tasks.filter((task) => matchesView(task, id)).length

  const renderItem = ({ id, label, icon: Icon, dot }) => (
    <li key={id}>
      <button
        className={`${s.navItem} ${view === id ? s.active : ''}`}
        onClick={() => setView(id)}
        aria-current={view === id ? 'page' : undefined}
      >
        {Icon ? (
          <Icon />
        ) : (
          <span className={s.dot} style={{ background: dot }} aria-hidden="true" />
        )}
        <span className={s.itemLabel}>{label}</span>
        <span className={s.count}>{count(id)}</span>
      </button>
    </li>
  )

  return (
    <aside
      className={`${s.sidebar} ${open ? s.open : ''}`}
      aria-label="Navegación de tareas"
    >
      <div className={s.brand}>
        <div className={s.brandIcon} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
            <rect x="1" y="2" width="14" height="2.5" rx="1.2" />
            <rect x="1" y="6.8" width="9" height="2.5" rx="1.2" />
            <rect x="1" y="11.5" width="11" height="2.5" rx="1.2" />
          </svg>
        </div>
        <span className={s.brandName}>To-Do App</span>
        <button className={s.closeBtn} onClick={onClose} aria-label="Cerrar menú">
          ✕
        </button>
      </div>

      <nav className={s.nav}>
        <p className={s.navLabel} id="nav-menu">Menú</p>
        <ul className={s.navList} aria-labelledby="nav-menu">
          {NAV.map(renderItem)}
        </ul>
      </nav>

      <nav className={s.nav}>
        <p className={s.navLabel} id="nav-tags">Etiquetas</p>
        <ul className={s.navList} aria-labelledby="nav-tags">
          {TAGS.map(({ value, label }) =>
            renderItem({ id: value, label, dot: TAG_DOT[value] }),
          )}
        </ul>
      </nav>

      <div className={s.footer}>
        <div className={s.userRow}>
          <div className={s.avatar} aria-hidden="true">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className={s.userInfo}>
            <div className={s.userName}>{user?.username}</div>
            <div className={s.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button className={s.logoutBtn} onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

/* Iconos */
function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="2" width="14" height="2.2" rx="1" />
      <rect x="1" y="6.9" width="9" height="2.2" rx="1" />
      <rect x="1" y="11.6" width="11" height="2.2" rx="1" />
    </svg>
  )
}
function TodayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M5 1.5v3M11 1.5v3M2 7.5h12" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.2l2.2 2.2" strokeLinecap="round" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8l2 2L10.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
