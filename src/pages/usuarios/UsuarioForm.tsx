import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateUsuario } from "@/hooks/useUsuarios"
import { useRoles } from "@/hooks/useRoles"
import { useSucursales } from "@/hooks/useSucursales"
import { ApiError } from "@/lib/api"
import type { UpdateUsuarioAlcanceInput } from "@/types/usuario"
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
import { PasswordInput } from "@/components/password-input"
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
import { UsuarioAlcanceFields } from "./UsuarioAlcanceFields"

const formSchema = z.object({
  email: z.email("Correo inválido"),
  contrasena: z.string().min(8, "Debe tener al menos 8 caracteres"),
  rolId: z.string().min(1, "Selecciona un rol"),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  alcanceDatos: z.enum(["organizacion", "sucursales"]),
  sucursalIds: z.array(z.string()),
  sucursalPrincipalId: z.string().optional(),
}).superRefine((value, context) => {
  if (value.alcanceDatos !== "sucursales") return
  if (value.sucursalIds.length === 0) {
    context.addIssue({ code: "custom", path: ["sucursalIds"], message: "Selecciona al menos una sucursal" })
  }
  if (!value.sucursalPrincipalId || !value.sucursalIds.includes(value.sucursalPrincipalId)) {
    context.addIssue({ code: "custom", path: ["sucursalPrincipalId"], message: "Selecciona una sucursal principal válida" })
  }
})

type FormValues = z.infer<typeof formSchema>

interface UsuarioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsuarioForm({ open, onOpenChange }: UsuarioFormProps) {
  const { data: roles } = useRoles()
  const branches = useSucursales(undefined, { enabled: open })
  const createUsuario = useCreateUsuario()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      contrasena: "",
      rolId: "",
      nombres: "",
      apellidos: "",
      alcanceDatos: "organizacion",
      sucursalIds: [],
      sucursalPrincipalId: undefined,
    },
  })

  const alcanceValue: UpdateUsuarioAlcanceInput = {
    alcanceDatos: useWatch({ control: form.control, name: "alcanceDatos" }),
    sucursalIds: useWatch({ control: form.control, name: "sucursalIds" }),
    sucursalPrincipalId: useWatch({ control: form.control, name: "sucursalPrincipalId" }),
  }

  useEffect(() => {
    if (!open) return
    form.reset({
      email: "",
      contrasena: "",
      rolId: "",
      nombres: "",
      apellidos: "",
      alcanceDatos: "organizacion",
      sucursalIds: [],
      sucursalPrincipalId: undefined,
    })
  }, [open, form])

  function onSubmit(values: FormValues) {
    createUsuario.mutate(
      {
        email: values.email,
        contrasena: values.contrasena,
        rolId: values.rolId,
        nombres: values.nombres || undefined,
        apellidos: values.apellidos || undefined,
        alcanceDatos: values.alcanceDatos,
        sucursalIds: values.alcanceDatos === "sucursales" ? values.sucursalIds : [],
        sucursalPrincipalId: values.alcanceDatos === "sucursales" ? values.sucursalPrincipalId : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Usuario creado")
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "No se pudo crear el usuario")
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Crear usuario</SheetTitle>
          <SheetDescription>Completa los datos para invitar a un nuevo usuario.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contrasena"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(roles ?? []).map((rol) => (
                        <SelectItem key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="border-t pt-4">
              <UsuarioAlcanceFields
                value={alcanceValue}
                onChange={(next) => {
                  form.setValue("alcanceDatos", next.alcanceDatos, { shouldValidate: true })
                  form.setValue("sucursalIds", next.sucursalIds, { shouldValidate: true })
                  form.setValue("sucursalPrincipalId", next.sucursalPrincipalId ?? undefined, { shouldValidate: true })
                }}
                sucursales={branches.data}
                isLoading={branches.isLoading}
                disabled={createUsuario.isPending}
              />
              {branches.isError && alcanceValue.alcanceDatos === "sucursales" && (
                <p className="mt-3 text-sm text-destructive">No se pudieron cargar las sucursales disponibles.</p>
              )}
            </div>
          </form>
        </Form>
        <SheetFooter>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createUsuario.isPending || (branches.isError && alcanceValue.alcanceDatos === "sucursales")}
          >
            {createUsuario.isPending && <Loader2 className="animate-spin" />}
            Crear usuario
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
