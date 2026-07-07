import { ConfigDrawer } from "@/components/config-drawer"
import { ThemeSwitch } from "@/components/theme-switch"
import { Header } from "@/components/layout/header"

export function SiteHeader() {
  return (
    <Header fixed className="border-b">
      <h1 className="text-base font-medium">Documentos</h1>
      <div className="ms-auto flex items-center gap-2">
        <ThemeSwitch />
        <ConfigDrawer />
      </div>
    </Header>
  )
}
