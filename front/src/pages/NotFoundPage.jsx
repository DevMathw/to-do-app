import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="app-centered">
      <p className="app-code">404</p>
      <h1>Esta página no existe</h1>
      <p className="app-muted">
        Puede que el enlace esté mal escrito o que la página se haya movido.
      </p>
      <Link className="app-link" to="/">
        Volver a mis tareas
      </Link>
    </main>
  )
}
