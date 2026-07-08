import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useResetUsuarioPassword } from "@/hooks/useUsuarios"
import { ApiError } from "@/lib/api"
import type { Usuario } from "@/types/usuario"
import { Button } from "@/components/ui/button"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { PasswordInput } from "@/components/password-input"

const formSchema = z.object({
  contrasena: z.string().min(8, "Debe tener al menos 8 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

interface ChangePasswordDialogProps {
  usuario?: Usuario
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ usuario, onOpenChange }: ChangePasswordDialogProps) {
  const resetPassword = useResetUsuarioPassword()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { contrasena: "" },
  })

  function onSubmit(values: FormValues) {
    if (!usuario) return
    resetPassword.mutate(
      { id: usuario.id, data: { contrasena: values.contrasena } },
      {
        onSuccess: () => {
          toast.success("Contraseña actualizada")
          form.reset()
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar la contraseña")
        },
      }
    )
  }

  return (
    <Dialog
      open={!!usuario}
      onOpenChange={(open) => {
        if (!open) form.reset()
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>Define una nueva contraseña para {usuario?.email}.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="contrasena"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={resetPassword.isPending}>
                {resetPassword.isPending && <Loader2 className="animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
