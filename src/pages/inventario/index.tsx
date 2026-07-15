import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { IconAdjustments, IconHistory } from "@tabler/icons-react"

import { useStock } from "@/hooks/useInventario"
import { useProductos } from "@/hooks/useProductos"
import { useSucursal } from "@/context/sucursal-provider"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function InventarioPage() {
  const navigate = useNavigate()
  const [productoId, setProductoId] = useState("")
  const [productoVarianteId, setProductoVarianteId] = useState("")
  const { sucursalId, sucursalActiva } = useSucursal()

  const { data: productos } = useProductos({ activo: "true" })

  const canQuery = !!productoId
  const stockFilters: Record<string, string> = { productoId }
  if (productoVarianteId) stockFilters.productoVarianteId = productoVarianteId
  if (sucursalId) stockFilters.sucursalId = sucursalId
  const { data: stock, isLoading } = useStock(canQuery ? stockFilters : undefined)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Stock"
        description={`Consulta el stock actual, reservado y disponible de un producto en ${sucursalActiva ? sucursalActiva.nombre : "todas las sucursales"}.`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/inventario/movimientos")}>
              <IconHistory />
              Movimientos
            </Button>
            <Button onClick={() => navigate("/inventario/ajustes")}>
              <IconAdjustments />
              Ajustes
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <ProductoVariantePicker
          productos={productos ?? []}
          productoId={productoId}
          productoVarianteId={productoVarianteId}
          onProductoChange={setProductoId}
          onVarianteChange={setProductoVarianteId}
          className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
        />

        {!canQuery && (
          <EmptyState title="Selecciona un producto" description="Elige un producto para consultar su stock. La sucursal se controla desde el selector del encabezado." />
        )}

        {canQuery && isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {canQuery && !isLoading && stock && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Stock Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{stock.stockActual}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Reservado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{stock.stockReservado}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{stock.stockDisponible}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
