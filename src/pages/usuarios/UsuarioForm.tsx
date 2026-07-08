import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateUsuario } from "@/hooks/useUsuarios"
import { useRoles } from "@/hooks/useRoles"
import { ApiError } from "@/lib/api"
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

const formSchema = z.object({
  email: z.email("Correo inválido"),
  contrasena: z.string().min(8, "Debe tener al menos 8 caracteres"),
  rolId: z.string().min(1, "Selecciona un rol"),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface UsuarioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsuarioForm({ open, onOpenChange }: UsuarioFormProps) {
  const { data: roles } = useRoles()
  const createUsuario = useCreateUsuario()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", contrasena: "", rolId: "", nombres: "", apellidos: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({ email: "", contrasena: "", rolId: "", nombres: "", apellidos: "" })
  }, [open, form])

  function onSubmit(values: FormValues) {
    createUsuario.mutate(
      {
        email: values.email,
        contrasena: values.contrasena,
        rolId: values.rolId,
        nombres: values.nombres || undefined,
        apellidos: values.apellidos || undefined,
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
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={createUsuario.isPending}>
            {createUsuario.isPending && <Loader2 className="animate-spin" />}
            Crear usuario
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
