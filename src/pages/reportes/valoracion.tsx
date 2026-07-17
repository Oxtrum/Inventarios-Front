import { useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"

import {
  useValoracion,
  useValoracionDistribucion,
} from "@/hooks/useReportes"
import { useSucursal } from "@/context/sucursal-provider"
import type { ValoracionAgrupacion } from "@/types/reporte"
import { formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/shared/PageHeader"
import { ChartErrorBoundary } from "@/components/shared/ChartErrorBoundary"
import { ValoracionDistribucionChart } from "@/components/reportes/valoracion-distribucion-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ValoracionPage() {
  const { sucursalId, sucursalActiva } = useSucursal()
  const [agruparPor, setAgruparPor] =
    useState<ValoracionAgrupacion>("categoria")
  const scopeFilters = sucursalId ? { sucursalId } : undefined
  const { data: valoracion, isLoading } = useValoracion(scopeFilters)
  const {
    data: distribucion,
    isLoading: isLoadingDistribucion,
  } = useValoracionDistribucion({
    agruparPor,
    ...(sucursalId ? { sucursalId } : {}),
  })

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Valoración de Inventario"
        description={`Valor de costo del inventario disponible en ${sucursalActiva ? sucursalActiva.nombre : "todas las sucursales"}.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/reportes">
              <IconArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {!isLoading && valoracion && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {valoracion.totalProductos}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stock Disponible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {valoracion.stockDisponible}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor de Costo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatCurrency(valoracion.valorCosto)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <ChartErrorBoundary resetKey={`${sucursalId}-${agruparPor}`}>
          <ValoracionDistribucionChart
            data={distribucion}
            isLoading={isLoadingDistribucion}
            agruparPor={agruparPor}
            onAgruparPorChange={setAgruparPor}
          />
        </ChartErrorBoundary>
      </div>
    </div>
  )
}
