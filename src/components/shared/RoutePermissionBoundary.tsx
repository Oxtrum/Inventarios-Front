import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/context/auth-provider"
import { canAccessPath, getDefaultAuthorizedPath } from "@/lib/access-control"

export function RoutePermissionBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { permisos } = useAuth()
  const authorized = canAccessPath(location.pathname, permisos)
  const fallbackPath = getDefaultAuthorizedPath(permisos)

  useEffect(() => {
    if (!authorized) {
      toast.error("No tienes permiso para acceder a esta página")
    }
  }, [authorized, location.pathname])

  if (!authorized) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
