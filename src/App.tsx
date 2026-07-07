import { ThemeProvider } from "@/context/theme-provider"
import DashboardPage from "@/pages/dashboard"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <DashboardPage />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App