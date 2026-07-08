import type { ComponentType } from "react"

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: string
}

export function EmptyState({ icon: IconComponent, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {IconComponent && (
        <IconComponent className="size-8 text-muted-foreground" />
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
