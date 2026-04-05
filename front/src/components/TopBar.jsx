import s from './TopBar.module.css'

const VIEW_LABELS = {
  all: 'Mis tareas', today: 'Hoy', pending: 'Pendientes',
  done: 'Completadas', work: 'Trabajo', personal: 'Personal',
  design: 'Diseño', dev: 'Dev',
}

const PRIORITIES = [
  { value: 'all',  label: 'Todas' },
  { value: 'high', label: 'Alta',  color: '#F26464' },
  { value: 'med',  label: 'Media', color: '#F5A623' },
  { value: 'low',  label: 'Baja',  color: '#52C97A' },
]

export default function TopBar({ view, priority, setPriority, onAdd }) {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className={s.topbar}>
      <div className={s.left}>
        <h1 className={s.title}>{VIEW_LABELS[view] ?? view}</h1>
        <p className={s.date} style={{ textTransform: 'capitalize' }}>{today}</p>
      </div>

      <div className={s.right}>
        <div className={s.filters}>
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              className={`${s.pill} ${priority === p.value ? s.pillActive : ''}`}
              onClick={() => setPriority(p.value)}
            >
              {p.color && (
                <span className={s.pillDot} style={{ background: p.color }} />
              )}
              {p.label}
            </button>
          ))}
        </div>

        <div className={s.divider} />

        <button className={s.addBtn} onClick={onAdd}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2v10M2 7h10"/>
          </svg>
          Nueva tarea
        </button>
      </div>
    </div>
  )
}
