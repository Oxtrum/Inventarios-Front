import { Navigate, Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { LayoutProvider } from "@/context/layout-provider"
import { SucursalProvider } from "@/context/sucursal-provider"
import { useAuth } from "@/context/auth-provider"
import { RoutePermissionBoundary } from "@/components/shared/RoutePermissionBoundary"
import { ErrorState } from "@/components/shared/ErrorState"

function ProtectedLayout() {
  const { isAuthenticated, isLoading, authError, retryAuth } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <ErrorState error={authError} title="No pudimos comprobar la sesión" onRetry={retryAuth} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <SucursalProvider>
      <LayoutProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <RoutePermissionBoundary>
              <Outlet />
            </RoutePermissionBoundary>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SucursalProvider>
  )
}

export default ProtectedLayout
