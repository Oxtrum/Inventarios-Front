import { useProductoVariante } from "@/hooks/useProductoVariantes"

interface ProductoVarianteLabelProps {
  productoNombre: string
  productoVarianteId?: string
}

export function ProductoVarianteLabel({ productoNombre, productoVarianteId = "" }: ProductoVarianteLabelProps) {
  const { data: variante } = useProductoVariante(productoVarianteId)

  if (!productoVarianteId || !variante) return <>{productoNombre}</>

  return (
    <div className="flex flex-col">
      <span>{productoNombre}</span>
      <span className="text-xs text-muted-foreground">{variante.codigoSku} · {variante.nombre}</span>
    </div>
  )
}
