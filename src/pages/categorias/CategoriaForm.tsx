import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateCategoria, useUpdateCategoria } from "@/hooks/useCategorias"
import { ApiError } from "@/lib/api"
import type { Categoria } from "@/types/categoria"
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
  nombre: z.string().min(1, "El nombre es obligatorio"),
  codigo: z.string().min(1, "El código es obligatorio"),
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoriaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: Categoria
}

export function CategoriaForm({ open, onOpenChange, categoria }: CategoriaFormProps) {
  const isEditing = !!categoria
  const createCategoria = useCreateCategoria()
  const updateCategoria = useUpdateCategoria(categoria?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", codigo: "", descripcion: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: categoria?.nombre ?? "",
      codigo: categoria?.codigo ?? "",
      descripcion: categoria?.descripcion ?? "",
    })
  }, [open, categoria, form])

  const isSubmitting = createCategoria.isPending || updateCategoria.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      nombre: values.nombre,
      codigo: values.codigo,
      descripcion: values.descripcion || undefined,
    }
    const mutation = isEditing ? updateCategoria : createCategoria
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Categoría actualizada" : "Categoría creada")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar la categoría")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar categoría" : "Crear categoría"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos de la categoría." : "Completa los datos para crear una categoría."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la categoría" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="CAT-001" {...field} />
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
            {isEditing ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
