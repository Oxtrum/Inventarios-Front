import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { IconPlus, IconTrash } from "@tabler/icons-react"

import { useSucursal } from "@/context/sucursal-provider"
import { useProductos } from "@/hooks/useProductos"
import { useCreateConteo } from "@/hooks/useConteos"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import { ProductoVarianteLabel } from "@/components/shared/ProductoVarianteLabel"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ConteoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SeleccionConteo {
  productoId: string
  productoVarianteId?: string
}

export function ConteoForm({ open, onOpenChange }: ConteoFormProps) {
  const navigate = useNavigate()
  const { sucursales, sucursalActiva } = useSucursal()
  const { data: productos } = useProductos({ activo: "true" })
  const createConteo = useCreateConteo()

  const [sucursalId, setSucursalId] = useState("")
  // Sin elección explícita se usa la sucursal activa del header como valor por defecto.
  const sucursalSeleccionada = sucursalId || (sucursalActiva?.id ?? "")
  const [observacion, setObservacion] = useState("")
  const [productoId, setProductoId] = useState("")
  const [productoVarianteId, setProductoVarianteId] = useState("")
  const [selecciones, setSelecciones] = useState<SeleccionConteo[]>([])
  const [error, setError] = useState("")

  function resetForm() {
    setSucursalId("")
    setObservacion("")
    setProductoId("")
    setProductoVarianteId("")
    setSelecciones([])
    setError("")
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  function agregarSeleccion() {
    if (!productoId) {
      setError("Selecciona un producto")
      return
    }
    if (!productoVarianteId) {
      setError("Selecciona una variante / SKU para el conteo")
      return
    }
    const key = productoVarianteId || `producto:${productoId}`
    const existe = selecciones.some((item) => (item.productoVarianteId || `producto:${item.productoId}`) === key)
    if (existe) {
      setError("El producto o variante ya fue agregado")
      return
    }
    setSelecciones((prev) => [...prev, { productoId, productoVarianteId: productoVarianteId || undefined }])
    setProductoId("")
    setProductoVarianteId("")
    setError("")
  }

  function handleSubmit() {
    if (!sucursalSeleccionada) {
      setError("Selecciona una sucursal")
      return
    }
    if (selecciones.length === 0) {
      setError("Selecciona al menos un producto")
      return
    }
    setError("")
    createConteo.mutate(
      {
        sucursalId: sucursalSeleccionada,
        observacion: observacion || undefined,
        productoIds: [],
        productoVarianteIds: selecciones.flatMap((item) => item.productoVarianteId ? [item.productoVarianteId] : []),
      },
      {
        onSuccess: (conteo) => {
          toast.success("Conteo creado")
          handleOpenChange(false)
          navigate(`/conteos/${conteo.id}`)
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo crear el conteo"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear conteo</DialogTitle>
          <DialogDescription>Selecciona la sucursal y los productos a contar.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Sucursal</Label>
            <Select value={sucursalSeleccionada} onValueChange={setSucursalId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar" />
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
          <div className="flex flex-col gap-2">
            <Label>Observación</Label>
            <Textarea
              placeholder="Observación opcional"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Productos y variantes</Label>
            <ProductoVariantePicker
              productos={productos ?? []}
              productoId={productoId}
              productoVarianteId={productoVarianteId}
              onProductoChange={setProductoId}
              onVarianteChange={setProductoVarianteId}
              allowDefaultVariant={false}
            />
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={agregarSeleccion}>
              <IconPlus />
              Agregar al conteo
            </Button>
            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-lg border p-3">
              {selecciones.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay productos o variantes agregados.</p>
              )}
              {selecciones.map((seleccion) => {
                const producto = (productos ?? []).find((item) => item.id === seleccion.productoId)
                const key = seleccion.productoVarianteId || `producto:${seleccion.productoId}`
                return (
                  <div key={key} className="flex items-center justify-between gap-3 text-sm">
                    <ProductoVarianteLabel
                      productoNombre={producto?.nombre ?? seleccion.productoId}
                      productoVarianteId={seleccion.productoVarianteId}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelecciones((prev) => prev.filter((item) => (item.productoVarianteId || `producto:${item.productoId}`) !== key))}
                    >
                      <IconTrash />
                      <span className="sr-only">Quitar</span>
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createConteo.isPending}>
            Crear conteo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
