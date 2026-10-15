import { useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"

import {
  useValoracion,
  useValoracionDistribucion,
} from "@/hooks/useReportes"
import { useReportFilters } from "@/hooks/useReportFilters"
import type { ValoracionAgrupacion } from "@/types/reporte"
import { formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/shared/PageHeader"
import { ChartErrorBoundary } from "@/components/shared/ChartErrorBoundary"
import { ErrorState } from "@/components/shared/ErrorState"
import { ValoracionDistribucionChart } from "@/components/reportes/valoracion-distribucion-chart"
import { ReportFilters } from "@/components/reportes/ReportFilters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ValoracionPage() {
  const reportFilters = useReportFilters()
  const [agruparPor, setAgruparPor] =
    useState<ValoracionAgrupacion>("categoria")
  const { data: valoracion, isLoading, isError, error, refetch } = useValoracion(reportFilters.apiParams)
  const {
    data: distribucion,
    isLoading: isLoadingDistribucion,
    isError: isErrorDistribucion,
    error: errorDistribucion,
    refetch: refetchDistribucion,
  } = useValoracionDistribucion({
    agruparPor,
    ...reportFilters.apiParams,
  })

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Valoración de Inventario"
        description={`Valor de costo del inventario disponible en ${reportFilters.scopeLabel}.`}
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
        <ReportFilters filters={reportFilters} />
        {isError && <ErrorState error={error} onRetry={() => { void refetch() }} />}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {!isLoading && !isError && valoracion && (
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

        {isErrorDistribucion ? (
          <ErrorState error={errorDistribucion} title="No pudimos cargar la distribución" onRetry={() => { void refetchDistribucion() }} />
        ) : (
          <ChartErrorBoundary resetKey={`${reportFilters.sucursalIds.join(",")}-${agruparPor}`}>
            <ValoracionDistribucionChart
              data={distribucion}
              isLoading={isLoadingDistribucion}
              agruparPor={agruparPor}
              onAgruparPorChange={setAgruparPor}
            />
          </ChartErrorBoundary>
        )}
      </div>
    </div>
  )
}
