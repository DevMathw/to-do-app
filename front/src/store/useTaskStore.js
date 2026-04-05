import { create } from 'zustand'
import * as api from '../api/client'

export const PRIORITIES = [
  { value: 'high', label: 'Alta',  color: 'var(--p-high)' },
  { value: 'med',  label: 'Media', color: 'var(--p-med)'  },
  { value: 'low',  label: 'Baja',  color: 'var(--p-low)'  },
]

export const TAGS = [
  { value: 'work',     label: 'Trabajo',  textColor: 'var(--tag-work-t)',     bg: 'var(--tag-work-bg)'     },
  { value: 'personal', label: 'Personal', textColor: 'var(--tag-personal-t)', bg: 'var(--tag-personal-bg)' },
  { value: 'design',   label: 'Diseño',   textColor: 'var(--tag-design-t)',   bg: 'var(--tag-design-bg)'   },
  { value: 'dev',      label: 'Dev',      textColor: 'var(--tag-dev-t)',       bg: 'var(--tag-dev-bg)'      },
]

export const useTaskStore = create((set, get) => ({
  tasks:   [],
  loading: false,
  error:   null,

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const tasks = await api.getTasks()
      set({ tasks: tasks.map(decorateTask), loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  addTask: async ({ title, description, priority, tag, due }) => {
    const task = await api.createTask({ title, description })
    const decorated = decorateTask(task, { priority, tag, due })
    set(s => ({ tasks: [decorated, ...s.tasks] }))
    return decorated
  },

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    const updated = await api.updateTask(id, { completed: !task.completed })
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updated } : t) }))
  },

  editTask: async (id, data) => {
    const updated = await api.updateTask(id, { title: data.title, description: data.description })
    set(s => ({
      tasks: s.tasks.map(t =>
        t.id === id ? { ...t, ...updated, priority: data.priority, tag: data.tag, due: data.due } : t
      ),
    }))
  },

  removeTask: async (id) => {
    await api.deleteTask(id)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },
}))

const pCycle = ['high', 'med', 'low']
let _i = 0
function decorateTask(task, extra = {}) {
  return { priority: pCycle[_i++ % 3], tag: 'work', due: null, ...task, ...extra }
}
