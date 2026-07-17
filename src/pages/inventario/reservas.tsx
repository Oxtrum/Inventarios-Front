import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconArrowLeft, IconDotsVertical, IconPlus, IconTrash } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import {
  useReservas,
  useCrearReserva,
  useConfirmarReserva,
  useLiberarReserva,
  useExpirarReserva,
} from "@/hooks/useInventario"
import { useReservasResumen } from "@/hooks/useReportes"
import { useProductos } from "@/hooks/useProductos"
import { useSucursales } from "@/hooks/useSucursales"
import { useSucursal } from "@/context/sucursal-provider"
import { useSucursalDefault } from "@/hooks/useSucursalDefault"
import { ApiError } from "@/lib/api"
import { positiveNumberString } from "@/lib/validation"
import type { ReservaStock } from "@/types/inventario"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductoVariantePicker } from "@/components/shared/ProductoVariantePicker"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ChartErrorBoundary } from "@/components/shared/ChartErrorBoundary"
import { EstadoBadge } from "@/components/shared/StatusBadge"
import { ReservasResumenChart } from "@/components/reportes/reservas-resumen-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ALL = "__all__"

const itemSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  productoVarianteId: z.string().optional(),
  cantidad: positiveNumberString,
})

const formSchema = z.object({
  sucursalId: z.string().min(1, "Selecciona una sucursal"),
  referenciaExterna: z.string().optional(),
  minutosExpiracion: z.string().optional(),
  items: z.array(itemSchema).min(1, "Agrega al menos un producto"),
})

type FormValues = z.infer<typeof formSchema>

function NuevaReservaForm() {
  const { sucursales } = useSucursal()
  const { data: productos } = useProductos({ activo: "true" })
  const crearReserva = useCrearReserva()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sucursalId: "",
      referenciaExterna: "",
      minutosExpiracion: "",
      items: [{ productoId: "", productoVarianteId: "", cantidad: "1" }],
    },
  })
  useSucursalDefault(form, "sucursalId")

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  function onSubmit(values: FormValues) {
    crearReserva.mutate(
      {
        sucursalId: values.sucursalId,
        referenciaExterna: values.referenciaExterna || undefined,
        minutosExpiracion: values.minutosExpiracion ? Number(values.minutosExpiracion) : undefined,
        items: values.items.map((item) => ({
          productoId: item.productoId,
          productoVarianteId: item.productoVarianteId || undefined,
          cantidad: Number(item.cantidad),
        })),
      },
      {
        onSuccess: () => {
          toast.success("Reserva creada")
          form.reset({ sucursalId: "", referenciaExterna: "", minutosExpiracion: "", items: [{ productoId: "", productoVarianteId: "", cantidad: "1" }] })
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo crear la reserva"),
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            name="referenciaExterna"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia Externa</FormLabel>
                <FormControl>
                  <Input placeholder="ID de carrito/pedido eshop" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minutosExpiracion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minutos de Expiración</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="Por defecto del sistema" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-3">
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
                      <Input type="number" step="1" {...field} />
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
          {form.formState.errors.items?.root && (
            <p className="text-sm text-destructive">{form.formState.errors.items.root.message}</p>
          )}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => append({ productoId: "", productoVarianteId: "", cantidad: "1" })}>
            <IconPlus />
            Agregar item
          </Button>
        </div>

        <Button type="submit" disabled={crearReserva.isPending} className="self-start">
          {crearReserva.isPending && <Loader2 className="animate-spin" />}
          Crear reserva
        </Button>
      </form>
    </Form>
  )
}

type ReservaAction = { reserva: ReservaStock; tipo: "confirmar" | "liberar" | "expirar" }

export default function ReservasPage() {
  const [estado, setEstado] = useState(ALL)
  const [pendingAction, setPendingAction] = useState<ReservaAction | undefined>(undefined)
  const { sucursalId } = useSucursal()

  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: reservas, isLoading } = useReservas(estado !== ALL ? { estado } : undefined)
  const resumenFilters = useMemo(() => {
    const fechaHasta = new Date()
    fechaHasta.setDate(fechaHasta.getDate() + 1)
    fechaHasta.setHours(0, 0, 0, 0)
    const fechaDesde = new Date(fechaHasta)
    fechaDesde.setDate(fechaDesde.getDate() - 30)

    return {
      fechaDesde: fechaDesde.toISOString(),
      fechaHasta: fechaHasta.toISOString(),
      ...(sucursalId ? { sucursalId } : {}),
    }
  }, [sucursalId])
  const { data: reservasResumen, isLoading: isLoadingResumen } =
    useReservasResumen(resumenFilters)
  const confirmarReserva = useConfirmarReserva()
  const liberarReserva = useLiberarReserva()
  const expirarReserva = useExpirarReserva()

  const sucursalNombrePorId = useMemo(() => {
    const map = new Map<string, string>()
    for (const sucursal of sucursales ?? []) map.set(sucursal.id, sucursal.nombre)
    return map
  }, [sucursales])

  const actionMutation =
    pendingAction?.tipo === "confirmar" ? confirmarReserva : pendingAction?.tipo === "liberar" ? liberarReserva : expirarReserva

  const actionCopy: Record<ReservaAction["tipo"], { title: string; description: string; confirmLabel: string; success: string; error: string }> = {
    confirmar: {
      title: "¿Confirmar reserva?",
      description: "Se generarán movimientos de VENTA y el stock reservado pasará a salida definitiva.",
      confirmLabel: "Confirmar",
      success: "Reserva confirmada",
      error: "No se pudo confirmar la reserva",
    },
    liberar: {
      title: "¿Liberar reserva?",
      description: "El stock reservado volverá a estar disponible.",
      confirmLabel: "Liberar",
      success: "Reserva liberada",
      error: "No se pudo liberar la reserva",
    },
    expirar: {
      title: "¿Expirar reserva?",
      description: "La reserva se marcará como expirada y el stock quedará disponible.",
      confirmLabel: "Expirar",
      success: "Reserva expirada",
      error: "No se pudo expirar la reserva",
    },
  }

  function confirmAction() {
    if (!pendingAction) return
    const copy = actionCopy[pendingAction.tipo]
    actionMutation.mutate(pendingAction.reserva.id, {
      onSuccess: () => {
        toast.success(copy.success)
        setPendingAction(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : copy.error),
    })
  }

  const columns: ColumnDef<ReservaStock>[] = [
    {
      accessorKey: "sucursalId",
      header: "Sucursal",
      cell: ({ row }) => sucursalNombrePorId.get(row.original.sucursalId) ?? "—",
    },
    {
      accessorKey: "referenciaExterna",
      header: "Referencia",
      cell: ({ row }) => row.original.referenciaExterna ?? "—",
    },
    {
      id: "items",
      header: () => <div className="text-right">Items</div>,
      cell: ({ row }) => <div className="text-right">{row.original.items.length}</div>,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const reserva = row.original
        const vencida = reserva.estado === "activa" && new Date(reserva.fechaExpiracion) < new Date()
        return (
          <div className="flex items-center gap-2">
            <EstadoBadge estado={reserva.estado} />
            {vencida && <Badge variant="destructive">Por expirar</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "fechaExpiracion",
      header: "Expira",
      cell: ({ row }) => new Date(row.original.fechaExpiracion).toLocaleString("es-ES"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const reserva = row.original
        if (reserva.estado !== "activa") return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setPendingAction({ reserva, tipo: "confirmar" })}>Confirmar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPendingAction({ reserva, tipo: "liberar" })}>Liberar</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setPendingAction({ reserva, tipo: "expirar" })}>
                Expirar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Reservas de Stock"
        description="Una reserva aparta stock disponible sin sacarlo del inventario (para un carrito o pedido externo). Confirmar = genera una venta definitiva. Liberar / Expirar = cancela y devuelve el stock."
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
        <ChartErrorBoundary resetKey={sucursalId}>
          <ReservasResumenChart
            data={reservasResumen}
            isLoading={isLoadingResumen}
          />
        </ChartErrorBoundary>

        <Card>
          <CardHeader>
            <CardTitle>Nueva Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <NuevaReservaForm />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los estados</SelectItem>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="liberada">Liberada</SelectItem>
              <SelectItem value="expirada">Expirada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CrudTable columns={columns} data={reservas ?? []} isLoading={isLoading} emptyMessage="Sin reservas registradas." />
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(undefined)}
        title={pendingAction ? actionCopy[pendingAction.tipo].title : ""}
        description={pendingAction ? actionCopy[pendingAction.tipo].description : undefined}
        confirmLabel={pendingAction ? actionCopy[pendingAction.tipo].confirmLabel : undefined}
        variant={pendingAction?.tipo === "expirar" ? "destructive" : "default"}
        isLoading={actionMutation.isPending}
        onConfirm={confirmAction}
      />
    </div>
  )
}
