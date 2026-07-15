import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import { toast } from "sonner"

import { useDevolucion, useAnularDevolucion } from "@/hooks/useDevoluciones"
import { useSucursales } from "@/hooks/useSucursales"
import { useProveedores } from "@/hooks/useProveedores"
import { useProductos } from "@/hooks/useProductos"
import { ApiError } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
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

export default function DevolucionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const devolucionId = id ?? ""
  const [confirmingAnular, setConfirmingAnular] = useState(false)

  const { data: devolucion, isLoading } = useDevolucion(devolucionId)
  const { data: sucursales } = useSucursales()
  const { data: proveedores } = useProveedores()
  const { data: productos } = useProductos()
  const anularDevolucion = useAnularDevolucion(devolucionId)

  const nombrePorId = useMemo(() => {
    const sucursalMap = new Map((sucursales ?? []).map((s) => [s.id, s.nombre]))
    const proveedorMap = new Map((proveedores ?? []).map((p) => [p.id, p.nombre]))
    const productoMap = new Map((productos ?? []).map((p) => [p.id, p.nombre]))
    return { sucursalMap, proveedorMap, productoMap }
  }, [sucursales, proveedores, productos])

  function confirmAnular() {
    anularDevolucion.mutate(undefined, {
      onSuccess: () => {
        toast.success("Devolución anulada")
        setConfirmingAnular(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo anular la devolución"),
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

  if (!devolucion) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:py-6 lg:px-6">
        <p className="text-sm text-muted-foreground">No se encontró la devolución.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title={devolucion.numero ? `Devolución ${devolucion.numero}` : "Detalle de Devolución"}
        description={new Date(devolucion.fechaCreacion).toLocaleString("es-ES")}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/devoluciones">
                <IconArrowLeft />
                Volver
              </Link>
            </Button>
            {devolucion.estado === "registrada" && (
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
              <EstadoBadge estado={devolucion.estado} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Sucursal</p>
              <p className="font-medium">{nombrePorId.sucursalMap.get(devolucion.sucursalId) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proveedor</p>
              <p className="font-medium">{nombrePorId.proveedorMap.get(devolucion.proveedorId) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Motivo</p>
              <p className="font-medium">{devolucion.motivo ?? "—"}</p>
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
                    <TableHead className="text-right">Costo Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devolucion.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <ProductoVarianteLabel
                          productoNombre={nombrePorId.productoMap.get(item.productoId) ?? item.productoId}
                          productoVarianteId={item.productoVarianteId}
                        />
                      </TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.costoUnitario)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-end gap-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold">{formatCurrency(devolucion.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmingAnular}
        onOpenChange={setConfirmingAnular}
        title="¿Anular devolución?"
        description="Esta acción revertirá los movimientos de inventario generados por la devolución."
        confirmLabel="Anular"
        variant="destructive"
        isLoading={anularDevolucion.isPending}
        onConfirm={confirmAnular}
      />
    </div>
  )
}
