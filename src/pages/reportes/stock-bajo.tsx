import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useStockBajo } from "@/hooks/useReportes"
import { useSucursal } from "@/context/sucursal-provider"
import type { StockBajoItem } from "@/types/reporte"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { ProductoVarianteLabel } from "@/components/shared/ProductoVarianteLabel"
import { ChartErrorBoundary } from "@/components/shared/ChartErrorBoundary"
import { StockBajoChart } from "@/components/reportes/stock-bajo-chart"
import { Button } from "@/components/ui/button"

type Row = StockBajoItem & { id: string }

export default function StockBajoPage() {
  const { sucursalId, sucursalActiva } = useSucursal()
  const { data: items, isLoading } = useStockBajo(sucursalId ? { sucursalId } : undefined)
  const safeItems = Array.isArray(items) ? items : []

  const rows: Row[] = safeItems.map((item) => ({ ...item, id: item.productoVarianteId || item.productoId }))

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
        description={`Productos por debajo de su stock mínimo en ${sucursalActiva ? sucursalActiva.nombre : "todas las sucursales"}.`}
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
        <ChartErrorBoundary resetKey={items}>
          <StockBajoChart items={safeItems} isLoading={isLoading} />
        </ChartErrorBoundary>
        <CrudTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="Sin productos con stock bajo." pageSize={20} />
      </div>
    </div>
  )
}
