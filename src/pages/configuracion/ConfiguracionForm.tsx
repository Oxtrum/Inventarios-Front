import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useSucursales } from "@/hooks/useSucursales"
import { useCreateConfiguracion, useUpdateConfiguracion } from "@/hooks/useConfiguraciones"
import { ApiError } from "@/lib/api"
import type { Configuracion } from "@/types/configuracion"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

const GLOBAL = "__global__"

const formSchema = z.object({
  clave: z.string().min(1, "La clave es obligatoria"),
  sucursalId: z.string(),
  valor: z.string().refine((value) => {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }, "El valor debe ser JSON válido"),
})

type FormValues = z.infer<typeof formSchema>

interface ConfiguracionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  configuracion?: Configuracion
}

export function ConfiguracionForm({ open, onOpenChange, configuracion }: ConfiguracionFormProps) {
  const isEditing = !!configuracion
  const { data: sucursales } = useSucursales({ activo: "true" })
  const createConfiguracion = useCreateConfiguracion()
  const updateConfiguracion = useUpdateConfiguracion(configuracion?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { clave: "", sucursalId: GLOBAL, valor: "{}" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      clave: configuracion?.clave ?? "",
      sucursalId: configuracion?.sucursalId ?? GLOBAL,
      valor: configuracion ? JSON.stringify(configuracion.valor, null, 2) : "{}",
    })
  }, [open, configuracion, form])

  const isSubmitting = createConfiguracion.isPending || updateConfiguracion.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      clave: values.clave,
      sucursalId: values.sucursalId === GLOBAL ? undefined : values.sucursalId,
      valor: JSON.parse(values.valor),
    }
    const mutation = isEditing ? updateConfiguracion : createConfiguracion
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Configuración actualizada" : "Configuración creada")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar la configuración")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar configuración" : "Crear configuración"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza el valor de la configuración." : "Define una clave y su valor en formato JSON."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <FormField
              control={form.control}
              name="clave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave</FormLabel>
                  <FormControl>
                    <Input placeholder="clave.configuracion" {...field} disabled={isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sucursalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sucursal</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={GLOBAL}>Global (todas las sucursales)</SelectItem>
                      {(sucursales ?? []).map((sucursal) => (
                        <SelectItem key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (JSON)</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-40 font-mono text-xs" placeholder="{}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear configuración"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
