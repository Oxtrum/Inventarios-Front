import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCategorias } from "@/hooks/useCategorias"
import { useUnidades } from "@/hooks/useUnidades"
import { useCreateProducto, useUpdateProducto } from "@/hooks/useProductos"
import { ApiError } from "@/lib/api"
import { numberString } from "@/lib/validation"
import type { Producto } from "@/types/producto"
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
  nombre: z.string().min(1, "El nombre es obligatorio"),
  codigo: z.string().optional(),
  descripcion: z.string().optional(),
  categoriaId: z.string().optional(),
  unidadId: z.string().optional(),
  costo: numberString,
  precio: numberString,
  stockMinimo: numberString,
})

type FormValues = z.infer<typeof formSchema>

interface ProductoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto?: Producto
}

export function ProductoForm({ open, onOpenChange, producto }: ProductoFormProps) {
  const isEditing = !!producto
  const { data: categorias } = useCategorias({ activo: "true" })
  const { data: unidades } = useUnidades({ activo: "true" })
  const createProducto = useCreateProducto()
  const updateProducto = useUpdateProducto(producto?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      descripcion: "",
      categoriaId: NONE,
      unidadId: NONE,
      costo: "0",
      precio: "0",
      stockMinimo: "0",
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: producto?.nombre ?? "",
      codigo: producto?.codigo ?? "",
      descripcion: producto?.descripcion ?? "",
      categoriaId: producto?.categoriaId ?? NONE,
      unidadId: producto?.unidadId ?? NONE,
      costo: String(producto?.costo ?? 0),
      precio: String(producto?.precio ?? 0),
      stockMinimo: String(producto?.stockMinimo ?? 0),
    })
  }, [open, producto, form])

  const isSubmitting = createProducto.isPending || updateProducto.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      nombre: values.nombre,
      codigo: values.codigo || undefined,
      descripcion: values.descripcion || undefined,
      categoriaId: values.categoriaId === NONE ? undefined : values.categoriaId,
      unidadId: values.unidadId === NONE ? undefined : values.unidadId,
      costo: Number(values.costo || 0),
      precio: Number(values.precio || 0),
      stockMinimo: Number(values.stockMinimo || 0),
    }

    const mutation = isEditing ? updateProducto : createProducto
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Producto actualizado" : "Producto creado")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el producto")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar producto" : "Crear producto"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Actualiza los datos del producto."
              : "Completa los datos para registrar un nuevo producto."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
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
                    <Input placeholder="SKU-001" {...field} />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoriaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Sin categoría</SelectItem>
                        {(categorias ?? []).map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
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
                name="unidadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Sin unidad</SelectItem>
                        {(unidades ?? []).map((unidad) => (
                          <SelectItem key={unidad.id} value={unidad.id}>
                            {unidad.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="costo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
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
            {isEditing ? "Guardar cambios" : "Crear producto"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
