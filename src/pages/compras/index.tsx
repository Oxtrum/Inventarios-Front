import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useCompras, useAnularCompra } from "@/hooks/useCompras"
import { useSucursales } from "@/hooks/useSucursales"
import { useProveedores } from "@/hooks/useProveedores"
import { ApiError } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { Compra } from "@/types/compra"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EstadoBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AnularAction({ compra }: { compra: Compra }) {
  const [confirming, setConfirming] = useState(false)
  const anularCompra = useAnularCompra(compra.id)

  function handleConfirm() {
    anularCompra.mutate(undefined, {
      onSuccess: () => {
        toast.success("Compra anulada")
        setConfirming(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo anular la compra"),
    })
  }

  return (
    <>
      <DropdownMenuItem variant="destructive" onSelect={(e) => { e.preventDefault(); setConfirming(true) }}>
        Anular
      </DropdownMenuItem>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="¿Anular compra?"
        description="Esta acción revertirá los movimientos de inventario generados por la compra."
        confirmLabel="Anular"
        variant="destructive"
        isLoading={anularCompra.isPending}
        onConfirm={handleConfirm}
      />
    </>
  )
}

export default function ComprasPage() {
  const navigate = useNavigate()
  const { data: sucursales } = useSucursales()
  const { data: proveedores } = useProveedores()
  const { data: compras, isLoading } = useCompras()

  const nombrePorId = useMemo(() => {
    const sucursalMap = new Map((sucursales ?? []).map((s) => [s.id, s.nombre]))
    const proveedorMap = new Map((proveedores ?? []).map((p) => [p.id, p.nombre]))
    return { sucursalMap, proveedorMap }
  }, [sucursales, proveedores])

  const columns: ColumnDef<Compra>[] = [
    { accessorKey: "numero", header: "Número", cell: ({ row }) => row.original.numero ?? "—" },
    {
      accessorKey: "proveedorId",
      header: "Proveedor",
      cell: ({ row }) => (row.original.proveedorId ? nombrePorId.proveedorMap.get(row.original.proveedorId) ?? "—" : "—"),
    },
    {
      accessorKey: "sucursalId",
      header: "Sucursal",
      cell: ({ row }) => nombrePorId.sucursalMap.get(row.original.sucursalId) ?? "—",
    },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <EstadoBadge estado={row.original.estado} /> },
    {
      accessorKey: "total",
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.total)}</div>,
    },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.fechaCreacion).toLocaleDateString("es-ES"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const compra = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate(`/compras/${compra.id}`)}>Ver detalle</DropdownMenuItem>
              {compra.estado === "registrada" && <AnularAction compra={compra} />}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Compras"
        description="Compras registradas a proveedores."
        action={
          <Button onClick={() => navigate("/compras/nueva")}>
            <IconPlus />
            Nueva Compra
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <CrudTable columns={columns} data={compras ?? []} isLoading={isLoading} emptyMessage="Sin compras registradas." />
      </div>
    </div>
  )
}
