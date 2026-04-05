import { useTaskStore } from '../store/useTaskStore'
import TaskCard from './TaskCard'
import s from './TaskList.module.css'

export default function TaskList({ view, priority }) {
  const { tasks } = useTaskStore()

  const filtered = tasks.filter(t => {
    const byView =
      view === 'all'     ? true :
      view === 'pending' ? !t.completed :
      view === 'done'    ? t.completed :
      view === 'today'   ? !t.completed :
      t.tag === view
    const byPrio = priority === 'all' || t.priority === priority
    return byView && byPrio
  })

  const pending = filtered.filter(t => !t.completed)
  const done    = filtered.filter(t =>  t.completed)

  if (!pending.length && !done.length) {
    return (
      <div className={s.empty}>
        <div className={s.emptyIcon}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="4" y="6" width="32" height="28" rx="5"/>
            <path d="M12 15h16M12 21h10M12 27h8" strokeLinecap="round"/>
          </svg>
        </div>
        <p className={s.emptyTitle}>Sin tareas aquí</p>
        <p className={s.emptySub}>Presiona <kbd className={s.kbd}>N</kbd> o el botón <strong>+</strong> para crear una</p>
      </div>
    )
  }

  return (
    <div className={s.list}>
      {pending.length > 0 && (
        <Section title="Pendientes" count={pending.length}>
          {pending.map((task, i) => (
            <div key={task.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <TaskCard task={task} />
            </div>
          ))}
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Completadas" count={done.length} muted>
          {done.map((task, i) => (
            <div key={task.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <TaskCard task={task} />
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, count, muted, children }) {
  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <span className={`${s.sectionTitle} ${muted ? s.muted : ''}`}>{title}</span>
        <span className={`${s.sectionCount} ${muted ? s.muted : ''}`}>{count}</span>
        <div className={s.sectionLine} />
      </div>
      <div className={s.sectionBody}>{children}</div>
    </div>
  )
}
