import { useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useKardex } from "@/hooks/useReportes"
import { useServerPagination } from "@/hooks/useServerPagination"
import { useReportFilters } from "@/hooks/useReportFilters"
import { useProductos } from "@/hooks/useProductos"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import type { KardexItem } from "@/types/reporte"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { ChartErrorBoundary } from "@/components/shared/ChartErrorBoundary"
import { KardexChart } from "@/components/reportes/kardex-chart"
import { ReportFilters } from "@/components/reportes/ReportFilters"
import { Button } from "@/components/ui/button"
import type { QueryParams } from "@/lib/api"

type Row = KardexItem & { id: string }

export default function KardexPage() {
  const [productoId, setProductoId] = useState("")
  const [productoVarianteId, setProductoVarianteId] = useState("")

  const reportFilters = useReportFilters({ includePeriod: true, defaultDays: 30 })
  const { data: productos } = useProductos({ activo: "true" })

  const filters: QueryParams = { ...reportFilters.apiParams }
  if (productoId) filters.productoId = productoId
  if (productoVarianteId) filters.productoVarianteId = productoVarianteId

  const canQuery = !!productoId
  const pagination = useServerPagination(20, JSON.stringify(filters))
  const { data: items, isLoading } = useKardex({ ...filters, ...pagination.params })
  const safeItems = Array.isArray(items) ? items : []

  const rows: Row[] = canQuery ? safeItems.map((item) => ({ ...item, id: item.movimientoId })) : []

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "fechaCreacion",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.fechaCreacion).toLocaleString("es-ES"),
    },
    { accessorKey: "tipo", header: "Tipo" },
    { accessorKey: "cantidad", header: "Cantidad" },
    { accessorKey: "efecto", header: "Efecto" },
    { accessorKey: "saldo", header: "Saldo" },
    { accessorKey: "motivo", header: "Motivo", cell: ({ row }) => row.original.motivo ?? "—" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Reporte de Kardex"
        description={`Historial de movimientos de un producto en ${reportFilters.scopeLabel}.`}
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
        <ReportFilters filters={reportFilters} showPeriod />
        <div className="flex flex-wrap gap-3">
          <ProductoVariantePicker
            productos={productos ?? []}
            productoId={productoId}
            productoVarianteId={productoVarianteId}
            onProductoChange={setProductoId}
            onVarianteChange={setProductoVarianteId}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          />
        </div>

        {canQuery ? (
          <>
            <ChartErrorBoundary resetKey={items}>
              <KardexChart items={safeItems} isLoading={isLoading} />
            </ChartErrorBoundary>
            <CrudTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="Sin movimientos registrados." pageSize={20} pagination={items?.pagination} onPaginationChange={pagination.setOffset} />
          </>
        ) : (
          <EmptyState title="Selecciona un producto" description="Elige un producto para consultar su kardex en el alcance y periodo seleccionados." />
        )}
      </div>
    </div>
  )
}
