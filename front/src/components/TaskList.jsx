import TaskCard from './TaskCard'
import s from './TaskList.module.css'

export default function TaskList({ tasks }) {
  const pending = tasks.filter((t) => !t.completed)
  const done = tasks.filter((t) => t.completed)

  if (!tasks.length) {
    return (
      <div className={s.empty}>
        <div className={s.emptyIcon} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="4" y="6" width="32" height="28" rx="5" />
            <path d="M12 15h16M12 21h10M12 27h8" strokeLinecap="round" />
          </svg>
        </div>
        <p className={s.emptyTitle}>Sin tareas aquí</p>
        <p className={s.emptySub}>
          Pulsa <kbd className={s.kbd}>N</kbd> o el botón <strong>+</strong> para crear una
        </p>
      </div>
    )
  }

  return (
    <div className={s.list}>
      {pending.length > 0 && (
        <Section title="Pendientes" count={pending.length}>
          {pending.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Completadas" count={done.length} muted>
          {done.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, count, muted, children }) {
  return (
    <section className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={`${s.sectionTitle} ${muted ? s.muted : ''}`}>{title}</h2>
        <span className={`${s.sectionCount} ${muted ? s.muted : ''}`}>{count}</span>
        <div className={s.sectionLine} aria-hidden="true" />
      </div>
      <div className={s.sectionBody}>{children}</div>
    </section>
  )
}
