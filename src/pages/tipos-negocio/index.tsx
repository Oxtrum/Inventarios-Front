import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { useTiposNegocio } from "@/hooks/useTiposNegocio"
import type { TipoNegocio } from "@/types/tipoNegocio"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { StatusBadge } from "@/components/shared/StatusBadge"

export default function TiposNegocioPage() {
  const [nombre, setNombre] = useState("")
  const { data: tiposNegocio, isLoading } = useTiposNegocio(nombre ? { nombre } : undefined)

  const columns: ColumnDef<TipoNegocio>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Tipos de Negocio"
        description="Catálogo global de tipos de negocio usado por las plantillas. Solo lectura."
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={tiposNegocio ?? []} isLoading={isLoading} emptyMessage="Sin tipos de negocio registrados." />
      </div>
    </div>
  )
}
