import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { Loader2, LogIn } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/context/auth-provider"
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

const formSchema = z.object({
  codigoOrganizacion: z.string().trim().min(1, "Ingresa el código de tu organización"),
  usuario: z.string().min(1, "Ingresa tu usuario"),
  contrasena: z.string().min(1, "Ingresa tu contraseña"),
})

type FormValues = z.infer<typeof formSchema>
const LAST_ORG_CODE_KEY = "last_organization_code"

function getLastOrganizationCode(): string {
  try {
    return localStorage.getItem(LAST_ORG_CODE_KEY) ?? ""
  } catch {
    return ""
  }
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoOrganizacion: getLastOrganizationCode(),
      usuario: "",
      contrasena: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true)
      await login(values.codigoOrganizacion, values.usuario, values.contrasena)
      try {
        localStorage.setItem(LAST_ORG_CODE_KEY, values.codigoOrganizacion)
      } catch {
        // El acceso sigue funcionando aunque el navegador bloquee localStorage.
      }
      navigate("/dashboard", { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo iniciar sesión"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_46%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_46%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />

      {/* Soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_35%),radial-gradient(circle_at_80%_70%,color-mix(in_oklch,var(--chart-2)_12%,transparent),transparent_30%)]" />

      <div className="relative w-full max-w-[430px]">
        {/* BRAND */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-white/40 bg-white/55 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
            <IconInnerShadowTop className="size-5 text-primary" />
          </div>
          <h1 className="text-[1.7rem] font-semibold tracking-tight">
            Stock Core
          </h1>
        </div>

        {/* LOGIN CARD */}
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/45 bg-white/60 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.14)] backdrop-blur-[28px] sm:p-7 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
          {/* top glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
          {/* soft glow */}
          <div className="pointer-events-none absolute -top-24 right-0 size-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="mb-6">
            <h2 className="text-2xl font-semibold sm:text-[1.6rem]">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder a tu inventario.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="codigoOrganizacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organización</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="organization"
                        placeholder="Código de tu organización"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="username"
                        placeholder="Ingresa tu usuario"
                        {...field}
                      />
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
                      <PasswordInput
                        autoComplete="current-password"
                        placeholder="Ingresa tu contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="mt-1 h-11 rounded-lg shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <LogIn />
                )}
                Iniciar sesión
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  )
}
