import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTaskStore } from '../store/useTaskStore'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import StatsRow from '../components/StatsRow'
import TaskList from '../components/TaskList'
import QuickAdd from '../components/QuickAdd'
import { isOverdue, matchesView } from '../lib/taskFilters'
import s from './DashboardPage.module.css'

export default function DashboardPage() {
  const { logout } = useAuth()
  const { tasks, fetchTasks, loading, error, clearError } = useTaskStore()

  const [view, setView] = useState('all')
  const [priority, setPriority] = useState('all')
  const [search, setSearch] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Un 401 ya cierra la sesión desde el cliente HTTP; aquí solo se evita
    // que el rechazo quede sin capturar.
    fetchTasks().catch(() => {})
  }, [fetchTasks])

  // Atajo: N abre el formulario de nueva tarea.
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement
      if (!el) return false
      return (
        el.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
      )
    }

    const handler = (e) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping()) {
        e.preventDefault()
        setShowQuickAdd(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.completed).length
    const overdue = tasks.filter(isOverdue).length
    return {
      total: tasks.length,
      done,
      pending: tasks.length - done,
      overdue,
      pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    }
  }, [tasks])

  const visible = useMemo(
    () =>
      tasks.filter((task) => {
        if (!matchesView(task, view)) return false
        if (priority !== 'all' && task.priority !== priority) return false
        if (search.trim()) {
          const needle = search.trim().toLowerCase()
          const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
          if (!haystack.includes(needle)) return false
        }
        return true
      }),
    [tasks, view, priority, search],
  )

  return (
    <div className={s.layout}>
      <Sidebar
        view={view}
        setView={(next) => {
          setView(next)
          setMenuOpen(false)
        }}
        tasks={tasks}
        logout={logout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {menuOpen && (
        <div
          className={s.scrim}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={s.content}>
        <TopBar
          view={view}
          priority={priority}
          setPriority={setPriority}
          search={search}
          setSearch={setSearch}
          onAdd={() => setShowQuickAdd(true)}
          onOpenMenu={() => setMenuOpen(true)}
        />

        {error && (
          <div className={s.errorBar} role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                clearError()
                fetchTasks().catch(() => {})
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        <StatsRow {...stats} />

        <div className={s.progressWrap}>
          <div className={s.progressRow}>
            <span className={s.progressLabel}>Progreso general</span>
            <span className={s.progressVal}>
              {stats.done} / {stats.total} tareas
            </span>
          </div>
          <div
            className={s.progressBar}
            role="progressbar"
            aria-valuenow={stats.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tareas completadas"
          >
            <div className={s.progressFill} style={{ width: `${stats.pct}%` }} />
          </div>
        </div>

        {showQuickAdd && (
          <div className={s.quickAddWrap}>
            <QuickAdd onClose={() => setShowQuickAdd(false)} />
          </div>
        )}

        <div className={s.taskArea}>
          {loading ? (
            <div className={s.loading}>
              <span className={s.spinner} aria-hidden="true" />
              <p>Cargando tus tareas…</p>
            </div>
          ) : (
            <TaskList tasks={visible} />
          )}
        </div>
      </div>

      <button
        className={`${s.fab} ${showQuickAdd ? s.fabActive : ''}`}
        onClick={() => setShowQuickAdd((v) => !v)}
        aria-label="Nueva tarea (tecla N)"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M10 4v12M4 10h12" />
        </svg>
      </button>
    </div>
  )
}
