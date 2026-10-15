import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/auth-provider"
import { getDefaultAuthorizedPath } from "@/lib/access-control"
import { toast } from "sonner"
import { useEffect } from "react"

interface RequirePermissionProps {
  permiso: string
  children: React.ReactNode
}

export function RequirePermission({ permiso, children }: RequirePermissionProps) {
  const { hasPermission, permisos } = useAuth()
  const fallbackPath = getDefaultAuthorizedPath(permisos)

  useEffect(() => {
    if (!hasPermission(permiso)) {
      toast.error("No tienes permiso para acceder a esta página")
    }
  }, [hasPermission, permiso])

  if (!hasPermission(permiso)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
