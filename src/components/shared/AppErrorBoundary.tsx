import { Component, type ErrorInfo, type ReactNode } from "react"

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado en la interfaz", error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
        <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">No pudimos cargar esta vista</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recarga la aplicación para continuar.
          </p>
          <button
            type="button"
            className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Recargar aplicación
          </button>
        </div>
      </main>
    )
  }
}
