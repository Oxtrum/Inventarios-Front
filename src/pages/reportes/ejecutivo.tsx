import { Link } from "react-router-dom"
import {
  IconAlertTriangle,
  IconArrowRight,
  IconArrowsExchange,
  IconBuildingStore,
  IconCoins,
  IconLock,
  IconPackage,
  type Icon,
} from "@tabler/icons-react"

import {
  useMovimientosResumen,
  useReservasResumen,
  useStockBajo,
  useSucursalesComparacion,
} from "@/hooks/useReportes"
import { useReportFilters } from "@/hooks/useReportFilters"
import { formatCurrency } from "@/lib/utils"
import { ReportFilters } from "@/components/reportes/ReportFilters"
import { MovimientosResumenChart } from "@/components/reportes/movimientos-resumen-chart"
import {
  SucursalesActividadChart,
  SucursalesValorChart,
} from "@/components/reportes/sucursales-comparacion-charts"
import { ChartErrorBoundary } from "@/components/shared/ChartErrorBoundary"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface KpiCardProps {
  title: string
  value: string | number
  description: string
  icon: Icon
  isLoading: boolean
  highlight?: boolean
}

function KpiCard({ title, value, description, icon: IconComponent, isLoading, highlight }: KpiCardProps) {
  return (
    <Card className={highlight ? "border-highlight/30 bg-highlight/5" : undefined}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardDescription>{title}</CardDescription>
          <IconComponent className={highlight ? "size-5 text-highlight" : "size-5 text-muted-foreground"} />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{description}</CardContent>
    </Card>
  )
}

function reportHref(path: string, queryString: string) {
  return queryString ? `${path}?${queryString}` : path
}

export default function ReporteEjecutivoPage() {
  const filters = useReportFilters({
    includePeriod: true,
    includeGranularity: true,
    defaultDays: 30,
  })
  const comparison = useSucursalesComparacion(filters.apiParams)
  const movements = useMovimientosResumen(filters.apiParams)
  const reservations = useReservasResumen(filters.apiParams)
  const stock = useStockBajo({
    ...(filters.apiParams.sucursalId ? { sucursalId: filters.apiParams.sucursalId } : {}),
    limit: "10",
    offset: "0",
  })

  const totals = comparison.data?.totales
  const netVariation = (totals?.entradasCantidad ?? 0) - (totals?.salidasCantidad ?? 0)
  const branchItems = Array.isArray(comparison.data?.sucursales)
    ? comparison.data.sucursales
    : []
  const criticalBranches = [...branchItems]
    .filter((item) => item.variantesStockBajo > 0)
    .sort((a, b) => b.variantesStockBajo - a.variantesStockBajo)
    .slice(0, 5)
  const inactiveBranches = branchItems.filter((item) => item.movimientos === 0)
  const criticalProducts = (Array.isArray(stock.data) ? stock.data : []).slice(0, 5)
  const expiringReservations = reservations.data?.snapshot.expiranProximos30Minutos ?? 0
  const chartsResetKey = `${filters.queryString}-${comparison.dataUpdatedAt}-${movements.dataUpdatedAt}`

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Resumen Ejecutivo"
        description={`Indicadores consolidados de ${filters.scopeLabel}.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/reportes">Ver reportes</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <ReportFilters filters={filters} showPeriod showGranularity />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard
            title="Valor inventario"
            value={comparison.isError ? "—" : formatCurrency(totals?.valorInventario ?? 0)}
            description="Valor disponible a costo"
            icon={IconCoins}
            isLoading={comparison.isLoading}
            highlight
          />
          <KpiCard
            title="Stock disponible"
            value={comparison.isError ? "—" : (totals?.stockDisponible ?? 0)}
            description="Unidades disponibles"
            icon={IconPackage}
            isLoading={comparison.isLoading}
          />
          <KpiCard
            title="Variación neta"
            value={comparison.isError ? "—" : (netVariation > 0 ? `+${netVariation}` : netVariation)}
            description="Entradas menos salidas"
            icon={IconArrowsExchange}
            isLoading={comparison.isLoading}
          />
          <KpiCard
            title="Movimientos"
            value={comparison.isError ? "—" : (totals?.movimientos ?? 0)}
            description="Operaciones del período"
            icon={IconBuildingStore}
            isLoading={comparison.isLoading}
          />
          <KpiCard
            title="Stock bajo"
            value={comparison.isError ? "—" : (totals?.variantesStockBajo ?? 0)}
            description="Variantes bajo mínimo"
            icon={IconAlertTriangle}
            isLoading={comparison.isLoading}
            highlight={(totals?.variantesStockBajo ?? 0) > 0}
          />
          <KpiCard
            title="Reservas activas"
            value={comparison.isError ? "—" : (totals?.reservasActivas ?? 0)}
            description={`${totals?.unidadesReservadas ?? 0} unidades reservadas`}
            icon={IconLock}
            isLoading={comparison.isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartErrorBoundary resetKey={chartsResetKey}>
            <SucursalesValorChart data={comparison.data?.sucursales} isLoading={comparison.isLoading} />
          </ChartErrorBoundary>
          <ChartErrorBoundary resetKey={chartsResetKey}>
            <SucursalesActividadChart data={comparison.data?.sucursales} isLoading={comparison.isLoading} />
          </ChartErrorBoundary>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <ChartErrorBoundary resetKey={chartsResetKey}>
            <MovimientosResumenChart data={movements.data} isLoading={movements.isLoading} />
          </ChartErrorBoundary>

          <Card>
            <CardHeader>
              <CardTitle>Alertas prioritarias</CardTitle>
              <CardDescription>Situaciones que requieren atención.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {expiringReservations > 0 && (
                <div className="flex items-center justify-between gap-3 rounded-md border border-highlight/25 bg-highlight/5 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <IconLock className="size-4 text-highlight" />
                    Reservas próximas a expirar
                  </div>
                  <Badge>{expiringReservations}</Badge>
                </div>
              )}

              {inactiveBranches.length > 0 && inactiveBranches.length < branchItems.length && (
                <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <IconArrowsExchange className="size-4 text-muted-foreground" />
                    Sucursales sin movimientos
                  </div>
                  <Badge variant="outline">{inactiveBranches.length}</Badge>
                </div>
              )}

              {criticalBranches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sucursales con stock bajo</p>
                  {criticalBranches.map((branch) => (
                    <div key={branch.sucursalId} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted-foreground">{branch.sucursalNombre}</span>
                      <Badge variant="destructive">{branch.variantesStockBajo}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {criticalProducts.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium">Productos más críticos</p>
                  {criticalProducts.map((item) => (
                    <div key={`${item.sucursalId}-${item.productoVarianteId}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted-foreground">{item.nombre}</span>
                      <Badge variant="outline">{item.stockDisponible} disp.</Badge>
                    </div>
                  ))}
                </div>
              )}

              {!comparison.isLoading
                && !stock.isLoading
                && !reservations.isLoading
                && !comparison.isError
                && !stock.isError
                && !reservations.isError
                && criticalBranches.length === 0
                && criticalProducts.length === 0
                && inactiveBranches.length === 0
                && expiringReservations === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sin alertas para el alcance seleccionado.
                  </p>
                )}

              {(comparison.isError || stock.isError || reservations.isError) && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Datos no disponibles para algunas alertas.
                </p>
              )}

              <div className="grid gap-2 border-t pt-4">
                <Button variant="outline" className="justify-between" asChild>
                  <Link to={reportHref("/reportes/stock-bajo", filters.queryString)}>
                    Revisar stock bajo <IconArrowRight />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-between" asChild>
                  <Link to={reportHref("/reportes/valoracion", filters.queryString)}>
                    Revisar valoración <IconArrowRight />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-between" asChild>
                  <Link to={reportHref("/reportes/kardex", filters.queryString)}>
                    Consultar kardex <IconArrowRight />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
