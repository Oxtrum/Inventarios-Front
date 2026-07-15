import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import { toast } from "sonner"

import { useTransferencia, useAnularTransferencia } from "@/hooks/useTransferencias"
import { useSucursales } from "@/hooks/useSucursales"
import { useProductos } from "@/hooks/useProductos"
import { ApiError } from "@/lib/api"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductoVarianteLabel } from "@/components/shared/ProductoVarianteLabel"
import { EstadoBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function TransferenciaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const transferenciaId = id ?? ""
  const [confirmingAnular, setConfirmingAnular] = useState(false)

  const { data: transferencia, isLoading } = useTransferencia(transferenciaId)
  const { data: sucursales } = useSucursales()
  const { data: productos } = useProductos()
  const anularTransferencia = useAnularTransferencia(transferenciaId)

  const nombrePorId = useMemo(() => {
    const sucursalMap = new Map((sucursales ?? []).map((s) => [s.id, s.nombre]))
    const productoMap = new Map((productos ?? []).map((p) => [p.id, p.nombre]))
    return { sucursalMap, productoMap }
  }, [sucursales, productos])

  function confirmAnular() {
    anularTransferencia.mutate(undefined, {
      onSuccess: () => {
        toast.success("Transferencia anulada")
        setConfirmingAnular(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo anular la transferencia"),
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:py-6 lg:px-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!transferencia) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:py-6 lg:px-6">
        <p className="text-sm text-muted-foreground">No se encontró la transferencia.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title={transferencia.numero ? `Transferencia ${transferencia.numero}` : "Detalle de Transferencia"}
        description={new Date(transferencia.fechaCreacion).toLocaleString("es-ES")}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/transferencias">
                <IconArrowLeft />
                Volver
              </Link>
            </Button>
            {transferencia.estado === "registrada" && (
              <Button variant="destructive" onClick={() => setConfirmingAnular(true)}>
                Anular
              </Button>
            )}
          </div>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Datos generales
              <EstadoBadge estado={transferencia.estado} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Sucursal Origen</p>
              <p className="font-medium">{nombrePorId.sucursalMap.get(transferencia.sucursalOrigenId) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sucursal Destino</p>
              <p className="font-medium">{nombrePorId.sucursalMap.get(transferencia.sucursalDestinoId) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Observación</p>
              <p className="font-medium">{transferencia.observacion ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferencia.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <ProductoVarianteLabel
                          productoNombre={nombrePorId.productoMap.get(item.productoId) ?? item.productoId}
                          productoVarianteId={item.productoVarianteId}
                        />
                      </TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmingAnular}
        onOpenChange={setConfirmingAnular}
        title="¿Anular transferencia?"
        description="Esta acción revertirá los movimientos de inventario generados por la transferencia."
        confirmLabel="Anular"
        variant="destructive"
        isLoading={anularTransferencia.isPending}
        onConfirm={confirmAnular}
      />
    </div>
  )
}
