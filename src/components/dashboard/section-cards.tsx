import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconCoins,
  IconPackage,
} from "@tabler/icons-react"
import { useQueries } from "@tanstack/react-query"

import { useProductos } from "@/hooks/useProductos"
import { useSucursales } from "@/hooks/useSucursales"
import { reportesKeys } from "@/hooks/useReportes"
import { reportesService } from "@/services/reportes"
import { useMovimientos } from "@/hooks/useInventario"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, toLocalDateInput } from "@/lib/utils"

export function SectionCards() {
  const { data: productos, isLoading: isLoadingProductos } = useProductos({
    activo: "true",
  })
  const { data: sucursales, isLoading: isLoadingSucursales } = useSucursales({
    activo: "true",
  })
  const sucursalIds = (sucursales ?? []).map((sucursal) => sucursal.id)

  const { data: stockBajo, isLoading: isLoadingStockBajo } = useQueries({
    queries: sucursalIds.map((sucursalId) => ({
      queryKey: reportesKeys.stockBajo({ sucursalId }),
      queryFn: () => reportesService.stockBajo({ sucursalId }),
    })),
    combine: (results) => ({
      data: results.flatMap((result) => result.data ?? []),
      isLoading: results.some((result) => result.isLoading),
    }),
  })

  const { data: valoracion, isLoading: isLoadingValoracion } = useQueries({
    queries: sucursalIds.map((sucursalId) => ({
      queryKey: reportesKeys.valoracion({ sucursalId }),
      queryFn: () => reportesService.valoracion({ sucursalId }),
    })),
    combine: (results) => ({
      data: results.flatMap((result) => result.data ?? []),
      isLoading: results.some((result) => result.isLoading),
    }),
  })

  const { data: movimientosHoy, isLoading: isLoadingMovimientos } =
    useMovimientos({ fechaDesde: toLocalDateInput(new Date()) })

  const valorInventario = valoracion.reduce(
    (total, item) => total + item.valorCosto,
    0
  )

  const cards = [
    {
      title: "Productos Activos",
      value: productos?.length,
      isLoading: isLoadingProductos,
      icon: IconPackage,
      description: "Productos habilitados en el catálogo",
    },
    {
      title: "Stock Bajo",
      value: stockBajo.length,
      isLoading: isLoadingSucursales || isLoadingStockBajo,
      icon: IconAlertTriangle,
      description: "Productos por debajo del stock mínimo",
    },
    {
      title: "Valor del Inventario",
      value: formatCurrency(valorInventario),
      isLoading: isLoadingSucursales || isLoadingValoracion,
      icon: IconCoins,
      description: "Valor a costo del stock disponible",
    },
    {
      title: "Movimientos Hoy",
      value: movimientosHoy?.length,
      isLoading: isLoadingMovimientos,
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
            {card.isLoading ? (
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
