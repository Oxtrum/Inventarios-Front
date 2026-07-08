import { useState } from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"

import { useValoracion } from "@/hooks/useReportes"
import { useSucursales } from "@/hooks/useSucursales"
import { formatCurrency } from "@/lib/utils"
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

export default function ValoracionPage() {
  const [sucursalId, setSucursalId] = useState("")
  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: valoracion, isLoading } = useValoracion(sucursalId ? { sucursalId } : undefined)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Valoración de Inventario"
        description="Valor de costo del inventario disponible en una sucursal."
        action={
          <Button variant="outline" asChild>
            <Link to="/reportes">
              <IconArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-col gap-2 sm:max-w-xs">
          <Label>Sucursal</Label>
          <Select value={sucursalId} onValueChange={setSucursalId}>
            <SelectTrigger className="w-full">
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

        {!sucursalId && (
          <EmptyState title="Selecciona una sucursal" description="Elige una sucursal para ver su valoración de inventario." />
        )}

        {sucursalId && isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {sucursalId && !isLoading && valoracion && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{valoracion.totalProductos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Stock Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{valoracion.stockDisponible}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor de Costo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(valoracion.valorCosto)}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
