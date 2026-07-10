import { useState } from "react"
import { IconCheck } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useTiposNegocio } from "@/hooks/useTiposNegocio"
import { useDetallePlantilla, useAplicarPlantilla } from "@/hooks/usePlantillas"
import { ApiError } from "@/lib/api"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

const DEFAULT_INCLUDE = {
  incluirTiposProducto: true,
  incluirAtributos: true,
  incluirValores: true,
  incluirRelaciones: true,
  incluirConfiguraciones: true,
}

const INCLUDE_OPTIONS: { key: keyof typeof DEFAULT_INCLUDE; label: string }[] = [
  { key: "incluirTiposProducto", label: "Tipos de producto" },
  { key: "incluirAtributos", label: "Atributos" },
  { key: "incluirValores", label: "Valores de atributo" },
  { key: "incluirRelaciones", label: "Relaciones tipo de producto ↔ atributo" },
  { key: "incluirConfiguraciones", label: "Configuraciones" },
]

export default function PlantillasPage() {
  const [tipoNegocioId, setTipoNegocioId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [include, setInclude] = useState(DEFAULT_INCLUDE)

  const { data: tiposNegocio } = useTiposNegocio({ activo: "true" })
  const { data: detalle, isLoading } = useDetallePlantilla(tipoNegocioId)
  const aplicarPlantilla = useAplicarPlantilla(tipoNegocioId)

  function handleAplicar() {
    aplicarPlantilla.mutate(include, {
      onSuccess: (result) => {
        toast.success(
          `Plantilla aplicada: ${result.tiposProducto} tipos de producto, ${result.atributos} atributos, ${result.valores} valores, ${result.relaciones} relaciones, ${result.configuraciones} configuraciones`
        )
        setDialogOpen(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo aplicar la plantilla"),
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Plantillas"
        description="Aplica el catálogo de referencia de un tipo de negocio a tu organización."
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={tipoNegocioId} onValueChange={setTipoNegocioId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar tipo de negocio" />
            </SelectTrigger>
            <SelectContent>
              {(tiposNegocio ?? []).map((tipoNegocio) => (
                <SelectItem key={tipoNegocio.id} value={tipoNegocio.id}>
                  {tipoNegocio.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!tipoNegocioId}>
                <IconCheck />
                Aplicar a mi organización
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aplicar plantilla</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {INCLUDE_OPTIONS.map((option) => (
                  <label key={option.key} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={include[option.key]}
                      onCheckedChange={(checked) => setInclude((prev) => ({ ...prev, [option.key]: !!checked }))}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={handleAplicar} disabled={aplicarPlantilla.isPending}>
                  {aplicarPlantilla.isPending && <Loader2 className="animate-spin" />}
                  Aplicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!tipoNegocioId && (
          <EmptyState title="Selecciona un tipo de negocio" description="Elige un tipo de negocio para ver su plantilla." />
        )}

        {tipoNegocioId && isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {tipoNegocioId && !isLoading && detalle && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Producto ({detalle.tiposProducto.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.tiposProducto.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.nombre}</span>
                    <Badge variant="outline">{item.codigo}</Badge>
                  </div>
                ))}
                {detalle.tiposProducto.length === 0 && <p className="text-sm text-muted-foreground">Sin tipos de producto.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Atributos ({detalle.atributos.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.atributos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.nombre}</span>
                    <Badge variant="outline">{item.tipoDato}</Badge>
                  </div>
                ))}
                {detalle.atributos.length === 0 && <p className="text-sm text-muted-foreground">Sin atributos.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Valores ({detalle.valores.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.valores.map((item) => (
                  <div key={item.id} className="text-sm">
                    {item.valor}
                  </div>
                ))}
                {detalle.valores.length === 0 && <p className="text-sm text-muted-foreground">Sin valores.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Configuraciones ({detalle.configuraciones.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.configuraciones.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.clave}</span>
                    {item.descripcion && <span className="text-muted-foreground">{item.descripcion}</span>}
                  </div>
                ))}
                {detalle.configuraciones.length === 0 && <p className="text-sm text-muted-foreground">Sin configuraciones.</p>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
