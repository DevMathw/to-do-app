import { useEffect, useRef, useState } from 'react'
import { PRIORITIES, TAGS, useTaskStore } from '../store/useTaskStore'
import s from './QuickAdd.module.css'

const EMPTY = { title: '', description: '', priority: 'med', tag: 'work', due_date: '' }

export default function QuickAdd({ onClose }) {
  const { addTask } = useTaskStore()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const panelRef = useRef(null)
  const inputRef = useRef(null)
  // Se recuerda quién tenía el foco para devolvérselo al cerrar.
  const openerRef = useRef(null)

  useEffect(() => {
    openerRef.current = document.activeElement
    inputRef.current?.focus()
    return () => openerRef.current?.focus?.()
  }, [])

  // Escape cierra, y Tab queda atrapado dentro del panel mientras está abierto.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusables = panelRef.current.querySelectorAll(
        'button:not([disabled]), input, select, textarea, [href]',
      )
      if (!focusables.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const node = panelRef.current
    node?.addEventListener('keydown', onKeyDown)
    return () => node?.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    setError('')
    try {
      await addTask(form)
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === form.priority)

  return (
    <form
      ref={panelRef}
      className={s.form}
      onSubmit={onSubmit}
      role="dialog"
      aria-modal="true"
      aria-label="Nueva tarea"
    >
      <div className={s.main}>
        <span
          className={s.prioDot}
          style={{ background: selectedPriority?.color }}
          aria-hidden="true"
        />
        <label className={s.srOnly} htmlFor="quickadd-title">
          Título de la tarea
        </label>
        <input
          ref={inputRef}
          id="quickadd-title"
          className={s.input}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="¿En qué estás trabajando? (Enter para guardar, Esc para cerrar)"
        />
      </div>

      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <div className={s.toolGroup} role="group" aria-label="Prioridad">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`${s.toolBtn} ${form.priority === p.value ? s.toolActive : ''}`}
                style={form.priority === p.value ? { borderColor: p.color, color: p.color } : {}}
                onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                aria-pressed={form.priority === p.value}
              >
                <span className={s.dot} style={{ background: p.color }} aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>

          <div className={s.sep} aria-hidden="true" />

          <div className={s.toolGroup} role="group" aria-label="Etiqueta">
            {TAGS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${s.toolBtn} ${form.tag === t.value ? s.toolActive : ''}`}
                style={
                  form.tag === t.value
                    ? { background: t.bg, borderColor: 'transparent', color: t.textColor }
                    : {}
                }
                onClick={() => setForm((f) => ({ ...f, tag: t.value }))}
                aria-pressed={form.tag === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={s.sep} aria-hidden="true" />

          <label className={s.srOnly} htmlFor="quickadd-due">
            Fecha límite
          </label>
          <input
            id="quickadd-due"
            type="date"
            className={s.dateInput}
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />
        </div>

        <div className={s.toolbarRight}>
          <button type="button" className={s.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className={s.submitBtn}
            disabled={loading || !form.title.trim()}
          >
            {loading ? 'Guardando…' : 'Agregar tarea'}
          </button>
        </div>
      </div>

      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
