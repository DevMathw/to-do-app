import { describe, expect, it } from 'vitest'
import { formatDueDate, isDueToday, isOverdue, matchesView } from './taskFilters'

const HOY = '2026-09-01'

const tarea = (extra = {}) => ({
  id: 1,
  title: 'Tarea',
  description: null,
  completed: false,
  priority: 'med',
  tag: 'work',
  due_date: null,
  ...extra,
})

describe('isOverdue', () => {
  it('marca como vencida una tarea pendiente con fecha pasada', () => {
    expect(isOverdue(tarea({ due_date: '2026-08-30' }), HOY)).toBe(true)
  })

  it('no marca como vencida una tarea ya completada', () => {
    expect(isOverdue(tarea({ due_date: '2026-08-30', completed: true }), HOY)).toBe(false)
  })

  it('no marca como vencida una tarea que vence hoy', () => {
    expect(isOverdue(tarea({ due_date: HOY }), HOY)).toBe(false)
  })

  it('no marca como vencida una tarea sin fecha', () => {
    expect(isOverdue(tarea(), HOY)).toBe(false)
  })
})

describe('isDueToday', () => {
  it('incluye lo que vence hoy y lo ya vencido', () => {
    expect(isDueToday(tarea({ due_date: HOY }), HOY)).toBe(true)
    expect(isDueToday(tarea({ due_date: '2026-08-20' }), HOY)).toBe(true)
  })

  it('excluye lo que vence más adelante', () => {
    expect(isDueToday(tarea({ due_date: '2026-09-20' }), HOY)).toBe(false)
  })
})

describe('matchesView', () => {
  it('"all" acepta cualquier tarea', () => {
    expect(matchesView(tarea({ completed: true }), 'all', HOY)).toBe(true)
  })

  it('"pending" y "done" se reparten las tareas sin solaparse', () => {
    const pendiente = tarea()
    const hecha = tarea({ completed: true })

    expect(matchesView(pendiente, 'pending', HOY)).toBe(true)
    expect(matchesView(pendiente, 'done', HOY)).toBe(false)
    expect(matchesView(hecha, 'done', HOY)).toBe(true)
    expect(matchesView(hecha, 'pending', HOY)).toBe(false)
  })

  it('"today" ya no es un duplicado de "pending"', () => {
    // Regresión: antes ambas vistas aplicaban el mismo filtro.
    const sinFecha = tarea()

    expect(matchesView(sinFecha, 'pending', HOY)).toBe(true)
    expect(matchesView(sinFecha, 'today', HOY)).toBe(false)
  })

  it('las vistas de etiqueta filtran por el campo tag real', () => {
    expect(matchesView(tarea({ tag: 'dev' }), 'dev', HOY)).toBe(true)
    expect(matchesView(tarea({ tag: 'work' }), 'dev', HOY)).toBe(false)
  })
})

describe('formatDueDate', () => {
  it('no desplaza el día por la zona horaria', () => {
    // Interpretar "2026-09-01" como UTC mostraba el 31 de agosto en América.
    expect(formatDueDate('2026-09-01')).toContain('1')
  })

  it('devuelve cadena vacía si no hay fecha', () => {
    expect(formatDueDate(null)).toBe('')
  })
})
