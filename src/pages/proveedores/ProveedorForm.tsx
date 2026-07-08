import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateProveedor, useUpdateProveedor } from "@/hooks/useProveedores"
import { ApiError } from "@/lib/api"
import type { Proveedor } from "@/types/proveedor"
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
  nit: z.string().optional(),
  email: z.union([z.literal(""), z.email("Correo inválido")]),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProveedorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor?: Proveedor
}

export function ProveedorForm({ open, onOpenChange, proveedor }: ProveedorFormProps) {
  const isEditing = !!proveedor
  const createProveedor = useCreateProveedor()
  const updateProveedor = useUpdateProveedor(proveedor?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", nit: "", email: "", telefono: "", direccion: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: proveedor?.nombre ?? "",
      nit: proveedor?.nit ?? "",
      email: proveedor?.email ?? "",
      telefono: proveedor?.telefono ?? "",
      direccion: proveedor?.direccion ?? "",
    })
  }, [open, proveedor, form])

  const isSubmitting = createProveedor.isPending || updateProveedor.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      nombre: values.nombre,
      nit: values.nit || undefined,
      email: values.email || undefined,
      telefono: values.telefono || undefined,
      direccion: values.direccion || undefined,
    }
    const mutation = isEditing ? updateProveedor : createProveedor
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Proveedor actualizado" : "Proveedor creado")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el proveedor")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar proveedor" : "Crear proveedor"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos del proveedor." : "Completa los datos para registrar un proveedor."}
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
                    <Input placeholder="Nombre del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIT</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contacto@proveedor.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {isEditing ? "Guardar cambios" : "Crear proveedor"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
