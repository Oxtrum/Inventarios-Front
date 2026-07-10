import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateOrganizacion, useUpdateOrganizacion } from "@/hooks/useOrganizaciones"
import { ApiError } from "@/lib/api"
import type { Organizacion } from "@/types/organizacion"
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
  codigo: z.string().min(1, "El código es obligatorio"),
  plan: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface OrganizacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizacion?: Organizacion
}

export function OrganizacionForm({ open, onOpenChange, organizacion }: OrganizacionFormProps) {
  const isEditing = !!organizacion
  const createOrganizacion = useCreateOrganizacion()
  const updateOrganizacion = useUpdateOrganizacion(organizacion?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", codigo: "", plan: "base" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: organizacion?.nombre ?? "",
      codigo: organizacion?.codigo ?? "",
      plan: organizacion?.plan ?? "base",
    })
  }, [open, organizacion, form])

  const isSubmitting = createOrganizacion.isPending || updateOrganizacion.isPending

  function onSubmit(values: FormValues) {
    const payload = { nombre: values.nombre, codigo: values.codigo, plan: values.plan || undefined }
    const mutation = isEditing ? updateOrganizacion : createOrganizacion

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Organización actualizada" : "Organización creada")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar la organización")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar organización" : "Crear organización"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos de la organización." : "Completa los datos para crear una organización."}
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
                    <Input placeholder="Nombre de la organización" {...field} />
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
                    <Input placeholder="demo" disabled={isEditing} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <FormControl>
                    <Input placeholder="base" {...field} />
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
            {isEditing ? "Guardar cambios" : "Crear organización"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
