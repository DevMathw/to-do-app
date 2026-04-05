import { useState } from 'react'
import { useTaskStore, PRIORITIES, TAGS } from '../store/useTaskStore'
import s from './TaskCard.module.css'

export default function TaskCard({ task }) {
  const { toggleTask, editTask, removeTask } = useTaskStore()
  const [editing,  setEditing]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description || '',
    priority:    task.priority || 'med',
    tag:         task.tag || 'work',
    due:         task.due || '',
  })

  const tag      = TAGS.find(t => t.value === task.tag) || TAGS[0]
  const priority = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[1]

  const handleToggle = async (e) => {
    e.stopPropagation()
    setToggling(true)
    try { await toggleTask(task.id) }
    finally { setToggling(false) }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    setDeleting(true)
    try { await removeTask(task.id) }
    catch { setDeleting(false) }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    await editTask(task.id, form)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className={`${s.card} ${s.editCard} anim-pop`}>
        <input
          className={s.editTitle}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Título de la tarea"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
        />
        <textarea
          className={s.editDesc}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descripción (opcional)"
          rows={2}
        />
        <div className={s.editMeta}>
          <select
            className={s.metaSelect}
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            className={s.metaSelect}
            value={form.tag}
            onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
          >
            {TAGS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="date"
            className={s.metaSelect}
            value={form.due}
            onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
          />
          <div className={s.editActions}>
            <button className={s.cancelBtn} onClick={() => setEditing(false)}>Cancelar</button>
            <button className={s.saveBtn}   onClick={handleSave}>Guardar</button>
          </div>
        </div>
      </div>
    )
  }

  const isOverdue = task.due && !task.completed && new Date(task.due) < new Date()

  return (
    <div className={`${s.card} ${task.completed ? s.done : ''} ${deleting ? s.deleting : ''}`}>
      {/* Priority bar */}
      <div className={s.priorityBar} style={{ background: priority.color }} />

      {/* Checkbox */}
      <button
        className={`${s.checkbox} ${task.completed ? s.checked : ''} ${toggling ? s.toggling : ''}`}
        onClick={handleToggle}
        aria-label="Completar tarea"
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 5l3 3L9 2"/>
          </svg>
        )}
      </button>

      {/* Body */}
      <div className={s.body}>
        <p className={s.title}>{task.title}</p>
        {task.description && (
          <p className={s.desc}>{task.description}</p>
        )}
        <div className={s.meta}>
          {/* Tag pill */}
          <span
            className={s.tag}
            style={{ background: tag.bg, color: tag.textColor }}
          >
            {tag.label}
          </span>

          {/* Priority badge */}
          <span className={s.prioBadge} style={{ color: priority.color }}>
            <span className={s.prioDot} style={{ background: priority.color }} />
            {priority.label}
          </span>

          {/* Due date */}
          {task.due && (
            <span className={`${s.due} ${isOverdue ? s.overdue : ''}`}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="1" y="2" width="10" height="9" rx="1.5"/>
                <path d="M4 1v2M8 1v2M1 5.5h10"/>
              </svg>
              {formatDate(task.due)}
              {isOverdue && ' · vencida'}
            </span>
          )}
        </div>
      </div>

      {/* Actions (hover) */}
      <div className={s.actions}>
        <button
          className={s.iconBtn}
          onClick={e => { e.stopPropagation(); setEditing(true) }}
          title="Editar"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z"/>
          </svg>
        </button>
        <button
          className={`${s.iconBtn} ${s.deleteBtn}`}
          onClick={handleDelete}
          title="Eliminar"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3.5 3.5l.5 8h6l.5-8"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
