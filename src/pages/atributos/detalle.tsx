import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconArrowLeft, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import {
  useAtributo,
  useAtributoValores,
  useAddAtributoValor,
  useRemoveAtributoValor,
  useRestoreAtributoValor,
} from "@/hooks/useAtributos"
import { ApiError } from "@/lib/api"
import type { AtributoValor } from "@/types/atributo"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
  codigo: z.string().min(1, "El código es obligatorio"),
  valor: z.string().min(1, "El valor es obligatorio"),
  orden: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export default function AtributoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const atributoId = id ?? ""
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: atributo } = useAtributo(atributoId)
  const { data: valores, isLoading } = useAtributoValores(atributoId)
  const addValor = useAddAtributoValor(atributoId)
  const removeValor = useRemoveAtributoValor(atributoId)
  const restoreValor = useRestoreAtributoValor(atributoId)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { codigo: "", valor: "", orden: "0" },
  })

  function onSubmit(values: FormValues) {
    addValor.mutate(
      { codigo: values.codigo, valor: values.valor, orden: Number(values.orden) },
      {
        onSuccess: () => {
          toast.success("Valor agregado")
          form.reset({ codigo: "", valor: "", orden: "0" })
          setDialogOpen(false)
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo agregar el valor"),
      }
    )
  }

  function handleRemove(valorId: string) {
    removeValor.mutate(valorId, {
      onSuccess: () => toast.success("Valor desactivado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el valor"),
    })
  }

  function handleRestore(valorId: string) {
    restoreValor.mutate(valorId, {
      onSuccess: () => toast.success("Valor restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el valor"),
    })
  }

  const columns: ColumnDef<AtributoValor>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "valor", header: "Valor" },
    { accessorKey: "orden", header: () => <div className="text-right">Orden</div>, cell: ({ row }) => <div className="text-right">{row.original.orden}</div> },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const valor = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {valor.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => handleRemove(valor.id)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(valor.id)}>Restaurar</DropdownMenuItem>
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
        title={atributo ? `Valores de ${atributo.nombre}` : "Valores del atributo"}
        description="Lista de valores posibles para este atributo de tipo opción."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/atributos">
                <IconArrowLeft />
                Volver
              </Link>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus />
                  Agregar Valor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar valor</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="ROJO" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="valor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input placeholder="Rojo" {...field} />
                          </FormControl>
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
                    <DialogFooter>
                      <Button type="submit" disabled={addValor.isPending}>
                        {addValor.isPending && <Loader2 className="animate-spin" />}
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
        <CrudTable columns={columns} data={valores ?? []} isLoading={isLoading} emptyMessage="Sin valores registrados." />
      </div>
    </div>
  )
}
