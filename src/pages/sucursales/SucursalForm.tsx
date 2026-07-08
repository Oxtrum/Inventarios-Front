import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateSucursal, useUpdateSucursal } from "@/hooks/useSucursales"
import { ApiError } from "@/lib/api"
import type { Sucursal } from "@/types/sucursal"
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
  codigo: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface SucursalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sucursal?: Sucursal
}

export function SucursalForm({ open, onOpenChange, sucursal }: SucursalFormProps) {
  const isEditing = !!sucursal
  const createSucursal = useCreateSucursal()
  const updateSucursal = useUpdateSucursal(sucursal?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", codigo: "", direccion: "", telefono: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: sucursal?.nombre ?? "",
      codigo: sucursal?.codigo ?? "",
      direccion: sucursal?.direccion ?? "",
      telefono: sucursal?.telefono ?? "",
    })
  }, [open, sucursal, form])

  const isSubmitting = createSucursal.isPending || updateSucursal.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      nombre: values.nombre,
      codigo: values.codigo || undefined,
      direccion: values.direccion || undefined,
      telefono: values.telefono || undefined,
    }
    const mutation = isEditing ? updateSucursal : createSucursal
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Sucursal actualizada" : "Sucursal creada")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar la sucursal")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar sucursal" : "Crear sucursal"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos de la sucursal." : "Completa los datos para registrar una sucursal."}
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
                    <Input placeholder="Sucursal Central" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="SUC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+591 700 00000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección opcional" {...field} />
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
            {isEditing ? "Guardar cambios" : "Crear sucursal"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
