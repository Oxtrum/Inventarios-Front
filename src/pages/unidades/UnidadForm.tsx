import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateUnidad, useUpdateUnidad } from "@/hooks/useUnidades"
import { ApiError } from "@/lib/api"
import { numberString } from "@/lib/validation"
import type { Unidad } from "@/types/unidad"
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
  simbolo: z.string().min(1, "El símbolo es obligatorio"),
  precision: numberString,
})

type FormValues = z.infer<typeof formSchema>

interface UnidadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unidad?: Unidad
}

export function UnidadForm({ open, onOpenChange, unidad }: UnidadFormProps) {
  const isEditing = !!unidad
  const createUnidad = useCreateUnidad()
  const updateUnidad = useUpdateUnidad(unidad?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", simbolo: "", precision: "0" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: unidad?.nombre ?? "",
      simbolo: unidad?.simbolo ?? "",
      precision: String(unidad?.precision ?? 0),
    })
  }, [open, unidad, form])

  const isSubmitting = createUnidad.isPending || updateUnidad.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      nombre: values.nombre,
      simbolo: values.simbolo,
      precision: Number(values.precision || 0),
    }
    const mutation = isEditing ? updateUnidad : createUnidad
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Unidad actualizada" : "Unidad creada")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar la unidad")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar unidad" : "Crear unidad"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos de la unidad." : "Completa los datos para crear una unidad de medida."}
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
                    <Input placeholder="Kilogramo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="simbolo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Símbolo</FormLabel>
                    <FormControl>
                      <Input placeholder="kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precisión decimal</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear unidad"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
