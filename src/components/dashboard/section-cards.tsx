import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconCoins,
  IconPackage,
} from "@tabler/icons-react"

import { useResumenDashboard } from "@/hooks/useReportes"
import { useSucursal } from "@/context/sucursal-provider"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

export function SectionCards() {
  const { sucursalId } = useSucursal()
  const { data: resumen, isLoading } = useResumenDashboard(
    sucursalId ? { sucursalId } : undefined
  )

  const cards = [
    {
      title: "Productos Activos",
      value: resumen?.productosActivos,
      icon: IconPackage,
      description: "Productos habilitados en el catálogo",
    },
    {
      title: "Stock Bajo",
      value: resumen?.variantesStockBajo,
      icon: IconAlertTriangle,
      description: "Variantes por debajo del stock mínimo",
    },
    {
      title: "Valor del Inventario",
      value: formatCurrency(resumen?.valorInventario ?? 0),
      icon: IconCoins,
      description: "Valor a costo del stock disponible",
    },
    {
      title: "Movimientos Hoy",
      value: resumen?.movimientosHoy,
      icon: IconArrowsExchange,
      description: "Entradas y salidas registradas hoy",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-highlight/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value ?? 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <card.icon className="size-4 text-highlight" />
              {card.description}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
