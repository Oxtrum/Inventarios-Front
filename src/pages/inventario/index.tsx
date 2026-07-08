import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { IconAdjustments, IconHistory } from "@tabler/icons-react"

import { useStock } from "@/hooks/useInventario"
import { useProductos } from "@/hooks/useProductos"
import { useSucursales } from "@/hooks/useSucursales"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function InventarioPage() {
  const navigate = useNavigate()
  const [productoId, setProductoId] = useState("")
  const [sucursalId, setSucursalId] = useState("")

  const { data: productos } = useProductos({ activo: "true" })
  const { data: sucursales } = useSucursales({ activo: "true" })

  const canQuery = !!productoId && !!sucursalId
  const { data: stock, isLoading } = useStock(canQuery ? { productoId, sucursalId } : undefined)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Stock"
        description="Consulta el stock actual, reservado y disponible de un producto en una sucursal."
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
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2">
            <Label>Producto</Label>
            <Select value={productoId} onValueChange={setProductoId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {(productos ?? []).map((producto) => (
                  <SelectItem key={producto.id} value={producto.id}>
                    {producto.codigo ? `${producto.codigo} · ${producto.nombre}` : producto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Sucursal</Label>
            <Select value={sucursalId} onValueChange={setSucursalId}>
              <SelectTrigger className="w-56">
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
        </div>

        {!canQuery && (
          <EmptyState title="Selecciona producto y sucursal" description="Elige un producto y una sucursal para consultar su stock." />
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
