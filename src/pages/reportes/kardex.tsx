import { useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useKardex } from "@/hooks/useReportes"
import { useSucursal } from "@/context/sucursal-provider"
import { useProductos } from "@/hooks/useProductos"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import type { KardexItem } from "@/types/reporte"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Row = KardexItem & { id: string }

export default function KardexPage() {
  const [productoId, setProductoId] = useState("")
  const [productoVarianteId, setProductoVarianteId] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  const { sucursalId, sucursalActiva } = useSucursal()
  const { data: productos } = useProductos({ activo: "true" })

  const filters: Record<string, string> = {}
  if (sucursalId) filters.sucursalId = sucursalId
  if (productoId) filters.productoId = productoId
  if (productoVarianteId) filters.productoVarianteId = productoVarianteId
  if (fechaDesde) filters.fechaDesde = fechaDesde
  if (fechaHasta) filters.fechaHasta = fechaHasta

  const canQuery = !!productoId
  const { data: items, isLoading } = useKardex(filters)

  const rows: Row[] = canQuery ? (items ?? []).map((item) => ({ ...item, id: item.movimientoId })) : []

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
        description={`Historial de movimientos de un producto en ${sucursalActiva ? sucursalActiva.nombre : "todas las sucursales"}.`}
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
        <div className="flex flex-wrap gap-3">
          <ProductoVariantePicker
            productos={productos ?? []}
            productoId={productoId}
            productoVarianteId={productoVarianteId}
            onProductoChange={setProductoId}
            onVarianteChange={setProductoVarianteId}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          />
          <div className="flex flex-col gap-2">
            <Label>Desde</Label>
            <Input type="date" className="w-40" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Hasta</Label>
            <Input type="date" className="w-40" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </div>
        </div>

        {canQuery ? (
          <CrudTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="Sin movimientos registrados." pageSize={20} />
        ) : (
          <EmptyState title="Selecciona un producto" description="Elige un producto para ver su kardex. La sucursal se controla desde el selector del encabezado." />
        )}
      </div>
    </div>
  )
}
