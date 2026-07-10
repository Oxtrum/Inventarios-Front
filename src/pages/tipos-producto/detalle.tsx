import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconArrowLeft, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import {
  useTipoProducto,
  useTipoProductoAtributos,
  useAddTipoProductoAtributo,
  useRemoveTipoProductoAtributo,
} from "@/hooks/useTiposProducto"
import { useAtributos } from "@/hooks/useAtributos"
import { ApiError } from "@/lib/api"
import type { TipoProductoAtributo } from "@/types/tipoProducto"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formSchema = z.object({
  atributoId: z.string().min(1, "Selecciona un atributo"),
  requerido: z.boolean(),
  defineVariante: z.boolean(),
  orden: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export default function TipoProductoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const tipoProductoId = id ?? ""
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: tipoProducto } = useTipoProducto(tipoProductoId)
  const { data: atributos } = useAtributos({ activo: "true" })
  const { data: asignados, isLoading } = useTipoProductoAtributos(tipoProductoId)
  const addAtributo = useAddTipoProductoAtributo(tipoProductoId)
  const removeAtributo = useRemoveTipoProductoAtributo(tipoProductoId)

  const atributoNombrePorId = useMemo(() => {
    const map = new Map<string, string>()
    for (const atributo of atributos ?? []) map.set(atributo.id, atributo.nombre)
    return map
  }, [atributos])

  const asignadoIds = useMemo(() => new Set((asignados ?? []).map((a) => a.atributoId)), [asignados])
  const disponibles = (atributos ?? []).filter((atributo) => !asignadoIds.has(atributo.id))

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { atributoId: "", requerido: false, defineVariante: false, orden: "0" },
  })

  function onSubmit(values: FormValues) {
    addAtributo.mutate(
      { atributoId: values.atributoId, requerido: values.requerido, defineVariante: values.defineVariante, orden: Number(values.orden) },
      {
        onSuccess: () => {
          toast.success("Atributo asignado")
          form.reset({ atributoId: "", requerido: false, defineVariante: false, orden: "0" })
          setDialogOpen(false)
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo asignar el atributo"),
      }
    )
  }

  function handleRemove(atributoId: string) {
    removeAtributo.mutate(atributoId, {
      onSuccess: () => toast.success("Atributo removido"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo remover el atributo"),
    })
  }

  const columns: ColumnDef<TipoProductoAtributo>[] = [
    { id: "nombre", header: "Atributo", cell: ({ row }) => atributoNombrePorId.get(row.original.atributoId) ?? "—" },
    { accessorKey: "requerido", header: "Requerido", cell: ({ row }) => (row.original.requerido ? "Sí" : "No") },
    { accessorKey: "defineVariante", header: "Define Variante", cell: ({ row }) => (row.original.defineVariante ? "Sí" : "No") },
    { accessorKey: "orden", header: () => <div className="text-right">Orden</div>, cell: ({ row }) => <div className="text-right">{row.original.orden}</div> },
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
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title={tipoProducto ? `Atributos de ${tipoProducto.nombre}` : "Atributos del tipo de producto"}
        description="Define qué atributos aplican a este tipo de producto y cuáles definen variantes."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/tipos-producto">
                <IconArrowLeft />
                Volver
              </Link>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={disponibles.length === 0}>
                  <IconPlus />
                  Agregar Atributo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar atributo</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                              {disponibles.map((atributo) => (
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
                    <FormField
                      control={form.control}
                      name="orden"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orden</FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="requerido"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Requerido</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="defineVariante"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Define variante</FormLabel>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={addAtributo.isPending}>
                        {addAtributo.isPending && <Loader2 className="animate-spin" />}
                        Agregar
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <CrudTable columns={columns} data={asignados ?? []} isLoading={isLoading} emptyMessage="Sin atributos asignados." />
      </div>
    </div>
  )
}
