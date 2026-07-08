import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useSucursales } from "@/hooks/useSucursales"
import { useProductos } from "@/hooks/useProductos"
import { useCreateConteo } from "@/hooks/useConteos"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

export function ConteoForm({ open, onOpenChange }: ConteoFormProps) {
  const navigate = useNavigate()
  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: productos } = useProductos({ activo: "true" })
  const createConteo = useCreateConteo()

  const [sucursalId, setSucursalId] = useState("")
  const [observacion, setObservacion] = useState("")
  const [productoIds, setProductoIds] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setSucursalId("")
    setObservacion("")
    setProductoIds([])
    setError("")
  }, [open])

  function toggleProducto(id: string, checked: boolean) {
    setProductoIds((prev) => (checked ? [...prev, id] : prev.filter((p) => p !== id)))
  }

  function handleSubmit() {
    if (!sucursalId) {
      setError("Selecciona una sucursal")
      return
    }
    if (productoIds.length === 0) {
      setError("Selecciona al menos un producto")
      return
    }
    setError("")
    createConteo.mutate(
      { sucursalId, observacion: observacion || undefined, productoIds },
      {
        onSuccess: (conteo) => {
          toast.success("Conteo creado")
          onOpenChange(false)
          navigate(`/conteos/${conteo.id}`)
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo crear el conteo"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear conteo</DialogTitle>
          <DialogDescription>Selecciona la sucursal y los productos a contar.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Sucursal</Label>
            <Select value={sucursalId} onValueChange={setSucursalId}>
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
            <Label>Productos</Label>
            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-lg border p-3">
              {(productos ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay productos disponibles.</p>
              )}
              {(productos ?? []).map((producto) => (
                <label key={producto.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={productoIds.includes(producto.id)}
                    onCheckedChange={(checked) => toggleProducto(producto.id, checked === true)}
                  />
                  {producto.codigo ? `${producto.codigo} · ${producto.nombre}` : producto.nombre}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
