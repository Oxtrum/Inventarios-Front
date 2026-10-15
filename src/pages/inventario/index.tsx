import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { IconAdjustments, IconHistory } from "@tabler/icons-react"

import { useStock } from "@/hooks/useInventario"
import { useProductos } from "@/hooks/useProductos"
import { useSucursal } from "@/context/sucursal-provider"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { Button } from "@/components/ui/button"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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
  const {
    data: stock,
    isLoading,
    isError,
    error,
    refetch,
  } = useStock(canQuery ? stockFilters : undefined)

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

        {canQuery && !isLoading && isError && (
          <ErrorState
            error={error}
            title="No pudimos consultar el stock"
            onRetry={() => refetch()}
          />
        )}

        {canQuery && !isLoading && !isError && stock && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StockCard etiqueta="Stock Actual" valor={stock.stockActual} />
              <StockCard
                etiqueta="Reservado"
                valor={stock.stockReservado}
                tono="reservado"
              />
              <StockCard
                etiqueta="Disponible"
                valor={stock.stockDisponible}
                tono="disponible"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Disponible = actual − reservado. Las tres cifras se derivan del
              historial de movimientos; no son contadores editables.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

interface StockCardProps {
  etiqueta: string
  valor: number
  tono?: "reservado" | "disponible"
}

function StockCard({ etiqueta, valor, tono }: StockCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {etiqueta}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "font-mono text-2xl font-semibold tabular-nums",
            tono === "reservado" && "text-orange-700 dark:text-orange-400",
            tono === "disponible" && "text-emerald-700 dark:text-emerald-400",
          )}
        >
          {valor}
        </p>
      </CardContent>
    </Card>
  )
}
