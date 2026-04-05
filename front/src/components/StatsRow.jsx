import s from './StatsRow.module.css'

export default function StatsRow({ total, done, pending, pct }) {
  const overdue = 0 // placeholder – could be computed from due dates

  return (
    <div className={s.row}>
      <Stat label="Total" value={total} sub="tareas activas" />
      <Stat label="Completadas" value={done} sub="esta semana" valueColor="var(--p-low)" dotColor="var(--p-low)" />
      <Stat label="Pendientes" value={pending} sub="por hacer" valueColor="var(--text)" />
      <Stat label="Progreso" value={`${pct}%`} sub="completado" valueColor="var(--accent)" />
    </div>
  )
}

function Stat({ label, value, sub, valueColor, dotColor }) {
  return (
    <div className={s.card}>
      <p className={s.label}>{label}</p>
      <p className={s.value} style={{ color: valueColor || 'var(--text)' }}>
        {value}
      </p>
      <p className={s.sub}>
        {dotColor && <span className={s.dot} style={{ background: dotColor }} />}
        {sub}
      </p>
    </div>
  )
}
