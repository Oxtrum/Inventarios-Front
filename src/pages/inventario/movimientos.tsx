import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { useMovimientos } from "@/hooks/useInventario"
import { useProductos } from "@/hooks/useProductos"
import { useSucursales } from "@/hooks/useSucursales"
import type { Movimiento } from "@/types/inventario"
import type { MovementType } from "@/types/common"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TODOS = "__todos__"

const TIPOS: MovementType[] = [
  "STOCK_INICIAL",
  "COMPRA",
  "VENTA",
  "AJUSTE_ENTRADA",
  "AJUSTE_SALIDA",
  "TRANSFERENCIA_SALE",
  "TRANSFERENCIA_ENTRA",
  "DEVOLUCION_ENTRA",
  "DEVOLUCION_SALE",
  "PERDIDA",
]

export default function MovimientosPage() {
  const [productoId, setProductoId] = useState(TODOS)
  const [sucursalId, setSucursalId] = useState(TODOS)
  const [tipo, setTipo] = useState(TODOS)
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  const { data: productos } = useProductos({ activo: "true" })
  const { data: sucursales } = useSucursales({ activo: "true" })

  const filters: Record<string, string> = {}
  if (productoId !== TODOS) filters.productoId = productoId
  if (sucursalId !== TODOS) filters.sucursalId = sucursalId
  if (tipo !== TODOS) filters.tipo = tipo
  if (fechaDesde) filters.fechaDesde = fechaDesde
  if (fechaHasta) filters.fechaHasta = fechaHasta

  const { data: movimientos, isLoading } = useMovimientos(filters)

  const nombrePorId = useMemo(() => {
    const productoMap = new Map((productos ?? []).map((p) => [p.id, p.nombre]))
    const sucursalMap = new Map((sucursales ?? []).map((s) => [s.id, s.nombre]))
    return { productoMap, sucursalMap }
  }, [productos, sucursales])

  const columns: ColumnDef<Movimiento>[] = [
    {
      accessorKey: "fechaCreacion",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.fechaCreacion).toLocaleString("es-ES"),
    },
    {
      accessorKey: "productoId",
      header: "Producto",
      cell: ({ row }) => nombrePorId.productoMap.get(row.original.productoId) ?? row.original.productoId,
    },
    {
      accessorKey: "sucursalId",
      header: "Sucursal",
      cell: ({ row }) => nombrePorId.sucursalMap.get(row.original.sucursalId) ?? row.original.sucursalId,
    },
    { accessorKey: "tipo", header: "Tipo" },
    { accessorKey: "cantidad", header: "Cantidad" },
    { accessorKey: "motivo", header: "Motivo", cell: ({ row }) => row.original.motivo ?? "—" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Movimientos"
        description="Histórico de movimientos de inventario."
        action={
          <Button variant="outline" asChild>
            <Link to="/inventario">
              <IconArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap gap-3">
          <Select value={productoId} onValueChange={setProductoId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los productos</SelectItem>
              {(productos ?? []).map((producto) => (
                <SelectItem key={producto.id} value={producto.id}>
                  {producto.codigo ? `${producto.codigo} · ${producto.nombre}` : producto.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sucursalId} onValueChange={setSucursalId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las sucursales</SelectItem>
              {(sucursales ?? []).map((sucursal) => (
                <SelectItem key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los tipos</SelectItem>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-40"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <Input
            type="date"
            className="w-40"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
        <CrudTable columns={columns} data={movimientos ?? []} isLoading={isLoading} emptyMessage="Sin movimientos registrados." pageSize={20} />
      </div>
    </div>
  )
}
