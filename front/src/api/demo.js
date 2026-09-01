/**
 * Cuenta de demostración.
 *
 * Crea un usuario nuevo con datos de ejemplo en lugar de compartir una cuenta
 * fija: así dos visitantes simultáneos no se pisan los datos, y no hace falta
 * mantener un seed en producción.
 */

import { createTask, login, register, tokenStorage, updateTask } from './client'

const SAMPLE_TASKS = [
  {
    title: 'Preparar la demo del viernes',
    description: 'Repasar el guion y comprobar que el entorno de staging responde.',
    priority: 'high',
    tag: 'work',
    days: 1,
  },
  {
    title: 'Revisar los tests de integración',
    description: 'Faltan casos para el filtro por etiqueta.',
    priority: 'high',
    tag: 'dev',
    days: 2,
  },
  {
    title: 'Rediseñar la pantalla de ajustes',
    priority: 'med',
    tag: 'design',
    days: 5,
  },
  {
    title: 'Renovar el pasaporte',
    description: 'Pedir cita previa por internet.',
    priority: 'med',
    tag: 'personal',
    days: 12,
  },
  {
    title: 'Actualizar las dependencias del backend',
    priority: 'low',
    tag: 'dev',
    days: null,
  },
  {
    title: 'Escribir el resumen de la semana',
    priority: 'low',
    tag: 'work',
    days: -2,
    completed: true,
  },
]

function inDays(days) {
  if (days === null) return null
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Crea la cuenta, la llena de datos y solo entonces activa la sesión en la
 * interfaz. El orden importa: en cuanto el contexto tiene usuario, el
 * enrutador salta al dashboard, y si aún faltaran tareas por crear el usuario
 * vería la lista a medias.
 *
 * @param {() => Promise<unknown>} adoptSession - activa la sesión ya autenticada.
 */
export async function startDemoSession(adoptSession) {
  const suffix = Math.random().toString(36).slice(2, 8)
  const credentials = {
    username: `demo_${suffix}`,
    password: `demo-${suffix}-${Date.now()}`,
  }

  await register({ ...credentials, email: `demo_${suffix}@example.com` })

  const { access_token } = await login(credentials)
  tokenStorage.set(access_token)

  // Secuencial y no en paralelo: el orden de creación define el orden de la
  // lista, y así la demo se ve siempre igual.
  for (const { days, completed, ...task } of [...SAMPLE_TASKS].reverse()) {
    const created = await createTask({ ...task, due_date: inDays(days) })
    // El alta siempre crea la tarea pendiente; marcarla requiere un PATCH.
    if (completed) await updateTask(created.id, { completed: true })
  }

  await adoptSession()
  return credentials
}
