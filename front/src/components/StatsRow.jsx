import s from './StatsRow.module.css'

/**
 * Todas las cifras se calculan a partir de datos reales. "Vencidas" sustituye
 * al antiguo placeholder fijo en 0.
 */
export default function StatsRow({ total, pending, overdue, pct }) {
  return (
    <div className={s.row}>
      <Stat label="Total" value={total} sub="tareas" />
      <Stat label="Pendientes" value={pending} sub="por hacer" />
      <Stat
        label="Vencidas"
        value={overdue}
        sub={overdue === 0 ? 'todo al día' : 'requieren atención'}
        valueColor={overdue > 0 ? 'var(--p-high)' : undefined}
        dotColor={overdue > 0 ? 'var(--p-high)' : undefined}
      />
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
        {dotColor && <span className={s.dot} style={{ background: dotColor }} aria-hidden="true" />}
        {sub}
      </p>
    </div>
  )
}
