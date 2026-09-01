import { Component } from 'react'

/**
 * Evita la pantalla en blanco cuando un componente lanza durante el render.
 * Sin esto, cualquier excepción no controlada deja la aplicación vacía y sin
 * explicación para el usuario.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // En producción este es el punto donde conectar un servicio de errores.
    console.error('Error no controlado en la interfaz:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="app-centered">
        <p className="app-code">Error</p>
        <h1>Algo ha fallado</h1>
        <p className="app-muted">
          La aplicación encontró un problema inesperado. Recargar la página
          suele solucionarlo.
        </p>
        <button className="app-link" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </main>
    )
  }
}
