/**
 * Lógica de filtrado y fechas, aparte de los componentes para poder probarla
 * sin renderizar nada.
 */

/** Fecha de hoy en formato YYYY-MM-DD y en hora local (no UTC). */
export function todayISO(now = new Date()) {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/** Una tarea está vencida si tiene fecha pasada y sigue pendiente. */
export function isOverdue(task, today = todayISO()) {
  return Boolean(task.due_date) && !task.completed && task.due_date < today
}

/** Vence hoy o antes, y sigue pendiente: lo que hay que hacer "hoy". */
export function isDueToday(task, today = todayISO()) {
  return Boolean(task.due_date) && !task.completed && task.due_date <= today
}

/**
 * Resuelve la vista seleccionada en la barra lateral.
 * Las vistas de etiqueta ('work', 'dev'…) filtran por el campo real `tag`.
 */
export function matchesView(task, view, today = todayISO()) {
  switch (view) {
    case 'all':
      return true
    case 'today':
      return isDueToday(task, today)
    case 'pending':
      return !task.completed
    case 'done':
      return task.completed
    default:
      return task.tag === view
  }
}

/** Formatea una fecha ISO (YYYY-MM-DD) sin desfase de zona horaria. */
export function formatDueDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}
