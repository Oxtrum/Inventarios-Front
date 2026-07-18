import { useAuth } from "@/context/auth-provider"
import { hasEveryPermission } from "@/lib/access-control"

interface CanProps {
  permission?: string
  allOf?: readonly string[]
  anyOf?: readonly string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ permission, allOf, anyOf, children, fallback = null }: CanProps) {
  const { permisos } = useAuth()
  const required = permission ? [permission] : (allOf ?? [])
  const hasAll = hasEveryPermission(permisos, required)
  const hasAny = !anyOf || anyOf.some((item) => permisos.includes(item))

  return hasAll && hasAny ? <>{children}</> : <>{fallback}</>
}
