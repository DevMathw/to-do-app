import { create } from 'zustand'
import * as api from '../api/client'

/**
 * Única fuente de verdad para prioridades y etiquetas.
 * Antes estaban duplicadas en el store, en TopBar y en Sidebar, con colores
 * distintos en cada sitio.
 */
export const PRIORITIES = [
  { value: 'high', label: 'Alta', color: 'var(--p-high)' },
  { value: 'med', label: 'Media', color: 'var(--p-med)' },
  { value: 'low', label: 'Baja', color: 'var(--p-low)' },
]

export const TAGS = [
  { value: 'work', label: 'Trabajo', textColor: 'var(--tag-work-t)', bg: 'var(--tag-work-bg)' },
  { value: 'personal', label: 'Personal', textColor: 'var(--tag-personal-t)', bg: 'var(--tag-personal-bg)' },
  { value: 'design', label: 'Diseño', textColor: 'var(--tag-design-t)', bg: 'var(--tag-design-bg)' },
  { value: 'dev', label: 'Dev', textColor: 'var(--tag-dev-t)', bg: 'var(--tag-dev-bg)' },
]

export const priorityOf = (value) =>
  PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[1]

export const tagOf = (value) => TAGS.find((t) => t.value === value) ?? TAGS[0]

export const useTaskStore = create((set, get) => ({
  tasks: [],
  total: 0,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      // La API devuelve { items, total, skip, limit }.
      const page = await api.getTasks({ limit: 200 })
      set({ tasks: page.items, total: page.total, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  addTask: async (data) => {
    // Todos los campos viajan al servidor y se persisten.
    const task = await api.createTask({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      priority: data.priority,
      tag: data.tag,
      due_date: data.due_date || null,
    })
    set((state) => ({ tasks: [task, ...state.tasks], total: state.total + 1 }))
    return task
  },

  toggleTask: async (id) => {
    const previous = get().tasks
    const task = previous.find((t) => t.id === id)
    if (!task) return

    // Actualización optimista: la interfaz responde al instante y revierte
    // si el servidor rechaza el cambio.
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    }))

    try {
      const updated = await api.updateTask(id, { completed: !task.completed })
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }))
    } catch (error) {
      set({ tasks: previous, error: error.message })
      throw error
    }
  },

  editTask: async (id, data) => {
    const updated = await api.updateTask(id, {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      priority: data.priority,
      tag: data.tag,
      due_date: data.due_date || null,
    })
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }))
    return updated
  },

  removeTask: async (id) => {
    const previous = get().tasks
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      total: Math.max(0, state.total - 1),
    }))
    try {
      await api.deleteTask(id)
    } catch (error) {
      set({ tasks: previous, total: previous.length, error: error.message })
      throw error
    }
  },

  reset: () => set({ tasks: [], total: 0, loading: false, error: null }),
}))
