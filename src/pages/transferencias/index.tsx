import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useTransferencias, useAnularTransferencia } from "@/hooks/useTransferencias"
import { useSucursales } from "@/hooks/useSucursales"
import { ApiError } from "@/lib/api"
import type { Transferencia } from "@/types/transferencia"
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

function AnularAction({ transferencia }: { transferencia: Transferencia }) {
  const [confirming, setConfirming] = useState(false)
  const anularTransferencia = useAnularTransferencia(transferencia.id)

  function handleConfirm() {
    anularTransferencia.mutate(undefined, {
      onSuccess: () => {
        toast.success("Transferencia anulada")
        setConfirming(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo anular la transferencia"),
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
        title="¿Anular transferencia?"
        description="Esta acción revertirá los movimientos de inventario generados por la transferencia."
        confirmLabel="Anular"
        variant="destructive"
        isLoading={anularTransferencia.isPending}
        onConfirm={handleConfirm}
      />
    </>
  )
}

export default function TransferenciasPage() {
  const navigate = useNavigate()
  const { data: sucursales } = useSucursales()
  const { data: transferencias, isLoading } = useTransferencias()

  const sucursalPorId = useMemo(() => new Map((sucursales ?? []).map((s) => [s.id, s.nombre])), [sucursales])

  const columns: ColumnDef<Transferencia>[] = [
    { accessorKey: "numero", header: "Número", cell: ({ row }) => row.original.numero ?? "—" },
    {
      accessorKey: "sucursalOrigenId",
      header: "Origen",
      cell: ({ row }) => sucursalPorId.get(row.original.sucursalOrigenId) ?? "—",
    },
    {
      accessorKey: "sucursalDestinoId",
      header: "Destino",
      cell: ({ row }) => sucursalPorId.get(row.original.sucursalDestinoId) ?? "—",
    },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <EstadoBadge estado={row.original.estado} /> },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.fechaCreacion).toLocaleDateString("es-ES"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transferencia = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate(`/transferencias/${transferencia.id}`)}>
                Ver detalle
              </DropdownMenuItem>
              {transferencia.estado === "registrada" && <AnularAction transferencia={transferencia} />}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Transferencias"
        description="Traslados de stock entre sucursales."
        action={
          <Button onClick={() => navigate("/transferencias/nueva")}>
            <IconPlus />
            Nueva Transferencia
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <CrudTable columns={columns} data={transferencias ?? []} isLoading={isLoading} emptyMessage="Sin transferencias registradas." />
      </div>
    </div>
  )
}
