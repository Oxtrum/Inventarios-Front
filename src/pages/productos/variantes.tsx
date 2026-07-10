import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconAdjustments, IconArrowLeft, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useProducto } from "@/hooks/useProductos"
import { useAtributos, useAtributoValores } from "@/hooks/useAtributos"
import {
  useProductoVariantes,
  useCreateProductoVariante,
  useUpdateProductoVariante,
  useDeleteProductoVariante,
  useRestoreProductoVariante,
  useProductoAtributos,
  useSetProductoAtributo,
  useRemoveProductoAtributo,
  useVarianteAtributos,
  useSetVarianteAtributo,
  useRemoveVarianteAtributo,
} from "@/hooks/useProductoVariantes"
import { ApiError } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { numberString } from "@/lib/validation"
import type { Atributo } from "@/types/atributo"
import type { ProductoVariante, ProductoAtributoValor, SetAtributoValorInput } from "@/types/productoVariante"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function valorDisplay(valor: ProductoAtributoValor, atributoValores: Map<string, string>): string {
  if (valor.atributoValorId) return atributoValores.get(valor.atributoValorId) ?? "—"
  if (valor.valorTexto !== undefined) return valor.valorTexto
  if (valor.valorNumero !== undefined) return String(valor.valorNumero)
  if (valor.valorBooleano !== undefined) return valor.valorBooleano ? "Sí" : "No"
  if (valor.valorFecha !== undefined) return valor.valorFecha
  return "—"
}

const atributoValorSchema = z.object({
  atributoId: z.string().min(1, "Selecciona un atributo"),
  atributoValorId: z.string().optional(),
  valorTexto: z.string().optional(),
  valorNumero: numberString.optional(),
  valorBooleano: z.boolean().optional(),
  valorFecha: z.string().optional(),
})

type AtributoValorFormValues = z.infer<typeof atributoValorSchema>

interface AsignarAtributoDialogProps {
  atributosDisponibles: Atributo[]
  onSubmit: (data: SetAtributoValorInput) => void
  isSubmitting: boolean
}

function AsignarAtributoDialog({ atributosDisponibles, onSubmit, isSubmitting }: AsignarAtributoDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<AtributoValorFormValues>({
    resolver: zodResolver(atributoValorSchema),
    defaultValues: { atributoId: "", atributoValorId: "", valorTexto: "", valorNumero: "0", valorBooleano: false, valorFecha: "" },
  })
  const atributoId = form.watch("atributoId")
  const atributoSeleccionado = atributosDisponibles.find((a) => a.id === atributoId)
  const { data: atributoValores } = useAtributoValores(atributoSeleccionado?.tipoDato === "opcion" ? atributoId : "")

  function handleSubmit(values: AtributoValorFormValues) {
    const base = { atributoId: values.atributoId }
    let payload: SetAtributoValorInput
    switch (atributoSeleccionado?.tipoDato) {
      case "opcion":
        payload = { ...base, atributoValorId: values.atributoValorId || undefined }
        break
      case "numero":
        payload = { ...base, valorNumero: Number(values.valorNumero || 0) }
        break
      case "booleano":
        payload = { ...base, valorBooleano: !!values.valorBooleano }
        break
      case "fecha":
        payload = { ...base, valorFecha: values.valorFecha || undefined }
        break
      default:
        payload = { ...base, valorTexto: values.valorTexto || undefined }
    }
    onSubmit(payload)
    form.reset({ atributoId: "", atributoValorId: "", valorTexto: "", valorNumero: "0", valorBooleano: false, valorFecha: "" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={atributosDisponibles.length === 0}>
          <IconPlus />
          Agregar atributo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar atributo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="atributoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atributo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {atributosDisponibles.map((atributo) => (
                        <SelectItem key={atributo.id} value={atributo.id}>
                          {atributo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {atributoSeleccionado?.tipoDato === "opcion" && (
              <FormField
                control={form.control}
                name="atributoValorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(atributoValores ?? []).map((valor) => (
                          <SelectItem key={valor.id} value={valor.id}>
                            {valor.valor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {atributoSeleccionado?.tipoDato === "numero" && (
              <FormField
                control={form.control}
                name="valorNumero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {atributoSeleccionado?.tipoDato === "booleano" && (
              <FormField
                control={form.control}
                name="valorBooleano"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Valor</FormLabel>
                  </FormItem>
                )}
              />
            )}
            {atributoSeleccionado?.tipoDato === "fecha" && (
              <FormField
                control={form.control}
                name="valorFecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(!atributoSeleccionado || atributoSeleccionado.tipoDato === "texto") && (
              <FormField
                control={form.control}
                name="valorTexto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !atributoId}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Asignar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

const varianteFormSchema = z.object({
  codigoSku: z.string().min(1, "El SKU es obligatorio"),
  codigoBarras: z.string().optional(),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  costo: numberString,
  precio: numberString,
  esDefault: z.boolean(),
})

type VarianteFormValues = z.infer<typeof varianteFormSchema>

interface VarianteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoId: string
  variante?: ProductoVariante
}

function VarianteForm({ open, onOpenChange, productoId, variante }: VarianteFormProps) {
  const isEditing = !!variante
  const createVariante = useCreateProductoVariante(productoId)
  const updateVariante = useUpdateProductoVariante(productoId, variante?.id ?? "")

  const form = useForm<VarianteFormValues>({
    resolver: zodResolver(varianteFormSchema),
    defaultValues: { codigoSku: "", codigoBarras: "", nombre: "", costo: "0", precio: "0", esDefault: false },
  })

  useMemo(() => {
    if (!open) return
    form.reset({
      codigoSku: variante?.codigoSku ?? "",
      codigoBarras: variante?.codigoBarras ?? "",
      nombre: variante?.nombre ?? "",
      costo: String(variante?.costo ?? 0),
      precio: String(variante?.precio ?? 0),
      esDefault: variante?.esDefault ?? false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variante])

  const isSubmitting = createVariante.isPending || updateVariante.isPending

  function onSubmit(values: VarianteFormValues) {
    const payload = {
      codigoSku: values.codigoSku,
      codigoBarras: values.codigoBarras || undefined,
      nombre: values.nombre,
      costo: Number(values.costo || 0),
      precio: Number(values.precio || 0),
      esDefault: values.esDefault,
    }
    const mutation = isEditing ? updateVariante : createVariante
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Variante actualizada" : "Variante creada")
        onOpenChange(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo guardar la variante"),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar variante" : "Crear variante"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos de la variante." : "Completa los datos para crear una variante."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <FormField
              control={form.control}
              name="codigoSku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU-001-M-ROJO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigoBarras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Talla M / Rojo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <FormField
              control={form.control}
              name="esDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Variante por defecto</FormLabel>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear variante"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ProductoAtributosTab({ productoId }: { productoId: string }) {
  const { data: atributos } = useAtributos({ activo: "true" })
  const { data: asignados, isLoading } = useProductoAtributos(productoId)
  const setAtributo = useSetProductoAtributo(productoId)
  const removeAtributo = useRemoveProductoAtributo(productoId)

  const atributoPorId = useMemo(() => {
    const map = new Map<string, Atributo>()
    for (const atributo of atributos ?? []) map.set(atributo.id, atributo)
    return map
  }, [atributos])

  const atributoValorNombrePorId = useMemo(() => new Map<string, string>(), [])

  const asignadoIds = useMemo(() => new Set((asignados ?? []).map((a) => a.atributoId)), [asignados])
  const disponibles = (atributos ?? []).filter((atributo) => !asignadoIds.has(atributo.id))

  function handleAsignar(data: SetAtributoValorInput) {
    setAtributo.mutate(data, {
      onSuccess: () => toast.success("Atributo asignado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo asignar el atributo"),
    })
  }

  function handleRemove(atributoId: string) {
    removeAtributo.mutate(atributoId, {
      onSuccess: () => toast.success("Atributo removido"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo remover el atributo"),
    })
  }

  const columns: ColumnDef<ProductoAtributoValor>[] = [
    { id: "nombre", header: "Atributo", cell: ({ row }) => atributoPorId.get(row.original.atributoId)?.nombre ?? "—" },
    { id: "valor", header: "Valor", cell: ({ row }) => valorDisplay(row.original, atributoValorNombrePorId) },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <IconDotsVertical />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem variant="destructive" onClick={() => handleRemove(row.original.atributoId)}>
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AsignarAtributoDialog atributosDisponibles={disponibles} onSubmit={handleAsignar} isSubmitting={setAtributo.isPending} />
      </div>
      <CrudTable columns={columns} data={asignados ?? []} isLoading={isLoading} emptyMessage="Sin atributos asignados al producto." />
    </div>
  )
}

interface VarianteAtributosSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variante?: ProductoVariante
}

function VarianteAtributosSheet({ open, onOpenChange, variante }: VarianteAtributosSheetProps) {
  const varianteId = variante?.id ?? ""
  const { data: atributos } = useAtributos({ activo: "true" })
  const { data: asignados, isLoading } = useVarianteAtributos(varianteId)
  const setAtributo = useSetVarianteAtributo(varianteId)
  const removeAtributo = useRemoveVarianteAtributo(varianteId)

  const atributoPorId = useMemo(() => {
    const map = new Map<string, Atributo>()
    for (const atributo of atributos ?? []) map.set(atributo.id, atributo)
    return map
  }, [atributos])

  const atributoValorNombrePorId = useMemo(() => new Map<string, string>(), [])
  const asignadoIds = useMemo(() => new Set((asignados ?? []).map((a) => a.atributoId)), [asignados])
  const disponibles = (atributos ?? []).filter((atributo) => !asignadoIds.has(atributo.id))

  function handleAsignar(data: SetAtributoValorInput) {
    setAtributo.mutate(data, {
      onSuccess: () => toast.success("Atributo asignado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo asignar el atributo"),
    })
  }

  function handleRemove(atributoId: string) {
    removeAtributo.mutate(atributoId, {
      onSuccess: () => toast.success("Atributo removido"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo remover el atributo"),
    })
  }

  const columns: ColumnDef<ProductoAtributoValor>[] = [
    { id: "nombre", header: "Atributo", cell: ({ row }) => atributoPorId.get(row.original.atributoId)?.nombre ?? "—" },
    { id: "valor", header: "Valor", cell: ({ row }) => valorDisplay(row.original, atributoValorNombrePorId) },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <IconDotsVertical />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem variant="destructive" onClick={() => handleRemove(row.original.atributoId)}>
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{variante ? `Atributos de ${variante.nombre}` : "Atributos de la variante"}</SheetTitle>
          <SheetDescription>Valores de atributo que distinguen esta variante (talla, color, etc.).</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <div className="flex justify-end">
            <AsignarAtributoDialog atributosDisponibles={disponibles} onSubmit={handleAsignar} isSubmitting={setAtributo.isPending} />
          </div>
          <CrudTable columns={columns} data={asignados ?? []} isLoading={isLoading} emptyMessage="Sin atributos asignados a esta variante." />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function ProductoVariantesPage() {
  const { id } = useParams<{ id: string }>()
  const productoId = id ?? ""
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductoVariante | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<ProductoVariante | undefined>(undefined)
  const [atributosSheetTarget, setAtributosSheetTarget] = useState<ProductoVariante | undefined>(undefined)

  const { data: producto } = useProducto(productoId)
  const { data: variantes, isLoading } = useProductoVariantes(productoId)
  const deleteVariante = useDeleteProductoVariante(productoId)
  const restoreVariante = useRestoreProductoVariante(productoId)

  function handleRestore(variante: ProductoVariante) {
    restoreVariante.mutate(variante.id, {
      onSuccess: () => toast.success("Variante restaurada"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la variante"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteVariante.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Variante desactivada")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar la variante"),
    })
  }

  const columns: ColumnDef<ProductoVariante>[] = [
    { accessorKey: "codigoSku", header: "SKU" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "costo",
      header: () => <div className="text-right">Costo</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.costo)}</div>,
    },
    {
      accessorKey: "precio",
      header: () => <div className="text-right">Precio</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.precio)}</div>,
    },
    {
      accessorKey: "esDefault",
      header: "Default",
      cell: ({ row }) => (row.original.esDefault ? <Badge>Sí</Badge> : "—"),
    },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const variante = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(variante); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAtributosSheetTarget(variante)}>
                <IconAdjustments />
                Atributos
              </DropdownMenuItem>
              {variante.activo ? (
                <DropdownMenuItem
                  variant="destructive"
                  disabled={variante.esDefault}
                  onClick={() => setDeactivating(variante)}
                >
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(variante)}>Restaurar</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title={producto ? `Variantes de ${producto.nombre}` : "Variantes del producto"}
        description="Administra las variantes (SKU) y atributos de este producto."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/productos">
                <IconArrowLeft />
                Volver
              </Link>
            </Button>
            <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
              <IconPlus />
              Crear Variante
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Tabs defaultValue="variantes">
          <TabsList>
            <TabsTrigger value="variantes">Variantes</TabsTrigger>
            <TabsTrigger value="atributos">Atributos</TabsTrigger>
          </TabsList>
          <TabsContent value="variantes" className="pt-4">
            {(variantes ?? []).length === 0 && !isLoading ? (
              <EmptyState title="Sin variantes" description="Este producto todavía no tiene variantes adicionales." />
            ) : (
              <CrudTable columns={columns} data={variantes ?? []} isLoading={isLoading} emptyMessage="Sin variantes registradas." />
            )}
          </TabsContent>
          <TabsContent value="atributos" className="pt-4">
            <ProductoAtributosTab productoId={productoId} />
          </TabsContent>
        </Tabs>
      </div>

      <VarianteForm open={formOpen} onOpenChange={setFormOpen} productoId={productoId} variante={editing} />
      <VarianteAtributosSheet
        open={!!atributosSheetTarget}
        onOpenChange={(open) => !open && setAtributosSheetTarget(undefined)}
        variante={atributosSheetTarget}
      />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar variante?"
        description={`La variante "${deactivating?.nombre}" quedará marcada como inactiva.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteVariante.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
