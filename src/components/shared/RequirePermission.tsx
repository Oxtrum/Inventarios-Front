import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/auth-provider"
import { toast } from "sonner"
import { useEffect } from "react"

interface RequirePermissionProps {
  permiso: string
  children: React.ReactNode
}

export function RequirePermission({ permiso, children }: RequirePermissionProps) {
  const { hasPermission } = useAuth()

  useEffect(() => {
    if (!hasPermission(permiso)) {
      toast.error("No tienes permiso para acceder a esta página")
    }
  }, [hasPermission, permiso])

  if (!hasPermission(permiso)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
