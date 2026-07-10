import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateAtributo, useUpdateAtributo } from "@/hooks/useAtributos"
import { ApiError } from "@/lib/api"
import type { Atributo } from "@/types/atributo"
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
import { Checkbox } from "@/components/ui/checkbox"
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

const formSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  tipoDato: z.enum(["texto", "numero", "booleano", "fecha", "opcion"]),
  esFiltrable: z.boolean(),
  esVariante: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface AtributoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  atributo?: Atributo
}

export function AtributoForm({ open, onOpenChange, atributo }: AtributoFormProps) {
  const isEditing = !!atributo
  const createAtributo = useCreateAtributo()
  const updateAtributo = useUpdateAtributo(atributo?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { codigo: "", nombre: "", tipoDato: "texto", esFiltrable: false, esVariante: false },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      codigo: atributo?.codigo ?? "",
      nombre: atributo?.nombre ?? "",
      tipoDato: atributo?.tipoDato ?? "texto",
      esFiltrable: atributo?.esFiltrable ?? false,
      esVariante: atributo?.esVariante ?? false,
    })
  }, [open, atributo, form])

  const isSubmitting = createAtributo.isPending || updateAtributo.isPending

  function onSubmit(values: FormValues) {
    const mutation = isEditing ? updateAtributo : createAtributo
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(isEditing ? "Atributo actualizado" : "Atributo creado")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el atributo")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar atributo" : "Crear atributo"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos del atributo." : "Completa los datos para crear un atributo."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="COLOR" {...field} />
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
                    <Input placeholder="Color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipoDato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Dato</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="texto">Texto</SelectItem>
                      <SelectItem value="numero">Número</SelectItem>
                      <SelectItem value="booleano">Booleano</SelectItem>
                      <SelectItem value="fecha">Fecha</SelectItem>
                      <SelectItem value="opcion">Opción (lista de valores)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="esFiltrable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Es filtrable en catálogo</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="esVariante"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Puede definir variantes</FormLabel>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear atributo"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
