import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useTiposNegocio } from "@/hooks/useTiposNegocio"
import { useCreateTipoProducto, useUpdateTipoProducto } from "@/hooks/useTiposProducto"
import { ApiError } from "@/lib/api"
import type { TipoProducto } from "@/types/tipoProducto"
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

const NONE = "__none__"

const formSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  tipoNegocioId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TipoProductoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoProducto?: TipoProducto
}

export function TipoProductoForm({ open, onOpenChange, tipoProducto }: TipoProductoFormProps) {
  const isEditing = !!tipoProducto
  const { data: tiposNegocio } = useTiposNegocio({ activo: "true" })
  const createTipoProducto = useCreateTipoProducto()
  const updateTipoProducto = useUpdateTipoProducto(tipoProducto?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { codigo: "", nombre: "", descripcion: "", tipoNegocioId: NONE },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      codigo: tipoProducto?.codigo ?? "",
      nombre: tipoProducto?.nombre ?? "",
      descripcion: tipoProducto?.descripcion ?? "",
      tipoNegocioId: tipoProducto?.tipoNegocioId ?? NONE,
    })
  }, [open, tipoProducto, form])

  const isSubmitting = createTipoProducto.isPending || updateTipoProducto.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      codigo: values.codigo,
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      tipoNegocioId: values.tipoNegocioId === NONE ? undefined : values.tipoNegocioId,
    }
    const mutation = isEditing ? updateTipoProducto : createTipoProducto
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Tipo de producto actualizado" : "Tipo de producto creado")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el tipo de producto")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar tipo de producto" : "Crear tipo de producto"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos del tipo de producto." : "Completa los datos para crear un tipo de producto."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="ROPA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ropa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipoNegocioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Negocio</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin tipo de negocio</SelectItem>
                      {(tiposNegocio ?? []).map((tipoNegocio) => (
                        <SelectItem key={tipoNegocio.id} value={tipoNegocio.id}>
                          {tipoNegocio.nombre}
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
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción opcional" {...field} />
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
            {isEditing ? "Guardar cambios" : "Crear tipo de producto"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
