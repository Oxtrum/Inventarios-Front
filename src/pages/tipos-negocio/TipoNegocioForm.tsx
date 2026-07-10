import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateTipoNegocio, useUpdateTipoNegocio } from "@/hooks/useTiposNegocio"
import { ApiError } from "@/lib/api"
import type { TipoNegocio } from "@/types/tipoNegocio"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

const formSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TipoNegocioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoNegocio?: TipoNegocio
}

export function TipoNegocioForm({ open, onOpenChange, tipoNegocio }: TipoNegocioFormProps) {
  const isEditing = !!tipoNegocio
  const createTipoNegocio = useCreateTipoNegocio()
  const updateTipoNegocio = useUpdateTipoNegocio(tipoNegocio?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { codigo: "", nombre: "", descripcion: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      codigo: tipoNegocio?.codigo ?? "",
      nombre: tipoNegocio?.nombre ?? "",
      descripcion: tipoNegocio?.descripcion ?? "",
    })
  }, [open, tipoNegocio, form])

  const isSubmitting = createTipoNegocio.isPending || updateTipoNegocio.isPending

  function onSubmit(values: FormValues) {
    const payload = { codigo: values.codigo, nombre: values.nombre, descripcion: values.descripcion || undefined }
    const mutation = isEditing ? updateTipoNegocio : createTipoNegocio
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Tipo de negocio actualizado" : "Tipo de negocio creado")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el tipo de negocio")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar tipo de negocio" : "Crear tipo de negocio"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos del tipo de negocio." : "Completa los datos para crear un tipo de negocio."}
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
                    <Input placeholder="RETAIL" {...field} />
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
                    <Input placeholder="Retail / Tienda física" {...field} />
                  </FormControl>
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
            {isEditing ? "Guardar cambios" : "Crear tipo de negocio"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
