import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { useCatalogoProductos } from "@/hooks/useInventario"
import { useSucursal } from "@/context/sucursal-provider"
import { formatCurrency } from "@/lib/utils"
import type { CatalogoProducto } from "@/types/inventario"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { Badge } from "@/components/ui/badge"

export default function CatalogoPage() {
  const [nombre, setNombre] = useState("")
  const { sucursalId, sucursalActiva } = useSucursal()

  const { data: catalogo, isLoading } = useCatalogoProductos({
    ...(nombre ? { nombre } : {}),
    ...(sucursalId ? { sucursalId } : {}),
    soloConStock: "true",
  })

  const columns: ColumnDef<CatalogoProducto>[] = [
    { accessorKey: "codigo", header: "Código", cell: ({ row }) => row.original.codigo ?? "—" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "tipoProducto", header: "Tipo", cell: ({ row }) => row.original.tipoProducto ?? "—" },
    {
      id: "variantes",
      header: "Variantes",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.variantes.map((variante) => (
            <Badge key={variante.id} variant="outline">
              {variante.sku} · {formatCurrency(variante.precio)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "stockDisponible",
      header: () => <div className="text-right">Stock Disponible</div>,
      cell: ({ row }) => <div className="text-right">{row.original.stockDisponible}</div>,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Catálogo Público"
        description={`Vista de catálogo con stock disponible en ${sucursalActiva ? sucursalActiva.nombre : "todas las sucursales"}, la misma que consume la eshop vía GET /api/catalogo/productos.`}
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        </div>

        <CrudTable
          columns={columns}
          data={catalogo ?? []}
          isLoading={isLoading}
          emptyMessage="Sin productos con stock disponible."
        />
      </div>
    </div>
  )
}
