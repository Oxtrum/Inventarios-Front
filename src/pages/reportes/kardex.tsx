import { useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useKardex } from "@/hooks/useReportes"
import { useSucursales } from "@/hooks/useSucursales"
import { useProductos } from "@/hooks/useProductos"
import type { KardexItem } from "@/types/reporte"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Row = KardexItem & { id: string }

export default function KardexPage() {
  const [sucursalId, setSucursalId] = useState("")
  const [productoId, setProductoId] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: productos } = useProductos({ activo: "true" })

  const filters: Record<string, string> = {}
  if (sucursalId) filters.sucursalId = sucursalId
  if (productoId) filters.productoId = productoId
  if (fechaDesde) filters.fechaDesde = fechaDesde
  if (fechaHasta) filters.fechaHasta = fechaHasta

  const canQuery = !!sucursalId && !!productoId
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
        description="Historial de movimientos de un producto en una sucursal."
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
          <div className="flex flex-col gap-2">
            <Label>Sucursal</Label>
            <Select value={sucursalId} onValueChange={setSucursalId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {(sucursales ?? []).map((sucursal) => (
                  <SelectItem key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Producto</Label>
            <Select value={productoId} onValueChange={setProductoId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {(productos ?? []).map((producto) => (
                  <SelectItem key={producto.id} value={producto.id}>
                    {producto.codigo ? `${producto.codigo} · ${producto.nombre}` : producto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <EmptyState title="Selecciona sucursal y producto" description="Elige una sucursal y un producto para ver su kardex." />
        )}
      </div>
    </div>
  )
}
