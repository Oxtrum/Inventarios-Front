import { useEffect, useMemo } from "react"
import { useProductoVariantes } from "@/hooks/useProductoVariantes"
import type { Producto } from "@/types/producto"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DEFAULT_VARIANT = "__default_variant__"

interface VarianteSelectProps {
  productoId: string
  productoVarianteId?: string
  onVarianteChange: (productoVarianteId: string) => void
  allowDefault?: boolean
  defaultLabel?: string
  className?: string
  autoSelectDefault?: boolean
}

export function VarianteSelect({
  productoId,
  productoVarianteId = "",
  onVarianteChange,
  allowDefault = true,
  defaultLabel = "Variante predeterminada",
  className,
  autoSelectDefault = false,
}: VarianteSelectProps) {
  const { data: variantes, isLoading } = useProductoVariantes(productoId)
  const variantesActivas = useMemo(
    () => (variantes ?? []).filter((variante) => variante.activo),
    [variantes],
  )

  useEffect(() => {
    if (!autoSelectDefault || !productoId || productoVarianteId || variantesActivas.length === 0) return
    const predeterminada = variantesActivas.find((variante) => variante.esDefault) ?? variantesActivas[0]
    onVarianteChange(predeterminada.id)
  }, [autoSelectDefault, onVarianteChange, productoId, productoVarianteId, variantesActivas])

  return (
    <Select
      value={productoVarianteId || (allowDefault ? DEFAULT_VARIANT : undefined)}
      onValueChange={(value) => onVarianteChange(value === DEFAULT_VARIANT ? "" : value)}
      disabled={!productoId || isLoading}
    >
      <SelectTrigger className={className ?? "w-full"}>
        <SelectValue placeholder={isLoading ? "Cargando variantes..." : "Seleccionar variante / SKU"} />
      </SelectTrigger>
      <SelectContent>
        {allowDefault && <SelectItem value={DEFAULT_VARIANT}>{defaultLabel}</SelectItem>}
        {variantesActivas.map((variante) => (
          <SelectItem key={variante.id} value={variante.id}>
            {variante.codigoSku} · {variante.nombre}{variante.esDefault ? " (predeterminada)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface ProductoVariantePickerProps {
  productos: Producto[]
  productoId: string
  productoVarianteId?: string
  onProductoChange: (productoId: string) => void
  onVarianteChange: (productoVarianteId: string) => void
  showLabels?: boolean
  className?: string
  defaultVariantLabel?: string
  allowDefaultVariant?: boolean
  autoSelectVariant?: boolean
}

export function ProductoVariantePicker({
  productos,
  productoId,
  productoVarianteId = "",
  onProductoChange,
  onVarianteChange,
  showLabels = true,
  className,
  defaultVariantLabel,
  allowDefaultVariant = true,
  autoSelectVariant = true,
}: ProductoVariantePickerProps) {
  const productoSeleccionado = productos.find((producto) => producto.id === productoId)
  const puedeUsarPredeterminada = allowDefaultVariant && !productoSeleccionado?.esVarianteRequerida

  return (
    <div className={className ?? "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
      <div className="flex flex-col gap-2">
        {showLabels && <Label>Producto</Label>}
        <Select
          value={productoId}
          onValueChange={(value) => {
            onProductoChange(value)
            onVarianteChange("")
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent>
            {productos.map((producto) => (
              <SelectItem key={producto.id} value={producto.id}>
                {producto.codigo ? `${producto.codigo} · ${producto.nombre}` : producto.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        {showLabels && <Label>Variante / SKU</Label>}
        <VarianteSelect
          productoId={productoId}
          productoVarianteId={productoVarianteId}
          onVarianteChange={onVarianteChange}
          defaultLabel={defaultVariantLabel}
          allowDefault={puedeUsarPredeterminada}
          autoSelectDefault={autoSelectVariant}
        />
      </div>
    </div>
  )
}
