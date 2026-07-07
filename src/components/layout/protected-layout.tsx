import { Outlet, useLocation } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { LayoutProvider } from "@/context/layout-provider"

const hiddenHeaderRoutes = ["/login"]

function ProtectedLayout() {
  const location = useLocation()
  const hideHeader = hiddenHeaderRoutes.includes(location.pathname)

  if (hideHeader) {
    return <Outlet />
  }

  return (
    <LayoutProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}

export default ProtectedLayout
