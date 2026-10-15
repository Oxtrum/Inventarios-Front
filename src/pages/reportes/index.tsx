import { useNavigate } from "react-router-dom"
import { IconAlertTriangle, IconChartBar, IconHistory, IconReportMoney } from "@tabler/icons-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Can } from "@/components/shared/Can"
import { useAuth } from "@/context/auth-provider"
import { canAccessPath } from "@/lib/access-control"

const REPORTES = [
  {
    path: "/reportes/stock-bajo",
    icon: IconAlertTriangle,
    title: "Stock Bajo",
    description: "Productos por debajo de su stock mínimo en el alcance seleccionado.",
  },
  {
    path: "/reportes/kardex",
    icon: IconHistory,
    title: "Kardex",
    description: "Historial de movimientos de un producto en una o varias sucursales.",
  },
  {
    path: "/reportes/valoracion",
    icon: IconReportMoney,
    title: "Valoración de Inventario",
    description: "Valor de costo del inventario en el alcance seleccionado.",
  },
]

export default function ReportesPage() {
  const navigate = useNavigate()
  const { permisos } = useAuth()

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader title="Reportes" description="Reportes de inventario por sucursal o alcance consolidado." />
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
        <Can permission="reportes_ejecutivos:leer">
          <Card
            className="cursor-pointer border-highlight/30 bg-highlight/5 transition-colors hover:bg-highlight/10"
            onClick={() => navigate("/reportes/ejecutivo")}
          >
            <CardHeader>
              <IconChartBar className="size-6 text-highlight" />
              <CardTitle>Resumen Ejecutivo</CardTitle>
              <CardDescription>Indicadores, comparaciones y alertas consolidadas entre sucursales.</CardDescription>
            </CardHeader>
          </Card>
        </Can>
        {REPORTES.filter((reporte) => canAccessPath(reporte.path, permisos)).map((reporte) => (
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
