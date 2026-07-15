import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconArrowLeft } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAjustarStock, useRegistrarMerma } from "@/hooks/useInventario"
import { useProductos } from "@/hooks/useProductos"
import { useSucursal } from "@/context/sucursal-provider"
import { useSucursalDefault } from "@/hooks/useSucursalDefault"
import { ApiError } from "@/lib/api"
import { positiveNumberString } from "@/lib/validation"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ajusteSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  productoVarianteId: z.string().optional(),
  sucursalId: z.string().min(1, "Selecciona una sucursal"),
  tipo: z.enum(["entrada", "salida"]),
  cantidad: positiveNumberString,
  motivo: z.string().optional(),
})

type AjusteValues = z.infer<typeof ajusteSchema>

function AjusteForm() {
  const { data: productos } = useProductos({ activo: "true" })
  const { sucursales } = useSucursal()
  const ajustarStock = useAjustarStock()

  const form = useForm<AjusteValues>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: { productoId: "", productoVarianteId: "", sucursalId: "", tipo: "entrada", cantidad: "1", motivo: "" },
  })
  useSucursalDefault(form, "sucursalId")

  function onSubmit(values: AjusteValues) {
    ajustarStock.mutate(
      {
        productoId: values.productoId,
        productoVarianteId: values.productoVarianteId || undefined,
        sucursalId: values.sucursalId,
        tipo: values.tipo,
        cantidad: Number(values.cantidad),
        motivo: values.motivo || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Ajuste registrado")
          form.reset({ productoId: "", productoVarianteId: "", sucursalId: "", tipo: "entrada", cantidad: "1", motivo: "" })
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo registrar el ajuste"),
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProductoVariantePicker
          productos={productos ?? []}
          productoId={form.watch("productoId")}
          productoVarianteId={form.watch("productoVarianteId")}
          onProductoChange={(value) => form.setValue("productoId", value, { shouldValidate: true })}
          onVarianteChange={(value) => form.setValue("productoVarianteId", value)}
        />
        <FormField
          control={form.control}
          name="sucursalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sucursal</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar sucursal" />
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
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cantidad"
          render={({ field }) => (
            <FormItem>
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
          name="motivo"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Motivo</FormLabel>
              <FormControl>
                <Textarea placeholder="Motivo del ajuste" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={ajustarStock.isPending}>
            {ajustarStock.isPending && <Loader2 className="animate-spin" />}
            Registrar ajuste
          </Button>
        </div>
      </form>
    </Form>
  )
}

const mermaSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  productoVarianteId: z.string().optional(),
  sucursalId: z.string().min(1, "Selecciona una sucursal"),
  cantidad: positiveNumberString,
  motivo: z.string().min(1, "El motivo es obligatorio"),
})

type MermaValues = z.infer<typeof mermaSchema>

function MermaForm() {
  const { data: productos } = useProductos({ activo: "true" })
  const { sucursales } = useSucursal()
  const registrarMerma = useRegistrarMerma()

  const form = useForm<MermaValues>({
    resolver: zodResolver(mermaSchema),
    defaultValues: { productoId: "", productoVarianteId: "", sucursalId: "", cantidad: "1", motivo: "" },
  })
  useSucursalDefault(form, "sucursalId")

  function onSubmit(values: MermaValues) {
    registrarMerma.mutate(
      {
        productoId: values.productoId,
        productoVarianteId: values.productoVarianteId || undefined,
        sucursalId: values.sucursalId,
        cantidad: Number(values.cantidad),
        motivo: values.motivo,
      },
      {
        onSuccess: () => {
          toast.success("Merma registrada")
          form.reset({ productoId: "", productoVarianteId: "", sucursalId: "", cantidad: "1", motivo: "" })
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo registrar la merma"),
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProductoVariantePicker
          productos={productos ?? []}
          productoId={form.watch("productoId")}
          productoVarianteId={form.watch("productoVarianteId")}
          onProductoChange={(value) => form.setValue("productoId", value, { shouldValidate: true })}
          onVarianteChange={(value) => form.setValue("productoVarianteId", value)}
        />
        <FormField
          control={form.control}
          name="sucursalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sucursal</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar sucursal" />
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
          name="cantidad"
          render={({ field }) => (
            <FormItem>
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
          name="motivo"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Motivo</FormLabel>
              <FormControl>
                <Textarea placeholder="Motivo de la merma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="sm:col-span-2">
          <Button type="submit" variant="destructive" disabled={registrarMerma.isPending}>
            {registrarMerma.isPending && <Loader2 className="animate-spin" />}
            Registrar merma
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function AjustesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Ajustes de Inventario"
        description="Registra entradas, salidas y mermas manuales de stock."
        action={
          <Button variant="outline" asChild>
            <Link to="/inventario">
              <IconArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Movimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ajuste">
              <TabsList>
                <TabsTrigger value="ajuste">Ajuste</TabsTrigger>
                <TabsTrigger value="merma">Merma</TabsTrigger>
              </TabsList>
              <TabsContent value="ajuste" className="pt-4">
                <AjusteForm />
              </TabsContent>
              <TabsContent value="merma" className="pt-4">
                <MermaForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
