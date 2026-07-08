import { useNavigate } from "react-router-dom"
import { IconAlertTriangle, IconHistory, IconReportMoney } from "@tabler/icons-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const REPORTES = [
  {
    path: "/reportes/stock-bajo",
    icon: IconAlertTriangle,
    title: "Stock Bajo",
    description: "Productos por debajo de su stock mínimo en una sucursal.",
  },
  {
    path: "/reportes/kardex",
    icon: IconHistory,
    title: "Kardex",
    description: "Historial de movimientos de un producto en una sucursal.",
  },
  {
    path: "/reportes/valoracion",
    icon: IconReportMoney,
    title: "Valoración de Inventario",
    description: "Valor de costo del inventario disponible en una sucursal.",
  },
]

export default function ReportesPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader title="Reportes" description="Reportes de inventario por sucursal." />
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
        {REPORTES.map((reporte) => (
          <Card
            key={reporte.path}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => navigate(reporte.path)}
          >
            <CardHeader>
              <reporte.icon className="size-6 text-muted-foreground" />
              <CardTitle>{reporte.title}</CardTitle>
              <CardDescription>{reporte.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
