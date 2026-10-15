import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useStockBajo } from "@/hooks/useReportes"
import { useServerPagination } from "@/hooks/useServerPagination"
import { useReportFilters } from "@/hooks/useReportFilters"
import type { StockBajoItem } from "@/types/reporte"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { ProductoVarianteLabel } from "@/components/shared/ProductoVarianteLabel"
import { ChartErrorBoundary } from "@/components/shared/ChartErrorBoundary"
import { StockBajoChart } from "@/components/reportes/stock-bajo-chart"
import { ReportFilters } from "@/components/reportes/ReportFilters"
import { Button } from "@/components/ui/button"

type Row = StockBajoItem & { id: string }

export default function StockBajoPage() {
  const reportFilters = useReportFilters()
  const pagination = useServerPagination(20, reportFilters.sucursalIds.join(","))
  const { data: items, isLoading, isError, error, refetch } = useStockBajo({
    ...reportFilters.apiParams,
    ...pagination.params,
  })
  const safeItems = Array.isArray(items) ? items : []

  const rows: Row[] = safeItems.map((item) => ({
    ...item,
    id: `${item.sucursalId}:${item.productoVarianteId || item.productoId}`,
  }))

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "codigo", header: "Código", cell: ({ row }) => row.original.codigo ?? "—" },
    {
      accessorKey: "nombre",
      header: "Producto",
      cell: ({ row }) => (
        <ProductoVarianteLabel
          productoNombre={row.original.nombre}
          productoVarianteId={row.original.productoVarianteId}
        />
      ),
    },
    { accessorKey: "stockActual", header: "Stock Actual" },
    { accessorKey: "stockDisponible", header: "Disponible" },
    { accessorKey: "stockMinimo", header: "Stock Mínimo" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Reporte de Stock Bajo"
        description={`Productos por debajo de su stock mínimo en ${reportFilters.scopeLabel}.`}
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
        {!isError && (
          <ChartErrorBoundary resetKey={items}>
            <StockBajoChart items={safeItems} isLoading={isLoading} />
          </ChartErrorBoundary>
        )}
        <CrudTable columns={columns} data={rows} isLoading={isLoading} isError={isError} error={error} onRetry={() => { void refetch() }} emptyMessage="Sin productos con stock bajo." pageSize={20} pagination={items?.pagination} onPaginationChange={pagination.setOffset} />
      </div>
    </div>
  )
}
