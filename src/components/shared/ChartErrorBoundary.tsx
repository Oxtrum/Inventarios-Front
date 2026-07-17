import { Component, type ErrorInfo, type ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"

interface ChartErrorBoundaryProps {
  children: ReactNode
  resetKey?: unknown
}

interface ChartErrorBoundaryState {
  hasError: boolean
}

export class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  state: ChartErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("No se pudo renderizar la gráfica", error, info)
  }

  componentDidUpdate(previousProps: ChartErrorBoundaryProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Card>
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          Grafica no disponible
        </CardContent>
      </Card>
    )
  }
}
