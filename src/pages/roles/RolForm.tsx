import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateRol, useUpdateRol } from "@/hooks/useRoles"
import { ApiError } from "@/lib/api"
import type { Rol } from "@/types/rol"
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

interface RolFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rol?: Rol
}

export function RolForm({ open, onOpenChange, rol }: RolFormProps) {
  const isEditing = !!rol
  const createRol = useCreateRol()
  const updateRol = useUpdateRol(rol?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", codigo: "", descripcion: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: rol?.nombre ?? "",
      codigo: rol?.codigo ?? "",
      descripcion: rol?.descripcion ?? "",
    })
  }, [open, rol, form])

  const isSubmitting = createRol.isPending || updateRol.isPending

  function onSubmit(values: FormValues) {
    const onSettled = {
      onSuccess: () => {
        toast.success(isEditing ? "Rol actualizado" : "Rol creado")
        onOpenChange(false)
      },
      onError: (err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el rol")
      },
    }

    if (isEditing) {
      updateRol.mutate({ nombre: values.nombre, descripcion: values.descripcion || undefined }, onSettled)
    } else {
      createRol.mutate(
        { nombre: values.nombre, codigo: values.codigo, descripcion: values.descripcion || undefined },
        onSettled
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar rol" : "Crear rol"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos del rol." : "Completa los datos para crear un rol."}
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
                    <Input placeholder="Supervisor" {...field} />
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
                    <Input placeholder="supervisor" disabled={isEditing} {...field} />
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
            {isEditing ? "Guardar cambios" : "Crear rol"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
