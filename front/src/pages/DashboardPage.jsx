import { useEffect, useState } from 'react'
import { useAuth }         from '../context/AuthContext'
import { useTaskStore }    from '../store/useTaskStore'
import Sidebar             from '../components/Sidebar'
import TopBar              from '../components/TopBar'
import StatsRow            from '../components/StatsRow'
import TaskList            from '../components/TaskList'
import QuickAdd            from '../components/QuickAdd'
import s from './DashboardPage.module.css'

export default function DashboardPage() {
  const { logout }                         = useAuth()
  const { tasks, fetchTasks, loading }     = useTaskStore()
  const [view, setView]                    = useState('all')
  const [priority, setPriority]            = useState('all')
  const [showQuickAdd, setShowQuickAdd]    = useState(false)

  useEffect(() => {
    fetchTasks().catch(err => {
      if (err.message.includes('401')) logout()
    })
  }, [])

  // Keyboard shortcut: N = new task
  useEffect(() => {
    const handler = e => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        setShowQuickAdd(true)
      }
      if (e.key === 'Escape') setShowQuickAdd(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const pending  = tasks.filter(t => !t.completed).length
  const done     = tasks.filter(t =>  t.completed).length
  const pct      = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className={s.layout}>
      <Sidebar
        view={view}
        setView={setView}
        tasks={tasks}
        logout={logout}
      />

      <div className={s.content}>
        <TopBar
          view={view}
          priority={priority}
          setPriority={setPriority}
          onAdd={() => setShowQuickAdd(true)}
        />

        <StatsRow total={tasks.length} done={done} pending={pending} pct={pct} />

        {/* Progress bar */}
        <div className={s.progressWrap}>
          <div className={s.progressRow}>
            <span className={s.progressLabel}>Progreso semanal</span>
            <span className={s.progressVal}>{done} / {tasks.length} tareas</span>
          </div>
          <div className={s.progressBar}>
            <div className={s.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {showQuickAdd && (
          <div className={s.quickAddWrap}>
            <QuickAdd onClose={() => setShowQuickAdd(false)} />
          </div>
        )}

        <div className={s.taskArea}>
          {loading
            ? <Spinner />
            : <TaskList view={view} priority={priority} />
          }
        </div>
      </div>

      {/* FAB */}
      <button
        className={`${s.fab} ${showQuickAdd ? s.fabActive : ''}`}
        onClick={() => setShowQuickAdd(v => !v)}
        title="Nueva tarea (N)"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
          <path d="M10 4v12M4 10h12"/>
        </svg>
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
      <span style={{
        width: 28, height: 28,
        border: '2px solid var(--surface3)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}
