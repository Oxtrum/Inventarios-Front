import { useEffect } from "react"
import type { FieldValues, Path, UseFormReturn } from "react-hook-form"
import { useSucursal } from "@/context/sucursal-provider"

/**
 * Pre-rellena un campo de sucursal de un formulario con la sucursal activa del
 * header en cuanto esté disponible, siempre que el usuario no haya elegido otra
 * todavía. El campo sigue siendo editable (necesario para operaciones como
 * transferencias donde la sucursal puede diferir de la activa).
 */
export function useSucursalDefault<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: Path<T>
) {
  const { sucursalActiva } = useSucursal()

  useEffect(() => {
    if (sucursalActiva && !form.getValues(field)) {
      form.setValue(field, sucursalActiva.id as never, {
        shouldDirty: false,
        shouldValidate: false,
      })
    }
  }, [sucursalActiva, form, field])
}
