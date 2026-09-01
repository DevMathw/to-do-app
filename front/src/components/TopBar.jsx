import { PRIORITIES, TAGS } from '../store/useTaskStore'
import s from './TopBar.module.css'

const BASE_LABELS = {
  all: 'Mis tareas',
  today: 'Para hoy',
  pending: 'Pendientes',
  done: 'Completadas',
}

// Las etiquetas vienen del store: antes esta lista estaba duplicada aquí con
// colores distintos a los de las tarjetas.
const VIEW_LABELS = {
  ...BASE_LABELS,
  ...Object.fromEntries(TAGS.map((t) => [t.value, t.label])),
}

const FILTERS = [{ value: 'all', label: 'Todas' }, ...PRIORITIES]

export default function TopBar({
  view,
  priority,
  setPriority,
  search,
  setSearch,
  onAdd,
  onOpenMenu,
}) {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className={s.topbar}>
      <div className={s.left}>
        <button className={s.menuBtn} onClick={onOpenMenu} aria-label="Abrir menú">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            <rect x="1" y="3" width="16" height="2" rx="1" />
            <rect x="1" y="8" width="16" height="2" rx="1" />
            <rect x="1" y="13" width="16" height="2" rx="1" />
          </svg>
        </button>
        <div>
          <h1 className={s.title}>{VIEW_LABELS[view] ?? view}</h1>
          <p className={s.date}>{today}</p>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.searchWrap}>
          <label className={s.srOnly} htmlFor="task-search">
            Buscar tareas
          </label>
          <input
            id="task-search"
            className={s.search}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
          />
        </div>

        <div className={s.filters} role="group" aria-label="Filtrar por prioridad">
          {FILTERS.map((p) => (
            <button
              key={p.value}
              className={`${s.pill} ${priority === p.value ? s.pillActive : ''}`}
              onClick={() => setPriority(p.value)}
              aria-pressed={priority === p.value}
            >
              {p.color && (
                <span className={s.pillDot} style={{ background: p.color }} aria-hidden="true" />
              )}
              {p.label}
            </button>
          ))}
        </div>

        <button className={s.addBtn} onClick={onAdd}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M7 2v10M2 7h10" />
          </svg>
          Nueva tarea
        </button>
      </div>
    </header>
  )
}
