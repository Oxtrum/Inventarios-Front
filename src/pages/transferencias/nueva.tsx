import { useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useSucursal } from "@/context/sucursal-provider"
import { useSucursalDefault } from "@/hooks/useSucursalDefault"
import { useProductos } from "@/hooks/useProductos"
import { useCreateTransferencia } from "@/hooks/useTransferencias"
import { ApiError } from "@/lib/api"
import { positiveNumberString } from "@/lib/validation"
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

const itemSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  productoVarianteId: z.string().optional(),
  cantidad: positiveNumberString,
})

const formSchema = z
  .object({
    sucursalOrigenId: z.string().min(1, "Selecciona la sucursal de origen"),
    sucursalDestinoId: z.string().min(1, "Selecciona la sucursal de destino"),
    numero: z.string().optional(),
    observacion: z.string().optional(),
    items: z.array(itemSchema).min(1, "Agrega al menos un producto"),
  })
  .refine((data) => data.sucursalOrigenId !== data.sucursalDestinoId, {
    message: "La sucursal de origen y destino deben ser diferentes",
    path: ["sucursalDestinoId"],
  })

type FormValues = z.infer<typeof formSchema>

export default function TransferenciaFormPage() {
  const navigate = useNavigate()
  const { sucursales } = useSucursal()
  const { data: productos } = useProductos({ activo: "true" })
  const createTransferencia = useCreateTransferencia()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sucursalOrigenId: "",
      sucursalDestinoId: "",
      numero: "",
      observacion: "",
      items: [{ productoId: "", productoVarianteId: "", cantidad: "1" }],
    },
  })
  // La sucursal de origen se pre-rellena con la activa del header; el destino se elige.
  useSucursalDefault(form, "sucursalOrigenId")

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  function onSubmit(values: FormValues) {
    createTransferencia.mutate(
      {
        sucursalOrigenId: values.sucursalOrigenId,
        sucursalDestinoId: values.sucursalDestinoId,
        numero: values.numero || undefined,
        observacion: values.observacion || undefined,
        items: values.items.map((item) => ({
          productoId: item.productoId,
          productoVarianteId: item.productoVarianteId || undefined,
          cantidad: Number(item.cantidad),
        })),
      },
      {
        onSuccess: (transferencia) => {
          toast.success("Transferencia registrada")
          navigate(`/transferencias/${transferencia.id}`)
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "No se pudo registrar la transferencia")
        },
      }
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader title="Nueva Transferencia" description="Traslada stock entre sucursales." />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos generales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="sucursalOrigenId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sucursal Origen</FormLabel>
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
                name="sucursalDestinoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sucursal Destino</FormLabel>
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
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="TRA-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observación</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observación opcional" {...field} />
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
              <Button type="button" variant="outline" size="sm" onClick={() => append({ productoId: "", productoVarianteId: "", cantidad: "1" })}>
                <IconPlus />
                Agregar item
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-12 sm:items-end">
                  <ProductoVariantePicker
                    productos={productos ?? []}
                    productoId={form.watch(`items.${index}.productoId`)}
                    productoVarianteId={form.watch(`items.${index}.productoVarianteId`)}
                    onProductoChange={(value) => form.setValue(`items.${index}.productoId`, value, { shouldValidate: true })}
                    onVarianteChange={(value) => form.setValue(`items.${index}.productoVarianteId`, value)}
                    className="grid grid-cols-1 gap-3 sm:col-span-8 sm:grid-cols-2"
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.cantidad`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-1">
                    <Button type="button" variant="ghost" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}>
                      <IconTrash />
                      <span className="sr-only">Eliminar item</span>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/transferencias")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTransferencia.isPending}>
              {createTransferencia.isPending && <Loader2 className="animate-spin" />}
              Registrar transferencia
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
