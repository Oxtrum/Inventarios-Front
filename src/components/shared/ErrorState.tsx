import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"

import { describeError } from "@/lib/apiErrors"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  error?: unknown
  title?: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function ErrorState({
  error,
  title = "No pudimos cargar los datos",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center"
    >
      <IconAlertTriangle className="size-8 text-destructive" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {describeError(error)}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <IconRefresh />
          {isRetrying ? "Reintentando..." : "Reintentar"}
        </Button>
      )}
    </div>
  )
}
