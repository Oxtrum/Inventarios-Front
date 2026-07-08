import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconArrowLeft } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  useConteo,
  useRegistrarConteoItems,
  useCerrarConteo,
  useAnularConteo,
} from "@/hooks/useConteos"
import { useSucursales } from "@/hooks/useSucursales"
import { useProductos } from "@/hooks/useProductos"
import { ApiError } from "@/lib/api"
import { numberString } from "@/lib/validation"
import { PageHeader } from "@/components/shared/PageHeader"
import { EstadoBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const formSchema = z.object({
  items: z.array(
    z.object({
      productoId: z.string(),
      cantidadContada: numberString,
    })
  ),
})

type FormValues = z.infer<typeof formSchema>

export default function ConteoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const conteoId = id ?? ""
  const [confirmingCerrar, setConfirmingCerrar] = useState(false)
  const [confirmingAnular, setConfirmingAnular] = useState(false)

  const { data: conteo, isLoading } = useConteo(conteoId)
  const { data: sucursales } = useSucursales()
  const { data: productos } = useProductos()
  const registrarItems = useRegistrarConteoItems(conteoId)
  const cerrarConteo = useCerrarConteo(conteoId)
  const anularConteo = useAnularConteo(conteoId)

  const nombrePorId = useMemo(() => {
    const sucursalMap = new Map((sucursales ?? []).map((s) => [s.id, s.nombre]))
    const productoMap = new Map((productos ?? []).map((p) => [p.id, p.nombre]))
    return { sucursalMap, productoMap }
  }, [sucursales, productos])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: [] },
  })

  const { fields } = useFieldArray({ control: form.control, name: "items" })

  useEffect(() => {
    if (!conteo) return
    form.reset({
      items: conteo.items.map((item) => ({
        productoId: item.productoId,
        cantidadContada: item.cantidadContada != null ? String(item.cantidadContada) : "",
      })),
    })
  }, [conteo, form])

  function onSubmit(values: FormValues) {
    const items = values.items
      .filter((item) => item.cantidadContada !== "")
      .map((item) => ({ productoId: item.productoId, cantidadContada: Number(item.cantidadContada) }))

    if (items.length === 0) {
      toast.error("Ingresa la cantidad contada de al menos un producto")
      return
    }

    registrarItems.mutate(
      { items },
      {
        onSuccess: () => toast.success("Cantidades registradas"),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo registrar el conteo"),
      }
    )
  }

  function confirmCerrar() {
    cerrarConteo.mutate(undefined, {
      onSuccess: () => {
        toast.success("Conteo cerrado")
        setConfirmingCerrar(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo cerrar el conteo"),
    })
  }

  function confirmAnular() {
    anularConteo.mutate(undefined, {
      onSuccess: () => {
        toast.success("Conteo anulado")
        setConfirmingAnular(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo anular el conteo"),
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:py-6 lg:px-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!conteo) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:py-6 lg:px-6">
        <p className="text-sm text-muted-foreground">No se encontró el conteo.</p>
      </div>
    )
  }

  const isAbierto = conteo.estado === "abierto"

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Detalle de Conteo"
        description={new Date(conteo.fechaCreacion).toLocaleString("es-ES")}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/conteos">
                <IconArrowLeft />
                Volver
              </Link>
            </Button>
            {isAbierto && (
              <>
                <Button variant="outline" onClick={() => setConfirmingCerrar(true)}>
                  Cerrar conteo
                </Button>
                <Button variant="destructive" onClick={() => setConfirmingAnular(true)}>
                  Anular
                </Button>
              </>
            )}
          </div>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Datos generales
              <EstadoBadge estado={conteo.estado} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Sucursal</p>
              <p className="font-medium">{nombrePorId.sucursalMap.get(conteo.sucursalId) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Observación</p>
              <p className="font-medium">{conteo.observacion ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad Teórica</TableHead>
                        <TableHead className="text-right">Cantidad Contada</TableHead>
                        <TableHead className="text-right">Diferencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((fieldItem, index) => {
                        const item = conteo.items[index]
                        return (
                          <TableRow key={fieldItem.id}>
                            <TableCell>{nombrePorId.productoMap.get(item.productoId) ?? item.productoId}</TableCell>
                            <TableCell className="text-right">{item.cantidadTeorica}</TableCell>
                            <TableCell className="text-right">
                              {isAbierto ? (
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.cantidadContada`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="number" step="0.01" className="ml-auto w-28 text-right" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ) : (
                                (item.cantidadContada ?? "—")
                              )}
                            </TableCell>
                            <TableCell className="text-right">{item.diferencia ?? "—"}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {isAbierto && (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={registrarItems.isPending}>
                      {registrarItems.isPending && <Loader2 className="animate-spin" />}
                      Guardar cantidades
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmingCerrar}
        onOpenChange={setConfirmingCerrar}
        title="¿Cerrar conteo?"
        description="Se generarán los ajustes de inventario según las diferencias encontradas."
        confirmLabel="Cerrar conteo"
        isLoading={cerrarConteo.isPending}
        onConfirm={confirmCerrar}
      />
      <ConfirmDialog
        open={confirmingAnular}
        onOpenChange={setConfirmingAnular}
        title="¿Anular conteo?"
        description="El conteo quedará anulado y no podrá registrarse ni cerrarse."
        confirmLabel="Anular"
        variant="destructive"
        isLoading={anularConteo.isPending}
        onConfirm={confirmAnular}
      />
    </div>
  )
}
