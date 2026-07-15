import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useSucursal } from "@/context/sucursal-provider"
import { useSucursalDefault } from "@/hooks/useSucursalDefault"
import { useProveedores } from "@/hooks/useProveedores"
import { useProductos } from "@/hooks/useProductos"
import { useCompras } from "@/hooks/useCompras"
import { useCreateDevolucion } from "@/hooks/useDevoluciones"
import { ApiError } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { numberString, positiveNumberString } from "@/lib/validation"
import type { Producto } from "@/types/producto"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const NONE = "__none__"

const itemSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  productoVarianteId: z.string().optional(),
  cantidad: positiveNumberString,
  costoUnitario: numberString,
})

const formSchema = z.object({
  sucursalId: z.string().min(1, "Selecciona una sucursal"),
  proveedorId: z.string().min(1, "Selecciona un proveedor"),
  compraId: z.string().optional(),
  numero: z.string().optional(),
  motivo: z.string().optional(),
  items: z.array(itemSchema).min(1, "Agrega al menos un producto"),
})

type FormValues = z.infer<typeof formSchema>

export default function DevolucionFormPage() {
  const navigate = useNavigate()
  const { sucursales } = useSucursal()
  const { data: proveedores } = useProveedores({ activo: "true" })
  const { data: productos } = useProductos({ activo: "true" })
  const { data: compras } = useCompras()
  const createDevolucion = useCreateDevolucion()

  const productoPorId = useMemo(() => {
    const map = new Map<string, Producto>()
    for (const producto of productos ?? []) map.set(producto.id, producto)
    return map
  }, [productos])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sucursalId: "",
      proveedorId: "",
      compraId: NONE,
      numero: "",
      motivo: "",
      items: [{ productoId: "", productoVarianteId: "", cantidad: "1", costoUnitario: "0" }],
    },
  })
  useSucursalDefault(form, "sucursalId")

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const items = form.watch("items")
  const total = items.reduce((sum, item) => sum + (Number(item.cantidad) || 0) * (Number(item.costoUnitario) || 0), 0)

  function onSubmit(values: FormValues) {
    createDevolucion.mutate(
      {
        sucursalId: values.sucursalId,
        proveedorId: values.proveedorId,
        compraId: values.compraId === NONE ? undefined : values.compraId,
        numero: values.numero || undefined,
        motivo: values.motivo || undefined,
        items: values.items.map((item) => ({
          productoId: item.productoId,
          productoVarianteId: item.productoVarianteId || undefined,
          cantidad: Number(item.cantidad),
          costoUnitario: Number(item.costoUnitario),
        })),
      },
      {
        onSuccess: (devolucion) => {
          toast.success("Devolución registrada")
          navigate(`/devoluciones/${devolucion.id}`)
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "No se pudo registrar la devolución")
        },
      }
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader title="Nueva Devolución" description="Registra una devolución de mercadería a un proveedor." />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos generales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                name="proveedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(proveedores ?? []).map((proveedor) => (
                          <SelectItem key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre}
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
                name="compraId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compra asociada</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Sin compra asociada</SelectItem>
                        {(compras ?? []).map((compra) => (
                          <SelectItem key={compra.id} value={compra.id}>
                            {compra.numero ?? compra.id.slice(0, 8)}
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
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="DEV-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motivo"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Motivo de la devolución" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productoId: "", productoVarianteId: "", cantidad: "1", costoUnitario: "0" })}
              >
                <IconPlus />
                Agregar item
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {fields.map((fieldItem, index) => {
                const item = items[index]
                const subtotal = (Number(item?.cantidad) || 0) * (Number(item?.costoUnitario) || 0)
                return (
                  <div key={fieldItem.id} className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-12 sm:items-end">
                    <ProductoVariantePicker
                      productos={productos ?? []}
                      productoId={form.watch(`items.${index}.productoId`)}
                      productoVarianteId={form.watch(`items.${index}.productoVarianteId`)}
                      onProductoChange={(value) => {
                        form.setValue(`items.${index}.productoId`, value, { shouldValidate: true })
                        const producto = productoPorId.get(value)
                        if (producto) form.setValue(`items.${index}.costoUnitario`, String(producto.costo))
                      }}
                      onVarianteChange={(value) => form.setValue(`items.${index}.productoVarianteId`, value)}
                      className="grid grid-cols-1 gap-3 sm:col-span-5 sm:grid-cols-2"
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.cantidad`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.costoUnitario`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Costo Unitario</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Subtotal</p>
                      <p className="font-medium">{formatCurrency(subtotal)}</p>
                    </div>
                    <div className="sm:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <IconTrash />
                        <span className="sr-only">Eliminar item</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/devoluciones")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createDevolucion.isPending}>
              {createDevolucion.isPending && <Loader2 className="animate-spin" />}
              Registrar devolución
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
