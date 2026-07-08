import { useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useStockBajo } from "@/hooks/useReportes"
import { useSucursales } from "@/hooks/useSucursales"
import type { StockBajoItem } from "@/types/reporte"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Row = StockBajoItem & { id: string }

export default function StockBajoPage() {
  const [sucursalId, setSucursalId] = useState("")
  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: items, isLoading } = useStockBajo(sucursalId ? { sucursalId } : undefined)

  const rows: Row[] = sucursalId ? (items ?? []).map((item) => ({ ...item, id: item.productoId })) : []

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "codigo", header: "Código", cell: ({ row }) => row.original.codigo ?? "—" },
    { accessorKey: "nombre", header: "Producto" },
    { accessorKey: "stockActual", header: "Stock Actual" },
    { accessorKey: "stockDisponible", header: "Disponible" },
    { accessorKey: "stockMinimo", header: "Stock Mínimo" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Reporte de Stock Bajo"
        description="Productos por debajo de su stock mínimo."
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
        <div className="flex flex-col gap-2 sm:max-w-xs">
          <Label>Sucursal</Label>
          <Select value={sucursalId} onValueChange={setSucursalId}>
            <SelectTrigger className="w-full">
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

        {sucursalId ? (
          <CrudTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="Sin productos con stock bajo." pageSize={20} />
        ) : (
          <EmptyState title="Selecciona una sucursal" description="Elige una sucursal para ver el reporte de stock bajo." />
        )}
      </div>
    </div>
  )
}
