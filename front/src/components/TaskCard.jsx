import { useState } from 'react'
import { PRIORITIES, TAGS, priorityOf, tagOf, useTaskStore } from '../store/useTaskStore'
import { formatDueDate, isOverdue } from '../lib/taskFilters'
import s from './TaskCard.module.css'

export default function TaskCard({ task }) {
  const { toggleTask, editTask, removeTask } = useTaskStore()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    tag: task.tag,
    due_date: task.due_date ?? '',
  })

  const tag = tagOf(task.tag)
  const priority = priorityOf(task.priority)
  const overdue = isOverdue(task)

  const run = async (action) => {
    setBusy(true)
    setError('')
    try {
      await action()
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    if (await run(() => editTask(task.id, form))) setEditing(false)
  }

  const startEditing = () => {
    setForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      tag: task.tag,
      due_date: task.due_date ?? '',
    })
    setError('')
    setEditing(true)
  }

  if (editing) {
    return (
      <div className={`${s.card} ${s.editCard}`}>
        <label className={s.srOnly} htmlFor={`title-${task.id}`}>Título</label>
        <input
          id={`title-${task.id}`}
          className={s.editTitle}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Título de la tarea"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setEditing(false)
          }}
        />

        <label className={s.srOnly} htmlFor={`desc-${task.id}`}>Descripción</label>
        <textarea
          id={`desc-${task.id}`}
          className={s.editDesc}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descripción (opcional)"
          rows={2}
        />

        <div className={s.editMeta}>
          <label className={s.srOnly} htmlFor={`prio-${task.id}`}>Prioridad</label>
          <select
            id={`prio-${task.id}`}
            className={s.metaSelect}
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <label className={s.srOnly} htmlFor={`tag-${task.id}`}>Etiqueta</label>
          <select
            id={`tag-${task.id}`}
            className={s.metaSelect}
            value={form.tag}
            onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
          >
            {TAGS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <label className={s.srOnly} htmlFor={`due-${task.id}`}>Fecha límite</label>
          <input
            id={`due-${task.id}`}
            type="date"
            className={s.metaSelect}
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />

          <div className={s.editActions}>
            <button className={s.cancelBtn} onClick={() => setEditing(false)} type="button">
              Cancelar
            </button>
            <button className={s.saveBtn} onClick={handleSave} type="button" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        {error && <p className={s.error} role="alert">{error}</p>}
      </div>
    )
  }

  return (
    <div className={`${s.card} ${task.completed ? s.done : ''}`}>
      <div className={s.priorityBar} style={{ background: priority.color }} aria-hidden="true" />

      <button
        className={`${s.checkbox} ${task.completed ? s.checked : ''}`}
        onClick={() => run(() => toggleTask(task.id))}
        role="checkbox"
        aria-checked={task.completed}
        aria-label={`Marcar "${task.title}" como ${task.completed ? 'pendiente' : 'completada'}`}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1.5 5l3 3L9 2" />
          </svg>
        )}
      </button>

      <div className={s.body}>
        <p className={s.title}>{task.title}</p>
        {task.description && <p className={s.desc}>{task.description}</p>}

        <div className={s.meta}>
          <span className={s.tag} style={{ background: tag.bg, color: tag.textColor }}>
            {tag.label}
          </span>

          <span className={s.prioBadge} style={{ color: priority.color }}>
            <span className={s.prioDot} style={{ background: priority.color }} aria-hidden="true" />
            {priority.label}
          </span>

          {task.due_date && (
            <span className={`${s.due} ${overdue ? s.overdue : ''}`}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                <rect x="1" y="2" width="10" height="9" rx="1.5" />
                <path d="M4 1v2M8 1v2M1 5.5h10" />
              </svg>
              {formatDueDate(task.due_date)}
              {overdue && ' · vencida'}
            </span>
          )}
        </div>

        {error && <p className={s.error} role="alert">{error}</p>}
      </div>

      <div className={s.actions}>
        <button className={s.iconBtn} onClick={startEditing} aria-label={`Editar "${task.title}"`}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" />
          </svg>
        </button>
        <button
          className={`${s.iconBtn} ${s.deleteBtn}`}
          onClick={() => run(() => removeTask(task.id))}
          disabled={busy}
          aria-label={`Eliminar "${task.title}"`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3.5 3.5l.5 8h6l.5-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
