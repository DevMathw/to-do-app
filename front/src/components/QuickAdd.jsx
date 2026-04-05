import { useState, useRef, useEffect } from 'react'
import { useTaskStore, PRIORITIES, TAGS } from '../store/useTaskStore'
import s from './QuickAdd.module.css'

export default function QuickAdd({ onClose }) {
  const { addTask } = useTaskStore()
  const [form, setForm] = useState({
    title: '', description: '', priority: 'med', tag: 'work', due: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

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

  const onChange = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const priority = PRIORITIES.find(p => p.value === form.priority)
  const tag      = TAGS.find(t => t.value === form.tag)

  return (
    <form className={s.form} onSubmit={onSubmit}>
      <div className={s.main}>
        {/* Priority dot indicator */}
        <span className={s.prioDot} style={{ background: priority?.color }} />

        <input
          ref={inputRef}
          className={s.input}
          value={form.title}
          onChange={onChange('title')}
          placeholder="¿En qué estás trabajando? (Enter para guardar, Esc para cerrar)"
          onKeyDown={e => { if (e.key === 'Escape') onClose() }}
        />
      </div>

      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          {/* Priority selector */}
          <div className={s.toolGroup}>
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                type="button"
                className={`${s.toolBtn} ${form.priority === p.value ? s.toolActive : ''}`}
                style={form.priority === p.value ? { borderColor: p.color, color: p.color } : {}}
                onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                title={`Prioridad: ${p.label}`}
              >
                <span className={s.dot} style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className={s.sep} />

          {/* Tag selector */}
          <div className={s.toolGroup}>
            {TAGS.map(t => (
              <button
                key={t.value}
                type="button"
                className={`${s.toolBtn} ${form.tag === t.value ? s.toolActive : ''}`}
                style={form.tag === t.value
                  ? { background: t.bg, borderColor: 'transparent', color: t.textColor }
                  : {}
                }
                onClick={() => setForm(f => ({ ...f, tag: t.value }))}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={s.sep} />

          {/* Due date */}
          <input
            type="date"
            className={s.dateInput}
            value={form.due}
            onChange={onChange('due')}
            title="Fecha límite"
          />
        </div>

        <div className={s.toolbarRight}>
          {error && <span className={s.error}>{error}</span>}
          <button type="button" className={s.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className={s.submitBtn}
            disabled={loading || !form.title.trim()}
          >
            {loading ? '...' : 'Agregar tarea'}
          </button>
        </div>
      </div>
    </form>
  )
}
