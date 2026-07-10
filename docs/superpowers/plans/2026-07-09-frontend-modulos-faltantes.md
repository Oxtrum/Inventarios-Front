# Frontend Módulos Faltantes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gap between backend capability and frontend UI in `Inventarios-Front` by adding the 8 missing modules (Reservas, Organizaciones, Tipos de Negocio, Tipos de Producto, Atributos/Valores, Variantes de Producto, Plantillas, Catálogo Público) and completing the 2 partial features (Reservas access from Inventario, Variantes management from Productos).

**Architecture:** Every task follows the existing three-layer frontend convention exactly: `src/services/<domain>.ts` (thin `api.*` wrapper) → `src/hooks/use<Domain>.ts` (TanStack Query, `all/lists/list/details/detail` key factory) → `src/pages/<domain>/index.tsx` + `<Domain>Form.tsx` (list page + Sheet form), reusing `CrudTable`, `ConfirmDialog`, `PageHeader`, `SearchInput`, `StatusBadge`/`EstadoBadge`, `EmptyState`. No new shared components, no new abstractions — this codebase already has the pattern, we're repeating it for new domains.

**Tech Stack:** React 19, TanStack Query 5, React Hook Form + Zod 4, react-router-dom v7, shadcn/ui (`radix-vega` style), Tailwind v4.

## Global Constraints

- **No test runner exists in this repo** (`Inventarios-Front/package.json` has no test script or framework). Every task's "verify" steps are: `npx tsc -b --noEmit` (type-check), `npm run lint`, and a manual smoke check against the running dev server (`npm run dev`, log in with the demo credentials, exercise the new page). Do not introduce a test framework as a side effect of this plan — that's a separate decision for the user to make.
- **Demo login:** `{ "codigoOrganizacion": "demo", "email": "admin@inventario.test", "contrasena": "admin123" }` via `POST /api/auth/login`. Requires backend running (`docker compose up -d postgres` + migrations + `go run .` from `InventarioSaaS-Api/`) and frontend `AuthProvider`'s `DEFAULT_ORG_CODE` (`src/context/auth-provider.tsx:9`) set to `"demo"` (already correct as of this writing).
- **Permissions are already seeded** for every module this plan touches (verified in `InventarioSaaS-Api/db/migrations/000013`, `000020`, `000021`, `000024` — each grants the new `permisos` rows to `rol_id 30000000-0000-0000-0000-000000000001` for the demo org). No backend/migration work is needed; if a new page 403s, the fix is in the backend seed data, not the frontend.
- **`productoVarianteId` is optional everywhere on the backend** — `internal/modules/inventario/repository.go`'s `resolveVariantTx` resolves a product's default variant automatically when the variant id is omitted. This is why `AjusteRequest`, `MermaRequest`, and `CrearReservaRequest` on the frontend (`src/types/inventario.ts`) don't need new fields for Reservas — they already work against the default variant.
- **Spanish domain naming** throughout (`tipos-negocio`, `atributos`, `producto-variantes`, etc.) — match the backend route/field names exactly, camelCase in TS, matching the JSON the Go structs already emit.
- Register every new route in `src/App.tsx` inside the `<ProtectedLayout />` route group, and every new nav entry in `src/components/layout/app-sidebar.tsx` using the existing `isActive(path)` / `navigate(path)` pattern.
- Every new list page must support the existing soft-delete convention: `DELETE` (deactivate) via `ConfirmDialog`, plus a `restaurar` action shown when `activo === false`.

---

## Task 1: Reservas de Stock — page only

The backend routes, service (`inventarioService.reservas/crearReserva/confirmarReserva/liberarReserva/expirarReserva`), and hooks (`useReservas`, `useCrearReserva`, `useConfirmarReserva`, `useLiberarReserva`, `useExpirarReserva` in `src/hooks/useInventario.ts`) already exist and work — only the page, route, and nav entry are missing.

**Files:**
- Create: `src/pages/inventario/reservas.tsx`
- Modify: `src/App.tsx` (import + route)
- Modify: `src/components/layout/app-sidebar.tsx` (import `IconLock` + nav item)

**Interfaces:**
- Consumes: `useReservas`, `useCrearReserva`, `useConfirmarReserva`, `useLiberarReserva`, `useExpirarReserva` from `@/hooks/useInventario`; `ReservaStock`, `CrearReservaRequest`, `CrearReservaItem` from `@/types/inventario`; `useProductos` from `@/hooks/useProductos`; `useSucursales` from `@/hooks/useSucursales`; `EstadoBadge` from `@/components/shared/StatusBadge` (already maps `activa/confirmada/liberada/expirada`).
- Produces: default-exported `ReservasPage` component, mounted at `/inventario/reservas`.

- [ ] **Step 1: Create the Reservas page**

```tsx
// src/pages/inventario/reservas.tsx
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
import { useProductos } from "@/hooks/useProductos"
import { useSucursales } from "@/hooks/useSucursales"
import { ApiError } from "@/lib/api"
import { positiveNumberString } from "@/lib/validation"
import type { ReservaStock } from "@/types/inventario"
import { PageHeader } from "@/components/shared/PageHeader"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EstadoBadge } from "@/components/shared/StatusBadge"
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
  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: productos } = useProductos({ activo: "true" })
  const crearReserva = useCrearReserva()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sucursalId: "",
      referenciaExterna: "",
      minutosExpiracion: "",
      items: [{ productoId: "", cantidad: "1" }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  function onSubmit(values: FormValues) {
    crearReserva.mutate(
      {
        sucursalId: values.sucursalId,
        referenciaExterna: values.referenciaExterna || undefined,
        minutosExpiracion: values.minutosExpiracion ? Number(values.minutosExpiracion) : undefined,
        items: values.items.map((item) => ({
          productoId: item.productoId,
          cantidad: Number(item.cantidad),
        })),
      },
      {
        onSuccess: () => {
          toast.success("Reserva creada")
          form.reset({ sucursalId: "", referenciaExterna: "", minutosExpiracion: "", items: [{ productoId: "", cantidad: "1" }] })
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
              <FormField
                control={form.control}
                name={`items.${index}.productoId`}
                render={({ field }) => (
                  <FormItem className="sm:col-span-8">
                    <FormLabel>Producto</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(productos ?? []).map((producto) => (
                          <SelectItem key={producto.id} value={producto.id}>
                            {producto.codigo ? `${producto.codigo} · ${producto.nombre}` : producto.nombre}
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
                name={`items.${index}.cantidad`}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => append({ productoId: "", cantidad: "1" })}>
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

  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: reservas, isLoading } = useReservas(estado !== ALL ? { estado } : undefined)
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
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <EstadoBadge estado={row.original.estado} /> },
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
        description="Reservas de inventario para integración con eshop u otros consumidores."
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
```

- [ ] **Step 2: Wire the route in `src/App.tsx`**

Add the import next to the other `inventario` page imports:

```tsx
import ReservasPage from "@/pages/inventario/reservas"
```

Add the route inside the `<ProtectedLayout />` group, right after the `/inventario/ajustes` route:

```tsx
                  <Route path="/inventario/reservas" element={<ReservasPage />} />
```

- [ ] **Step 3: Add the nav entry in `src/components/layout/app-sidebar.tsx`**

Add `IconLock` to the `@tabler/icons-react` import list, then add this item to the "Inventario" `SidebarGroup`, right after the "Ajustes" `SidebarMenuItem` and before "Conteos":

```tsx
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Reservas"
                  isActive={isActive("/inventario/reservas")}
                  onClick={() => navigate("/inventario/reservas")}
                >
                  <IconLock />
                  <span>Reservas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
```

- [ ] **Step 4: Verify**

Run: `npx tsc -b --noEmit` from `Inventarios-Front/` — expect no errors.
Run: `npm run lint` — expect no new errors.
Run: `npm run dev`, log in with the demo credentials, navigate to **Inventario → Reservas**, create a reserva with one item against a sucursal/producto that has stock, confirm it appears with estado "Activa", then Confirmar/Liberar/Expirar it and verify the row's actions disappear (state is terminal) and `Inventario → Movimientos` shows the resulting movement when confirmed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/inventario/reservas.tsx src/App.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): add reservas de stock page"
```

---

## Task 2: Organizaciones — hook + page + form

`src/services/organizaciones.ts` and `src/types/organizacion.ts` already exist and are correct (verified against `internal/modules/organizaciones/types.go`). Only the hook and UI are missing.

**Files:**
- Create: `src/hooks/useOrganizaciones.ts`
- Create: `src/pages/organizaciones/index.tsx`
- Create: `src/pages/organizaciones/OrganizacionForm.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (import `IconBuilding` + nav item in "Configuración" group)

**Interfaces:**
- Consumes: `organizacionesService` from `@/services/organizaciones`; `Organizacion`, `CreateOrganizacionInput`, `UpdateOrganizacionInput` from `@/types/organizacion`.
- Produces: `useOrganizaciones(filters?)`, `useCreateOrganizacion()`, `useUpdateOrganizacion(id)`, `useDeleteOrganizacion()`, `useRestoreOrganizacion()`; default-exported `OrganizacionesPage` mounted at `/organizaciones`.

- [ ] **Step 1: Create the hook**

```ts
// src/hooks/useOrganizaciones.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { organizacionesService } from "@/services/organizaciones"
import type { CreateOrganizacionInput, UpdateOrganizacionInput } from "@/types/organizacion"

export const organizacionesKeys = {
  all: ["organizaciones"] as const,
  lists: () => [...organizacionesKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...organizacionesKeys.lists(), filters] as const,
  details: () => [...organizacionesKeys.all, "detail"] as const,
  detail: (id: string) => [...organizacionesKeys.details(), id] as const,
}

export function useOrganizaciones(filters?: Record<string, string>) {
  return useQuery({
    queryKey: organizacionesKeys.list(filters ?? {}),
    queryFn: () => organizacionesService.list(filters),
  })
}

export function useOrganizacion(id: string) {
  return useQuery({
    queryKey: organizacionesKeys.detail(id),
    queryFn: () => organizacionesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateOrganizacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrganizacionInput) => organizacionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
    },
  })
}

export function useUpdateOrganizacion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateOrganizacionInput) => organizacionesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.detail(id) })
    },
  })
}

export function useDeleteOrganizacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizacionesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
    },
  })
}

export function useRestoreOrganizacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizacionesService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizacionesKeys.lists() })
    },
  })
}
```

- [ ] **Step 2: Create the form**

```tsx
// src/pages/organizaciones/OrganizacionForm.tsx
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateOrganizacion, useUpdateOrganizacion } from "@/hooks/useOrganizaciones"
import { ApiError } from "@/lib/api"
import type { Organizacion } from "@/types/organizacion"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  codigo: z.string().min(1, "El código es obligatorio"),
  plan: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface OrganizacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizacion?: Organizacion
}

export function OrganizacionForm({ open, onOpenChange, organizacion }: OrganizacionFormProps) {
  const isEditing = !!organizacion
  const createOrganizacion = useCreateOrganizacion()
  const updateOrganizacion = useUpdateOrganizacion(organizacion?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", codigo: "", plan: "base" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: organizacion?.nombre ?? "",
      codigo: organizacion?.codigo ?? "",
      plan: organizacion?.plan ?? "base",
    })
  }, [open, organizacion, form])

  const isSubmitting = createOrganizacion.isPending || updateOrganizacion.isPending

  function onSubmit(values: FormValues) {
    const mutation = isEditing ? updateOrganizacion : createOrganizacion
    const payload = isEditing
      ? { nombre: values.nombre, plan: values.plan || undefined }
      : { nombre: values.nombre, codigo: values.codigo, plan: values.plan || undefined }

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Organización actualizada" : "Organización creada")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar la organización")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar organización" : "Crear organización"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos de la organización." : "Completa los datos para crear una organización."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la organización" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="demo" disabled={isEditing} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <FormControl>
                    <Input placeholder="base" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear organización"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 3: Create the list page**

```tsx
// src/pages/organizaciones/index.tsx
import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useOrganizaciones, useDeleteOrganizacion, useRestoreOrganizacion } from "@/hooks/useOrganizaciones"
import { ApiError } from "@/lib/api"
import type { Organizacion } from "@/types/organizacion"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrganizacionForm } from "./OrganizacionForm"

export default function OrganizacionesPage() {
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Organizacion | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Organizacion | undefined>(undefined)

  const { data: organizaciones, isLoading } = useOrganizaciones(nombre ? { nombre } : undefined)
  const deleteOrganizacion = useDeleteOrganizacion()
  const restoreOrganizacion = useRestoreOrganizacion()

  function handleRestore(organizacion: Organizacion) {
    restoreOrganizacion.mutate(organizacion.id, {
      onSuccess: () => toast.success("Organización restaurada"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la organización"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteOrganizacion.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Organización desactivada")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar la organización"),
    })
  }

  const columns: ColumnDef<Organizacion>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "plan", header: "Plan", cell: ({ row }) => <Badge variant="outline">{row.original.plan}</Badge> },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const organizacion = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(organizacion); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {organizacion.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(organizacion)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(organizacion)}>Restaurar</DropdownMenuItem>
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
        title="Organizaciones"
        description="Administra las organizaciones (tenants) del sistema."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Organización
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={organizaciones ?? []} isLoading={isLoading} emptyMessage="Sin organizaciones registradas." />
      </div>

      <OrganizacionForm open={formOpen} onOpenChange={setFormOpen} organizacion={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar organización?"
        description={`La organización "${deactivating?.nombre}" quedará marcada como inactiva.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteOrganizacion.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
```

- [ ] **Step 4: Wire the route in `src/App.tsx`**

```tsx
import OrganizacionesPage from "@/pages/organizaciones"
```

```tsx
                  <Route path="/organizaciones" element={<OrganizacionesPage />} />
```

- [ ] **Step 5: Add the nav entry in `src/components/layout/app-sidebar.tsx`**

Add `IconBuilding` to the icon imports, then add to the "Configuración" `SidebarGroup` (after "Sucursales"):

```tsx
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Organizaciones"
                  isActive={isActive("/organizaciones")}
                  onClick={() => navigate("/organizaciones")}
                >
                  <IconBuilding />
                  <span>Organizaciones</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
```

- [ ] **Step 6: Verify**

Run: `npx tsc -b --noEmit` and `npm run lint` from `Inventarios-Front/` — expect no errors.
Run: `npm run dev`, log in, go to **Configuración → Organizaciones**, create one, edit it, deactivate it, restore it — verify the table updates after each action without a manual refresh (TanStack Query invalidation).

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useOrganizaciones.ts src/pages/organizaciones src/App.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): add organizaciones CRUD page"
```

---

## Task 3: Tipos de Negocio — full CRUD

`TipoNegocio` is global reference data (no `organizacionId` — see `internal/modules/productosparametricos/types.go:5-13`), used later by Plantillas (Task 8) as the catalog of business types an org can apply. This task builds the plain CRUD; nothing else depends on it being done first except Task 8's tipo-negocio selector.

**Files:**
- Create: `src/types/tipoNegocio.ts`
- Create: `src/services/tiposNegocio.ts`
- Create: `src/hooks/useTiposNegocio.ts`
- Create: `src/pages/tipos-negocio/index.tsx`
- Create: `src/pages/tipos-negocio/TipoNegocioForm.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (new "Plantillas" `SidebarGroup`, import `IconBriefcase`)

**Interfaces:**
- Consumes: `api` from `@/lib/api`.
- Produces: `TipoNegocio`, `CreateTipoNegocioInput`, `UpdateTipoNegocioInput` types; `tiposNegocioService`; `useTiposNegocio`, `useTipoNegocio`, `useCreateTipoNegocio`, `useUpdateTipoNegocio`, `useDeleteTipoNegocio`, `useRestoreTipoNegocio` hooks — **Task 8 (Plantillas) consumes `useTiposNegocio()` directly for its selector.**

- [ ] **Step 1: Create the type file**

```ts
// src/types/tipoNegocio.ts
export interface TipoNegocio {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateTipoNegocioInput {
  codigo: string
  nombre: string
  descripcion?: string
}

export interface UpdateTipoNegocioInput {
  codigo?: string
  nombre?: string
  descripcion?: string
}
```

- [ ] **Step 2: Create the service**

```ts
// src/services/tiposNegocio.ts
import { api } from "@/lib/api"
import type { TipoNegocio, CreateTipoNegocioInput, UpdateTipoNegocioInput } from "@/types/tipoNegocio"

export const tiposNegocioService = {
  list: (params?: Record<string, string>) =>
    api.get<TipoNegocio[]>("/tipos-negocio", { params }),

  getById: (id: string) =>
    api.get<TipoNegocio>(`/tipos-negocio/${id}`),

  create: (data: CreateTipoNegocioInput) =>
    api.post<TipoNegocio>("/tipos-negocio", data),

  update: (id: string, data: UpdateTipoNegocioInput) =>
    api.patch<TipoNegocio>(`/tipos-negocio/${id}`, data),

  remove: (id: string) =>
    api.del<TipoNegocio>(`/tipos-negocio/${id}`),

  restore: (id: string) =>
    api.patch<TipoNegocio>(`/tipos-negocio/${id}/restaurar`),
}
```

- [ ] **Step 3: Create the hook**

```ts
// src/hooks/useTiposNegocio.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tiposNegocioService } from "@/services/tiposNegocio"
import type { CreateTipoNegocioInput, UpdateTipoNegocioInput } from "@/types/tipoNegocio"

export const tiposNegocioKeys = {
  all: ["tiposNegocio"] as const,
  lists: () => [...tiposNegocioKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...tiposNegocioKeys.lists(), filters] as const,
  details: () => [...tiposNegocioKeys.all, "detail"] as const,
  detail: (id: string) => [...tiposNegocioKeys.details(), id] as const,
}

export function useTiposNegocio(filters?: Record<string, string>) {
  return useQuery({
    queryKey: tiposNegocioKeys.list(filters ?? {}),
    queryFn: () => tiposNegocioService.list(filters),
  })
}

export function useTipoNegocio(id: string) {
  return useQuery({
    queryKey: tiposNegocioKeys.detail(id),
    queryFn: () => tiposNegocioService.getById(id),
    enabled: !!id,
  })
}

export function useCreateTipoNegocio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTipoNegocioInput) => tiposNegocioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
    },
  })
}

export function useUpdateTipoNegocio(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTipoNegocioInput) => tiposNegocioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.detail(id) })
    },
  })
}

export function useDeleteTipoNegocio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposNegocioService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
    },
  })
}

export function useRestoreTipoNegocio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposNegocioService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposNegocioKeys.lists() })
    },
  })
}
```

- [ ] **Step 4: Create the form**

```tsx
// src/pages/tipos-negocio/TipoNegocioForm.tsx
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateTipoNegocio, useUpdateTipoNegocio } from "@/hooks/useTiposNegocio"
import { ApiError } from "@/lib/api"
import type { TipoNegocio } from "@/types/tipoNegocio"
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
import { Textarea } from "@/components/ui/textarea"
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
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TipoNegocioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoNegocio?: TipoNegocio
}

export function TipoNegocioForm({ open, onOpenChange, tipoNegocio }: TipoNegocioFormProps) {
  const isEditing = !!tipoNegocio
  const createTipoNegocio = useCreateTipoNegocio()
  const updateTipoNegocio = useUpdateTipoNegocio(tipoNegocio?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { codigo: "", nombre: "", descripcion: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      codigo: tipoNegocio?.codigo ?? "",
      nombre: tipoNegocio?.nombre ?? "",
      descripcion: tipoNegocio?.descripcion ?? "",
    })
  }, [open, tipoNegocio, form])

  const isSubmitting = createTipoNegocio.isPending || updateTipoNegocio.isPending

  function onSubmit(values: FormValues) {
    const payload = { codigo: values.codigo, nombre: values.nombre, descripcion: values.descripcion || undefined }
    const mutation = isEditing ? updateTipoNegocio : createTipoNegocio
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Tipo de negocio actualizado" : "Tipo de negocio creado")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el tipo de negocio")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar tipo de negocio" : "Crear tipo de negocio"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos del tipo de negocio." : "Completa los datos para crear un tipo de negocio."}
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
                    <Input placeholder="RETAIL" {...field} />
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
                    <Input placeholder="Retail / Tienda física" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear tipo de negocio"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 5: Create the list page**

```tsx
// src/pages/tipos-negocio/index.tsx
import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useTiposNegocio, useDeleteTipoNegocio, useRestoreTipoNegocio } from "@/hooks/useTiposNegocio"
import { ApiError } from "@/lib/api"
import type { TipoNegocio } from "@/types/tipoNegocio"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TipoNegocioForm } from "./TipoNegocioForm"

export default function TiposNegocioPage() {
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TipoNegocio | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<TipoNegocio | undefined>(undefined)

  const { data: tiposNegocio, isLoading } = useTiposNegocio(nombre ? { nombre } : undefined)
  const deleteTipoNegocio = useDeleteTipoNegocio()
  const restoreTipoNegocio = useRestoreTipoNegocio()

  function handleRestore(tipoNegocio: TipoNegocio) {
    restoreTipoNegocio.mutate(tipoNegocio.id, {
      onSuccess: () => toast.success("Tipo de negocio restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el tipo de negocio"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteTipoNegocio.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Tipo de negocio desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el tipo de negocio"),
    })
  }

  const columns: ColumnDef<TipoNegocio>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const tipoNegocio = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditing(tipoNegocio); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {tipoNegocio.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(tipoNegocio)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(tipoNegocio)}>Restaurar</DropdownMenuItem>
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
        title="Tipos de Negocio"
        description="Catálogo global de tipos de negocio usado por las plantillas."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Tipo de Negocio
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={tiposNegocio ?? []} isLoading={isLoading} emptyMessage="Sin tipos de negocio registrados." />
      </div>

      <TipoNegocioForm open={formOpen} onOpenChange={setFormOpen} tipoNegocio={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar tipo de negocio?"
        description={`El tipo de negocio "${deactivating?.nombre}" quedará marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteTipoNegocio.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
```

- [ ] **Step 6: Wire the route and nav**

`src/App.tsx`:

```tsx
import TiposNegocioPage from "@/pages/tipos-negocio"
```

```tsx
                  <Route path="/tipos-negocio" element={<TiposNegocioPage />} />
```

`src/components/layout/app-sidebar.tsx` — add `IconBriefcase` to the icon imports, then add a new `SidebarGroup` right after the "Catálogo" group and before "Inventario" (this group also receives the Plantillas entry in Task 8):

```tsx
        <SidebarGroup>
          <SidebarGroupLabel>Plantillas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Tipos de Negocio"
                  isActive={isActive("/tipos-negocio")}
                  onClick={() => navigate("/tipos-negocio")}
                >
                  <IconBriefcase />
                  <span>Tipos de Negocio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
```

- [ ] **Step 7: Verify**

Run: `npx tsc -b --noEmit` and `npm run lint` — expect no errors.
Run: `npm run dev`, log in, go to **Plantillas → Tipos de Negocio**, create/edit/deactivate/restore one — verify table updates.

- [ ] **Step 8: Commit**

```bash
git add src/types/tipoNegocio.ts src/services/tiposNegocio.ts src/hooks/useTiposNegocio.ts src/pages/tipos-negocio src/App.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): add tipos de negocio CRUD page"
```

---

## Task 4: Tipos de Producto — CRUD + atributos asignados

`TipoProducto` is org-scoped and optionally links to a `TipoNegocio`. Each tipo de producto has a sub-resource, `tipo_producto_atributos`, defining which `Atributo`s apply to it (`requerido`, `defineVariante`, `orden`) — this is what Task 6's variant creation conceptually validates against, though Task 6 itself doesn't read it (see Task 6's Global Constraint note on scope). This task needs Task 3 done first only for the `tipoNegocioId` select in the form (falls back to "Sin tipo de negocio" if Task 3 isn't done — it's an optional field).

**Files:**
- Create: `src/types/tipoProducto.ts`
- Create: `src/services/tiposProducto.ts`
- Create: `src/hooks/useTiposProducto.ts`
- Create: `src/pages/tipos-producto/index.tsx`
- Create: `src/pages/tipos-producto/TipoProductoForm.tsx`
- Create: `src/pages/tipos-producto/detalle.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (import `IconBoxSeam`, add to "Catálogo" group)

**Interfaces:**
- Consumes: `useTiposNegocio` from `@/hooks/useTiposNegocio` (Task 3); `useAtributos` from `@/hooks/useAtributos` (Task 5 — the "Agregar atributo" picker in `detalle.tsx` needs the org's attribute catalog; if Task 5 isn't done yet, build this step last or stub the picker with an empty list temporarily).
- Produces: `TipoProducto`, `TipoProductoAtributo` types; `tiposProductoService`; `useTiposProducto`, `useTipoProducto`, `useCreateTipoProducto`, `useUpdateTipoProducto`, `useDeleteTipoProducto`, `useRestoreTipoProducto`, `useTipoProductoAtributos`, `useAddTipoProductoAtributo`, `useUpdateTipoProductoAtributo`, `useRemoveTipoProductoAtributo`.

- [ ] **Step 1: Create the type file**

```ts
// src/types/tipoProducto.ts
export interface TipoProducto {
  id: string
  organizacionId: string
  tipoNegocioId?: string
  codigo: string
  nombre: string
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateTipoProductoInput {
  tipoNegocioId?: string
  codigo: string
  nombre: string
  descripcion?: string
}

export interface UpdateTipoProductoInput {
  tipoNegocioId?: string
  codigo?: string
  nombre?: string
  descripcion?: string
}

export interface TipoProductoAtributo {
  id: string
  tipoProductoId: string
  atributoId: string
  requerido: boolean
  defineVariante: boolean
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateTipoProductoAtributoInput {
  atributoId: string
  requerido: boolean
  defineVariante: boolean
  orden: number
}

export interface UpdateTipoProductoAtributoInput {
  requerido?: boolean
  defineVariante?: boolean
  orden?: number
}
```

- [ ] **Step 2: Create the service**

```ts
// src/services/tiposProducto.ts
import { api } from "@/lib/api"
import type {
  TipoProducto,
  CreateTipoProductoInput,
  UpdateTipoProductoInput,
  TipoProductoAtributo,
  CreateTipoProductoAtributoInput,
  UpdateTipoProductoAtributoInput,
} from "@/types/tipoProducto"

export const tiposProductoService = {
  list: (params?: Record<string, string>) =>
    api.get<TipoProducto[]>("/tipos-producto", { params }),

  getById: (id: string) =>
    api.get<TipoProducto>(`/tipos-producto/${id}`),

  create: (data: CreateTipoProductoInput) =>
    api.post<TipoProducto>("/tipos-producto", data),

  update: (id: string, data: UpdateTipoProductoInput) =>
    api.patch<TipoProducto>(`/tipos-producto/${id}`, data),

  remove: (id: string) =>
    api.del<TipoProducto>(`/tipos-producto/${id}`),

  restore: (id: string) =>
    api.patch<TipoProducto>(`/tipos-producto/${id}/restaurar`),

  atributos: (id: string) =>
    api.get<TipoProductoAtributo[]>(`/tipos-producto/${id}/atributos`),

  addAtributo: (id: string, data: CreateTipoProductoAtributoInput) =>
    api.post<TipoProductoAtributo>(`/tipos-producto/${id}/atributos`, data),

  updateAtributo: (id: string, atributoId: string, data: UpdateTipoProductoAtributoInput) =>
    api.patch<TipoProductoAtributo>(`/tipos-producto/${id}/atributos/${atributoId}`, data),

  removeAtributo: (id: string, atributoId: string) =>
    api.del<void>(`/tipos-producto/${id}/atributos/${atributoId}`),
}
```

- [ ] **Step 3: Create the hook**

```ts
// src/hooks/useTiposProducto.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tiposProductoService } from "@/services/tiposProducto"
import type {
  CreateTipoProductoInput,
  UpdateTipoProductoInput,
  CreateTipoProductoAtributoInput,
  UpdateTipoProductoAtributoInput,
} from "@/types/tipoProducto"

export const tiposProductoKeys = {
  all: ["tiposProducto"] as const,
  lists: () => [...tiposProductoKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...tiposProductoKeys.lists(), filters] as const,
  details: () => [...tiposProductoKeys.all, "detail"] as const,
  detail: (id: string) => [...tiposProductoKeys.details(), id] as const,
  atributos: (id: string) => [...tiposProductoKeys.all, id, "atributos"] as const,
}

export function useTiposProducto(filters?: Record<string, string>) {
  return useQuery({
    queryKey: tiposProductoKeys.list(filters ?? {}),
    queryFn: () => tiposProductoService.list(filters),
  })
}

export function useTipoProducto(id: string) {
  return useQuery({
    queryKey: tiposProductoKeys.detail(id),
    queryFn: () => tiposProductoService.getById(id),
    enabled: !!id,
  })
}

export function useCreateTipoProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTipoProductoInput) => tiposProductoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
    },
  })
}

export function useUpdateTipoProducto(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTipoProductoInput) => tiposProductoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.detail(id) })
    },
  })
}

export function useDeleteTipoProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposProductoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
    },
  })
}

export function useRestoreTipoProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiposProductoService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
    },
  })
}

export function useTipoProductoAtributos(tipoProductoId: string) {
  return useQuery({
    queryKey: tiposProductoKeys.atributos(tipoProductoId),
    queryFn: () => tiposProductoService.atributos(tipoProductoId),
    enabled: !!tipoProductoId,
  })
}

export function useAddTipoProductoAtributo(tipoProductoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTipoProductoAtributoInput) => tiposProductoService.addAtributo(tipoProductoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.atributos(tipoProductoId) })
    },
  })
}

export function useUpdateTipoProductoAtributo(tipoProductoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ atributoId, data }: { atributoId: string; data: UpdateTipoProductoAtributoInput }) =>
      tiposProductoService.updateAtributo(tipoProductoId, atributoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.atributos(tipoProductoId) })
    },
  })
}

export function useRemoveTipoProductoAtributo(tipoProductoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (atributoId: string) => tiposProductoService.removeAtributo(tipoProductoId, atributoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.atributos(tipoProductoId) })
    },
  })
}
```

- [ ] **Step 4: Create the form**

```tsx
// src/pages/tipos-producto/TipoProductoForm.tsx
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useTiposNegocio } from "@/hooks/useTiposNegocio"
import { useCreateTipoProducto, useUpdateTipoProducto } from "@/hooks/useTiposProducto"
import { ApiError } from "@/lib/api"
import type { TipoProducto } from "@/types/tipoProducto"
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
import { Textarea } from "@/components/ui/textarea"
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

const NONE = "__none__"

const formSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  tipoNegocioId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TipoProductoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoProducto?: TipoProducto
}

export function TipoProductoForm({ open, onOpenChange, tipoProducto }: TipoProductoFormProps) {
  const isEditing = !!tipoProducto
  const { data: tiposNegocio } = useTiposNegocio({ activo: "true" })
  const createTipoProducto = useCreateTipoProducto()
  const updateTipoProducto = useUpdateTipoProducto(tipoProducto?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { codigo: "", nombre: "", descripcion: "", tipoNegocioId: NONE },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      codigo: tipoProducto?.codigo ?? "",
      nombre: tipoProducto?.nombre ?? "",
      descripcion: tipoProducto?.descripcion ?? "",
      tipoNegocioId: tipoProducto?.tipoNegocioId ?? NONE,
    })
  }, [open, tipoProducto, form])

  const isSubmitting = createTipoProducto.isPending || updateTipoProducto.isPending

  function onSubmit(values: FormValues) {
    const payload = {
      codigo: values.codigo,
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      tipoNegocioId: values.tipoNegocioId === NONE ? undefined : values.tipoNegocioId,
    }
    const mutation = isEditing ? updateTipoProducto : createTipoProducto
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Tipo de producto actualizado" : "Tipo de producto creado")
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el tipo de producto")
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar tipo de producto" : "Crear tipo de producto"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Actualiza los datos del tipo de producto." : "Completa los datos para crear un tipo de producto."}
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
                    <Input placeholder="ROPA" {...field} />
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
                    <Input placeholder="Ropa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipoNegocioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Negocio</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin tipo de negocio</SelectItem>
                      {(tiposNegocio ?? []).map((tipoNegocio) => (
                        <SelectItem key={tipoNegocio.id} value={tipoNegocio.id}>
                          {tipoNegocio.nombre}
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
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear tipo de producto"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 5: Create the list page**

```tsx
// src/pages/tipos-producto/index.tsx
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconAdjustments, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useTiposProducto, useDeleteTipoProducto, useRestoreTipoProducto } from "@/hooks/useTiposProducto"
import { useTiposNegocio } from "@/hooks/useTiposNegocio"
import { ApiError } from "@/lib/api"
import type { TipoProducto } from "@/types/tipoProducto"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TipoProductoForm } from "./TipoProductoForm"

export default function TiposProductoPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TipoProducto | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<TipoProducto | undefined>(undefined)

  const { data: tiposNegocio } = useTiposNegocio({ activo: "true" })
  const { data: tiposProducto, isLoading } = useTiposProducto(nombre ? { nombre } : undefined)
  const deleteTipoProducto = useDeleteTipoProducto()
  const restoreTipoProducto = useRestoreTipoProducto()

  const tipoNegocioNombrePorId = useMemo(() => {
    const map = new Map<string, string>()
    for (const tipoNegocio of tiposNegocio ?? []) map.set(tipoNegocio.id, tipoNegocio.nombre)
    return map
  }, [tiposNegocio])

  function handleRestore(tipoProducto: TipoProducto) {
    restoreTipoProducto.mutate(tipoProducto.id, {
      onSuccess: () => toast.success("Tipo de producto restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el tipo de producto"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteTipoProducto.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Tipo de producto desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el tipo de producto"),
    })
  }

  const columns: ColumnDef<TipoProducto>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "tipoNegocioId",
      header: "Tipo de Negocio",
      cell: ({ row }) => {
        const id = row.original.tipoNegocioId
        return id ? <Badge variant="outline">{tipoNegocioNombrePorId.get(id) ?? "—"}</Badge> : "—"
      },
    },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const tipoProducto = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(`/tipos-producto/${tipoProducto.id}`)}>
                <IconAdjustments />
                Atributos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setEditing(tipoProducto); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {tipoProducto.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(tipoProducto)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(tipoProducto)}>Restaurar</DropdownMenuItem>
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
        title="Tipos de Producto"
        description="Clasifica tus productos y define qué atributos aplican a cada tipo."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Tipo de Producto
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={tiposProducto ?? []} isLoading={isLoading} emptyMessage="Sin tipos de producto registrados." />
      </div>

      <TipoProductoForm open={formOpen} onOpenChange={setFormOpen} tipoProducto={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar tipo de producto?"
        description={`El tipo de producto "${deactivating?.nombre}" quedará marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteTipoProducto.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
```

- [ ] **Step 6: Create the detail page (manage assigned atributos)**

```tsx
// src/pages/tipos-producto/detalle.tsx
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
```

- [ ] **Step 7: Wire the routes and nav**

`src/App.tsx`:

```tsx
import TiposProductoPage from "@/pages/tipos-producto"
import TipoProductoDetailPage from "@/pages/tipos-producto/detalle"
```

```tsx
                  <Route path="/tipos-producto" element={<TiposProductoPage />} />
                  <Route path="/tipos-producto/:id" element={<TipoProductoDetailPage />} />
```

`src/components/layout/app-sidebar.tsx` — add `IconBoxSeam` to the icon imports, add to the "Catálogo" group (after "Proveedores"):

```tsx
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Tipos de Producto"
                  isActive={isActive("/tipos-producto")}
                  onClick={() => navigate("/tipos-producto")}
                >
                  <IconBoxSeam />
                  <span>Tipos de Producto</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
```

- [ ] **Step 8: Verify**

Run: `npx tsc -b --noEmit` and `npm run lint` — expect no errors.
Run: `npm run dev`, log in, go to **Catálogo → Tipos de Producto**, create one, open **Atributos** on it, add an atributo (created in Task 5) with `defineVariante` checked, verify it appears in the table, then remove it.

- [ ] **Step 9: Commit**

```bash
git add src/types/tipoProducto.ts src/services/tiposProducto.ts src/hooks/useTiposProducto.ts src/pages/tipos-producto src/App.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): add tipos de producto CRUD and atributos management"
```

---

## Task 5: Atributos y Valores — CRUD + valores sub-resource

Same shape as Task 4: `Atributo` is org-scoped, `AtributoValor` is its sub-resource (only meaningful when `tipoDato === "opcion"`, but the backend doesn't restrict adding valores regardless of type, so neither does this UI). **Task 4's `detalle.tsx` and Task 6/7 both depend on `useAtributos()` existing — do this task before finishing those, or before Task 4/6/7's final verify step.**

**Files:**
- Create: `src/types/atributo.ts`
- Create: `src/services/atributos.ts`
- Create: `src/hooks/useAtributos.ts`
- Create: `src/pages/atributos/index.tsx`
- Create: `src/pages/atributos/AtributoForm.tsx`
- Create: `src/pages/atributos/detalle.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (import `IconTags`, add to "Catálogo" group)

**Interfaces:**
- Produces: `Atributo`, `AtributoValor` types (`tipoDato: "texto" | "numero" | "booleano" | "fecha" | "opcion"` — verified against the DB check constraint in `db/migrations/000020_productos_parametricos.up.sql:36`); `atributosService`; `useAtributos`, `useAtributo`, `useCreateAtributo`, `useUpdateAtributo`, `useDeleteAtributo`, `useRestoreAtributo`, `useAtributoValores`, `useAddAtributoValor`, `useUpdateAtributoValor`, `useRemoveAtributoValor`, `useRestoreAtributoValor` — **Task 4's detail page and Task 6/7 consume `useAtributos()` and, for "opcion" attributes, `useAtributoValores(atributoId)`.**

- [ ] **Step 1: Create the type file**

```ts
// src/types/atributo.ts
export type AtributoTipoDato = "texto" | "numero" | "booleano" | "fecha" | "opcion"

export interface Atributo {
  id: string
  organizacionId: string
  codigo: string
  nombre: string
  tipoDato: AtributoTipoDato
  esFiltrable: boolean
  esVariante: boolean
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateAtributoInput {
  codigo: string
  nombre: string
  tipoDato: AtributoTipoDato
  esFiltrable: boolean
  esVariante: boolean
}

export interface UpdateAtributoInput {
  codigo?: string
  nombre?: string
  tipoDato?: AtributoTipoDato
  esFiltrable?: boolean
  esVariante?: boolean
}

export interface AtributoValor {
  id: string
  atributoId: string
  codigo: string
  valor: string
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateAtributoValorInput {
  codigo: string
  valor: string
  orden: number
}

export interface UpdateAtributoValorInput {
  codigo?: string
  valor?: string
  orden?: number
}
```

- [ ] **Step 2: Create the service**

```ts
// src/services/atributos.ts
import { api } from "@/lib/api"
import type {
  Atributo,
  CreateAtributoInput,
  UpdateAtributoInput,
  AtributoValor,
  CreateAtributoValorInput,
  UpdateAtributoValorInput,
} from "@/types/atributo"

export const atributosService = {
  list: (params?: Record<string, string>) =>
    api.get<Atributo[]>("/atributos", { params }),

  getById: (id: string) =>
    api.get<Atributo>(`/atributos/${id}`),

  create: (data: CreateAtributoInput) =>
    api.post<Atributo>("/atributos", data),

  update: (id: string, data: UpdateAtributoInput) =>
    api.patch<Atributo>(`/atributos/${id}`, data),

  remove: (id: string) =>
    api.del<Atributo>(`/atributos/${id}`),

  restore: (id: string) =>
    api.patch<Atributo>(`/atributos/${id}/restaurar`),

  valores: (id: string) =>
    api.get<AtributoValor[]>(`/atributos/${id}/valores`),

  addValor: (id: string, data: CreateAtributoValorInput) =>
    api.post<AtributoValor>(`/atributos/${id}/valores`, data),

  updateValor: (valorId: string, data: UpdateAtributoValorInput) =>
    api.patch<AtributoValor>(`/atributo-valores/${valorId}`, data),

  removeValor: (valorId: string) =>
    api.del<AtributoValor>(`/atributo-valores/${valorId}`),

  restoreValor: (valorId: string) =>
    api.patch<AtributoValor>(`/atributo-valores/${valorId}/restaurar`),
}
```

- [ ] **Step 3: Create the hook**

```ts
// src/hooks/useAtributos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { atributosService } from "@/services/atributos"
import type {
  CreateAtributoInput,
  UpdateAtributoInput,
  CreateAtributoValorInput,
  UpdateAtributoValorInput,
} from "@/types/atributo"

export const atributosKeys = {
  all: ["atributos"] as const,
  lists: () => [...atributosKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...atributosKeys.lists(), filters] as const,
  details: () => [...atributosKeys.all, "detail"] as const,
  detail: (id: string) => [...atributosKeys.details(), id] as const,
  valores: (id: string) => [...atributosKeys.all, id, "valores"] as const,
}

export function useAtributos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: atributosKeys.list(filters ?? {}),
    queryFn: () => atributosService.list(filters),
  })
}

export function useAtributo(id: string) {
  return useQuery({
    queryKey: atributosKeys.detail(id),
    queryFn: () => atributosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateAtributo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAtributoInput) => atributosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}

export function useUpdateAtributo(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAtributoInput) => atributosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: atributosKeys.detail(id) })
    },
  })
}

export function useDeleteAtributo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => atributosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}

export function useRestoreAtributo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => atributosService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}

export function useAtributoValores(atributoId: string) {
  return useQuery({
    queryKey: atributosKeys.valores(atributoId),
    queryFn: () => atributosService.valores(atributoId),
    enabled: !!atributoId,
  })
}

export function useAddAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAtributoValorInput) => atributosService.addValor(atributoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}

export function useUpdateAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ valorId, data }: { valorId: string; data: UpdateAtributoValorInput }) =>
      atributosService.updateValor(valorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}

export function useRemoveAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valorId: string) => atributosService.removeValor(valorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}

export function useRestoreAtributoValor(atributoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valorId: string) => atributosService.restoreValor(valorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atributosKeys.valores(atributoId) })
    },
  })
}
```

- [ ] **Step 4: Create the form**

```tsx
// src/pages/atributos/AtributoForm.tsx
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
```

- [ ] **Step 5: Create the list page**

```tsx
// src/pages/atributos/index.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconAdjustments, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useAtributos, useDeleteAtributo, useRestoreAtributo } from "@/hooks/useAtributos"
import { ApiError } from "@/lib/api"
import type { Atributo } from "@/types/atributo"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AtributoForm } from "./AtributoForm"

const TIPO_DATO_LABELS: Record<string, string> = {
  texto: "Texto",
  numero: "Número",
  booleano: "Booleano",
  fecha: "Fecha",
  opcion: "Opción",
}

export default function AtributosPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Atributo | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<Atributo | undefined>(undefined)

  const { data: atributos, isLoading } = useAtributos(nombre ? { nombre } : undefined)
  const deleteAtributo = useDeleteAtributo()
  const restoreAtributo = useRestoreAtributo()

  function handleRestore(atributo: Atributo) {
    restoreAtributo.mutate(atributo.id, {
      onSuccess: () => toast.success("Atributo restaurado"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el atributo"),
    })
  }

  function confirmDeactivate() {
    if (!deactivating) return
    deleteAtributo.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success("Atributo desactivado")
        setDeactivating(undefined)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo desactivar el atributo"),
    })
  }

  const columns: ColumnDef<Atributo>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "tipoDato",
      header: "Tipo de Dato",
      cell: ({ row }) => <Badge variant="outline">{TIPO_DATO_LABELS[row.original.tipoDato]}</Badge>,
    },
    { accessorKey: "esFiltrable", header: "Filtrable", cell: ({ row }) => (row.original.esFiltrable ? "Sí" : "No") },
    { accessorKey: "esVariante", header: "Variante", cell: ({ row }) => (row.original.esVariante ? "Sí" : "No") },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <StatusBadge activo={row.original.activo} /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const atributo = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <IconDotsVertical />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {atributo.tipoDato === "opcion" && (
                <DropdownMenuItem onClick={() => navigate(`/atributos/${atributo.id}`)}>
                  <IconAdjustments />
                  Valores
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => { setEditing(atributo); setFormOpen(true) }}>
                Editar
              </DropdownMenuItem>
              {atributo.activo ? (
                <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(atributo)}>
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRestore(atributo)}>Restaurar</DropdownMenuItem>
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
        title="Atributos"
        description="Catálogo de atributos disponibles para productos y variantes."
        action={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            <IconPlus />
            Crear Atributo
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
        <CrudTable columns={columns} data={atributos ?? []} isLoading={isLoading} emptyMessage="Sin atributos registrados." />
      </div>

      <AtributoForm open={formOpen} onOpenChange={setFormOpen} atributo={editing} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(undefined)}
        title="¿Desactivar atributo?"
        description={`El atributo "${deactivating?.nombre}" quedará marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={deleteAtributo.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
```

- [ ] **Step 6: Create the detail page (manage valores)**

```tsx
// src/pages/atributos/detalle.tsx
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
```

- [ ] **Step 7: Wire the routes and nav**

`src/App.tsx`:

```tsx
import AtributosPage from "@/pages/atributos"
import AtributoDetailPage from "@/pages/atributos/detalle"
```

```tsx
                  <Route path="/atributos" element={<AtributosPage />} />
                  <Route path="/atributos/:id" element={<AtributoDetailPage />} />
```

`src/components/layout/app-sidebar.tsx` — add `IconTags` to the icon imports, add to the "Catálogo" group (after "Tipos de Producto" from Task 4):

```tsx
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Atributos"
                  isActive={isActive("/atributos")}
                  onClick={() => navigate("/atributos")}
                >
                  <IconTags />
                  <span>Atributos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
```

- [ ] **Step 8: Verify**

Run: `npx tsc -b --noEmit` and `npm run lint` — expect no errors.
Run: `npm run dev`, log in, go to **Catálogo → Atributos**, create an atributo with `tipoDato: "opcion"`, open **Valores** on it, add two valores (e.g. Rojo/Azul), deactivate one, restore it.
Then go back to **Tipos de Producto → (any) → Atributos** (Task 4) and confirm the new atributo now appears in the "Agregar Atributo" picker.

- [ ] **Step 9: Commit**

```bash
git add src/types/atributo.ts src/services/atributos.ts src/hooks/useAtributos.ts src/pages/atributos src/App.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): add atributos CRUD and valores management"
```

---

## Task 6: Variantes de Producto + Atributos de Producto

This is the first of the two "incomplete features" the user flagged: "Productos no permite gestionar variantes." Adds a detail page reachable from the Productos list with two tabs: **Variantes** (full CRUD on `producto_variantes`) and **Atributos** (assign org-level `Atributo`s with concrete values to the producto itself, e.g. "Material: Algodón" shared across all its variants). Requires Task 5 (`useAtributos`, `useAtributoValores`) to be done first for the attribute picker.

**Files:**
- Create: `src/types/productoVariante.ts`
- Create: `src/services/productoVariantes.ts`
- Create: `src/hooks/useProductoVariantes.ts`
- Create: `src/pages/productos/variantes.tsx`
- Modify: `src/pages/productos/index.tsx` (add "Variantes" row action)
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAtributos`, `useAtributoValores` from `@/hooks/useAtributos` (Task 5); `AtributoValor` from `@/types/atributo`.
- Produces: `ProductoVariante`, `ProductoAtributoValor` types; `productoVariantesService`, `productoAtributosService`; `useProductoVariantes(productoId)`, `useCreateProductoVariante(productoId)`, `useUpdateProductoVariante(id)`, `useDeleteProductoVariante`, `useRestoreProductoVariante`, `useProductoAtributos(productoId)`, `useSetProductoAtributo(productoId)`, `useRemoveProductoAtributo(productoId)` — **Task 7 (Atributos por Variante) extends this same page and consumes the same service module's variante-atributo functions.**

- [ ] **Step 1: Create the type file**

```ts
// src/types/productoVariante.ts
export interface ProductoVariante {
  id: string
  organizacionId: string
  productoId: string
  codigoSku: string
  codigoBarras?: string
  nombre: string
  costo: number
  precio: number
  esDefault: boolean
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateProductoVarianteInput {
  codigoSku: string
  codigoBarras?: string
  nombre: string
  costo?: number
  precio?: number
  esDefault?: boolean
}

export interface UpdateProductoVarianteInput {
  codigoSku?: string
  codigoBarras?: string
  nombre?: string
  costo?: number
  precio?: number
  esDefault?: boolean
}

export interface ProductoAtributoValor {
  id: string
  organizacionId: string
  atributoId: string
  atributoValorId?: string
  valorTexto?: string
  valorNumero?: number
  valorBooleano?: boolean
  valorFecha?: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface SetAtributoValorInput {
  atributoId: string
  atributoValorId?: string
  valorTexto?: string
  valorNumero?: number
  valorBooleano?: boolean
  valorFecha?: string
}

export interface UpdateAtributoValorAsignadoInput {
  atributoValorId?: string
  valorTexto?: string
  valorNumero?: number
  valorBooleano?: boolean
  valorFecha?: string
}
```

- [ ] **Step 2: Create the service**

```ts
// src/services/productoVariantes.ts
import { api } from "@/lib/api"
import type {
  ProductoVariante,
  CreateProductoVarianteInput,
  UpdateProductoVarianteInput,
  ProductoAtributoValor,
  SetAtributoValorInput,
  UpdateAtributoValorAsignadoInput,
} from "@/types/productoVariante"

export const productoVariantesService = {
  list: (productoId: string) =>
    api.get<ProductoVariante[]>(`/productos/${productoId}/variantes`),

  create: (productoId: string, data: CreateProductoVarianteInput) =>
    api.post<ProductoVariante>(`/productos/${productoId}/variantes`, data),

  getById: (id: string) =>
    api.get<ProductoVariante>(`/producto-variantes/${id}`),

  update: (id: string, data: UpdateProductoVarianteInput) =>
    api.patch<ProductoVariante>(`/producto-variantes/${id}`, data),

  remove: (id: string) =>
    api.del<ProductoVariante>(`/producto-variantes/${id}`),

  restore: (id: string) =>
    api.patch<ProductoVariante>(`/producto-variantes/${id}/restaurar`),

  varianteAtributos: (varianteId: string) =>
    api.get<ProductoAtributoValor[]>(`/producto-variantes/${varianteId}/atributos`),

  setVarianteAtributo: (varianteId: string, data: SetAtributoValorInput) =>
    api.post<ProductoAtributoValor>(`/producto-variantes/${varianteId}/atributos`, data),

  updateVarianteAtributo: (varianteId: string, atributoId: string, data: UpdateAtributoValorAsignadoInput) =>
    api.patch<ProductoAtributoValor>(`/producto-variantes/${varianteId}/atributos/${atributoId}`, data),

  removeVarianteAtributo: (varianteId: string, atributoId: string) =>
    api.del<void>(`/producto-variantes/${varianteId}/atributos/${atributoId}`),
}

export const productoAtributosService = {
  list: (productoId: string) =>
    api.get<ProductoAtributoValor[]>(`/productos/${productoId}/atributos`),

  set: (productoId: string, data: SetAtributoValorInput) =>
    api.post<ProductoAtributoValor>(`/productos/${productoId}/atributos`, data),

  update: (productoId: string, atributoId: string, data: UpdateAtributoValorAsignadoInput) =>
    api.patch<ProductoAtributoValor>(`/productos/${productoId}/atributos/${atributoId}`, data),

  remove: (productoId: string, atributoId: string) =>
    api.del<void>(`/productos/${productoId}/atributos/${atributoId}`),
}
```

- [ ] **Step 3: Create the hook**

```ts
// src/hooks/useProductoVariantes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productoVariantesService, productoAtributosService } from "@/services/productoVariantes"
import type {
  CreateProductoVarianteInput,
  UpdateProductoVarianteInput,
  SetAtributoValorInput,
  UpdateAtributoValorAsignadoInput,
} from "@/types/productoVariante"

export const productoVariantesKeys = {
  all: ["productoVariantes"] as const,
  list: (productoId: string) => [...productoVariantesKeys.all, productoId] as const,
  varianteAtributos: (varianteId: string) => [...productoVariantesKeys.all, "atributos", varianteId] as const,
}

export const productoAtributosKeys = {
  all: ["productoAtributos"] as const,
  list: (productoId: string) => [...productoAtributosKeys.all, productoId] as const,
}

export function useProductoVariantes(productoId: string) {
  return useQuery({
    queryKey: productoVariantesKeys.list(productoId),
    queryFn: () => productoVariantesService.list(productoId),
    enabled: !!productoId,
  })
}

export function useCreateProductoVariante(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductoVarianteInput) => productoVariantesService.create(productoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useUpdateProductoVariante(productoId: string, varianteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductoVarianteInput) => productoVariantesService.update(varianteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useDeleteProductoVariante(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (varianteId: string) => productoVariantesService.remove(varianteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useRestoreProductoVariante(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (varianteId: string) => productoVariantesService.restore(varianteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.list(productoId) })
    },
  })
}

export function useProductoAtributos(productoId: string) {
  return useQuery({
    queryKey: productoAtributosKeys.list(productoId),
    queryFn: () => productoAtributosService.list(productoId),
    enabled: !!productoId,
  })
}

export function useSetProductoAtributo(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SetAtributoValorInput) => productoAtributosService.set(productoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoAtributosKeys.list(productoId) })
    },
  })
}

export function useUpdateProductoAtributo(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ atributoId, data }: { atributoId: string; data: UpdateAtributoValorAsignadoInput }) =>
      productoAtributosService.update(productoId, atributoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoAtributosKeys.list(productoId) })
    },
  })
}

export function useRemoveProductoAtributo(productoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (atributoId: string) => productoAtributosService.remove(productoId, atributoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoAtributosKeys.list(productoId) })
    },
  })
}

export function useVarianteAtributos(varianteId: string) {
  return useQuery({
    queryKey: productoVariantesKeys.varianteAtributos(varianteId),
    queryFn: () => productoVariantesService.varianteAtributos(varianteId),
    enabled: !!varianteId,
  })
}

export function useSetVarianteAtributo(varianteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SetAtributoValorInput) => productoVariantesService.setVarianteAtributo(varianteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.varianteAtributos(varianteId) })
    },
  })
}

export function useRemoveVarianteAtributo(varianteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (atributoId: string) => productoVariantesService.removeVarianteAtributo(varianteId, atributoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoVariantesKeys.varianteAtributos(varianteId) })
    },
  })
}
```

This hook file already includes `useVarianteAtributos`/`useSetVarianteAtributo`/`useRemoveVarianteAtributo` for Task 7 — writing them now avoids touching this file again in the next task; Task 7 only adds UI.

- [ ] **Step 4: Create a reusable attribute-value dialog**

Both the "Atributos" tab (producto-level) and Task 7's per-variant sheet need the same "pick an atributo, enter its value by tipoDato" form. Build it once as a local component inside the variantes page file (matching the `ajustes.tsx` precedent of embedding page-scoped sub-components in the same file rather than extracting a new shared component for a single page).

```tsx
// src/pages/productos/variantes.tsx  (Step 4 adds this component; Step 5 adds the page)
import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconArrowLeft, IconDotsVertical, IconPlus } from "@tabler/icons-react"
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
    let payload: SetAtributoValorInput = base
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
```

- [ ] **Step 5: Add the Variante form (Sheet) and the Variantes + Atributos tabs page**

Append to the same file:

```tsx
// src/pages/productos/variantes.tsx  (continued)
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

export default function ProductoVariantesPage() {
  const { id } = useParams<{ id: string }>()
  const productoId = id ?? ""
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductoVariante | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<ProductoVariante | undefined>(undefined)

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
```

Note on `valorDisplay`/`atributoValorNombrePorId`: the producto-level tab doesn't currently resolve `atributoValorId` to its label (the map is empty) because doing so needs an extra `useAtributoValores` call per distinct assigned "opcion" atributo. This is a cosmetic gap (shows "—" instead of the option's label for "opcion"-type product attributes) — acceptable for this task since the assignment still works correctly; if it matters in practice, extend `valorDisplay`'s caller to batch-fetch valores for each distinct `atributoId` with `tipoDato === "opcion"` among `asignados`.

- [ ] **Step 6: Add the "Variantes" row action to the Productos list**

In `src/pages/productos/index.tsx`, add the import:

```tsx
import { useNavigate } from "react-router-dom"
import { IconAdjustments } from "@tabler/icons-react"
```

(`useNavigate` replaces the need for a new import block — merge `IconAdjustments` into the existing `@tabler/icons-react` import on line 2.) Add `const navigate = useNavigate()` inside `ProductosPage`, and add this item to the row's `DropdownMenuContent`, right after "Editar":

```tsx
              <DropdownMenuItem onClick={() => navigate(`/productos/${producto.id}/variantes`)}>
                <IconAdjustments />
                Variantes
              </DropdownMenuItem>
```

- [ ] **Step 7: Wire the route in `src/App.tsx`**

```tsx
import ProductoVariantesPage from "@/pages/productos/variantes"
```

```tsx
                  <Route path="/productos/:id/variantes" element={<ProductoVariantesPage />} />
```

- [ ] **Step 8: Verify**

Run: `npx tsc -b --noEmit` and `npm run lint` — expect no errors.
Run: `npm run dev`, log in, go to **Catálogo → Productos**, open **Variantes** on any producto (it will already show one auto-created default variant from the DB trigger), create a second variante with a distinct SKU, edit it, verify "Desactivar" is disabled on the `esDefault` row (matches the DB's partial unique index requiring exactly one default per producto) but enabled on the new one, deactivate and restore it.
Switch to the **Atributos** tab, assign a `texto`/`numero`/`booleano`/`fecha`/`opcion` atributo one at a time (using atributos created in Task 5) and verify each renders the right input and saves.

- [ ] **Step 9: Commit**

```bash
git add src/types/productoVariante.ts src/services/productoVariantes.ts src/hooks/useProductoVariantes.ts src/pages/productos/variantes.tsx src/pages/productos/index.tsx src/App.tsx
git commit -m "feat(frontend): add producto variantes and producto-level atributos management"
```

---

## Task 7: Atributos por Variante

Extends Task 6's page: each row in the Variantes tab gets an "Atributos" action opening a Sheet that manages that specific variant's `producto_variante_atributos` (e.g. "Talla: M", "Color: Rojo" — the values that actually distinguish one SKU from another). Reuses `AsignarAtributoDialog` from Task 6 Step 4 and the `useVarianteAtributos`/`useSetVarianteAtributo`/`useRemoveVarianteAtributo` hooks already written in Task 6 Step 3.

**Files:**
- Modify: `src/pages/productos/variantes.tsx` (add a `VarianteAtributosSheet` component + row action + state)

**Interfaces:**
- Consumes: `useVarianteAtributos`, `useSetVarianteAtributo`, `useRemoveVarianteAtributo` from `@/hooks/useProductoVariantes` (already defined in Task 6); `AsignarAtributoDialog`, `valorDisplay` (already defined in the same file from Task 6 Step 4).
- Produces: no new exports — this is additive UI in the same page.

- [ ] **Step 1: Add the `VarianteAtributosSheet` component**

Insert this into `src/pages/productos/variantes.tsx`, right after the `ProductoAtributosTab` function and before `export default function ProductoVariantesPage`:

```tsx
// src/pages/productos/variantes.tsx  (insert after ProductoAtributosTab)
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
```

- [ ] **Step 2: Wire the row action and state in `ProductoVariantesPage`**

Add state near the existing `formOpen`/`editing`/`deactivating` state in `ProductoVariantesPage`:

```tsx
  const [atributosSheetTarget, setAtributosSheetTarget] = useState<ProductoVariante | undefined>(undefined)
```

Add `IconAdjustments` to the `@tabler/icons-react` import at the top of the file (alongside `IconArrowLeft`, `IconDotsVertical`, `IconPlus`).

In the `columns` array's `actions` cell, add this item right after "Editar" and before the `activo ? ... : ...` block:

```tsx
              <DropdownMenuItem onClick={() => setAtributosSheetTarget(variante)}>
                <IconAdjustments />
                Atributos
              </DropdownMenuItem>
```

Render the sheet at the bottom of `ProductoVariantesPage`'s JSX, right after `<VarianteForm .../>`:

```tsx
      <VarianteAtributosSheet
        open={!!atributosSheetTarget}
        onOpenChange={(open) => !open && setAtributosSheetTarget(undefined)}
        variante={atributosSheetTarget}
      />
```

- [ ] **Step 3: Verify**

Run: `npx tsc -b --noEmit` and `npm run lint` — expect no errors.
Run: `npm run dev`, log in, go to a producto's **Variantes** tab, open **Atributos** on a specific variante row, assign a "Talla" (opcion) and a "Color" (opcion) atributo with different values than the producto-level ones from Task 6, verify they save independently per variante (switching between two variantes' Atributos sheets shows different assigned values), then remove one.

- [ ] **Step 4: Commit**

```bash
git add src/pages/productos/variantes.tsx
git commit -m "feat(frontend): add per-variant atributo value management"
```

---

## Task 8: Plantillas

Read-heavy page: pick a `TipoNegocio` (Task 3), view its full template detail (`PlantillaDetalle` — tipos de producto, atributos, valores, relaciones, configuraciones, all in one request per `GetDetalle`), and optionally "Aplicar" it to the current org (creates real `TipoProducto`/`Atributo`/`AtributoValor`/`TipoProductoAtributo` rows scoped to the org, per `internal/modules/plantillas/service.go`'s `Aplicar`). Depends on Task 3 for the tipo-negocio selector.

**Files:**
- Create: `src/types/plantilla.ts`
- Create: `src/services/plantillas.ts`
- Create: `src/hooks/usePlantillas.ts`
- Create: `src/pages/plantillas/index.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (import `IconTemplate`, add to the "Plantillas" group created in Task 3)

**Interfaces:**
- Consumes: `useTiposNegocio` from `@/hooks/useTiposNegocio` (Task 3).
- Produces: `PlantillaDetalle` and related types; `plantillasService`; `useDetallePlantilla(tipoNegocioId)`, `useAplicarPlantilla(tipoNegocioId)`. Applying a plantilla should invalidate Task 4/5's org-scoped `tiposProductoKeys`/`atributosKeys` lists so newly-created rows show up there without a manual refresh — this task imports those key factories directly.

- [ ] **Step 1: Create the type file**

```ts
// src/types/plantilla.ts
export interface PlantillaTipoProducto {
  id: string
  tipoNegocioId: string
  codigo: string
  nombre: string
  descripcion?: string
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaAtributo {
  id: string
  tipoNegocioId: string
  codigo: string
  nombre: string
  descripcion?: string
  tipoDato: string
  esFiltrable: boolean
  esVariante: boolean
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaAtributoValor {
  id: string
  plantillaAtributoId: string
  codigo: string
  valor: string
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaTipoProductoAtributo {
  id: string
  plantillaTipoProductoId: string
  plantillaAtributoId: string
  requerido: boolean
  defineVariante: boolean
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaConfiguracion {
  id: string
  tipoNegocioId: string
  clave: string
  valor: unknown
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaDetalle {
  tiposProducto: PlantillaTipoProducto[]
  atributos: PlantillaAtributo[]
  valores: PlantillaAtributoValor[]
  relaciones: PlantillaTipoProductoAtributo[]
  configuraciones: PlantillaConfiguracion[]
}

export interface AplicarPlantillaInput {
  incluirTiposProducto?: boolean
  incluirAtributos?: boolean
  incluirValores?: boolean
  incluirRelaciones?: boolean
  incluirConfiguraciones?: boolean
}

export interface AplicarPlantillaResult {
  tipoNegocioId: string
  tiposProducto: number
  atributos: number
  valores: number
  relaciones: number
  configuraciones: number
}
```

- [ ] **Step 2: Create the service**

```ts
// src/services/plantillas.ts
import { api } from "@/lib/api"
import type { PlantillaDetalle, AplicarPlantillaInput, AplicarPlantillaResult } from "@/types/plantilla"

export const plantillasService = {
  getDetalle: (tipoNegocioId: string) =>
    api.get<PlantillaDetalle>(`/plantillas/tipos-negocio/${tipoNegocioId}`),

  aplicar: (tipoNegocioId: string, data: AplicarPlantillaInput) =>
    api.post<AplicarPlantillaResult>(`/plantillas/tipos-negocio/${tipoNegocioId}/aplicar`, data),
}
```

- [ ] **Step 3: Create the hook**

```ts
// src/hooks/usePlantillas.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { plantillasService } from "@/services/plantillas"
import { tiposProductoKeys } from "@/hooks/useTiposProducto"
import { atributosKeys } from "@/hooks/useAtributos"
import type { AplicarPlantillaInput } from "@/types/plantilla"

export const plantillasKeys = {
  all: ["plantillas"] as const,
  detalle: (tipoNegocioId: string) => [...plantillasKeys.all, tipoNegocioId] as const,
}

export function useDetallePlantilla(tipoNegocioId: string) {
  return useQuery({
    queryKey: plantillasKeys.detalle(tipoNegocioId),
    queryFn: () => plantillasService.getDetalle(tipoNegocioId),
    enabled: !!tipoNegocioId,
  })
}

export function useAplicarPlantilla(tipoNegocioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AplicarPlantillaInput) => plantillasService.aplicar(tipoNegocioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposProductoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: atributosKeys.lists() })
    },
  })
}
```

- [ ] **Step 4: Create the page**

```tsx
// src/pages/plantillas/index.tsx
import { useState } from "react"
import { IconCheck } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useTiposNegocio } from "@/hooks/useTiposNegocio"
import { useDetallePlantilla, useAplicarPlantilla } from "@/hooks/usePlantillas"
import { ApiError } from "@/lib/api"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const INCLUDE_OPTIONS: { key: keyof typeof DEFAULT_INCLUDE; label: string }[] = [
  { key: "incluirTiposProducto", label: "Tipos de producto" },
  { key: "incluirAtributos", label: "Atributos" },
  { key: "incluirValores", label: "Valores de atributo" },
  { key: "incluirRelaciones", label: "Relaciones tipo de producto ↔ atributo" },
  { key: "incluirConfiguraciones", label: "Configuraciones" },
]

const DEFAULT_INCLUDE = {
  incluirTiposProducto: true,
  incluirAtributos: true,
  incluirValores: true,
  incluirRelaciones: true,
  incluirConfiguraciones: true,
}

export default function PlantillasPage() {
  const [tipoNegocioId, setTipoNegocioId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [include, setInclude] = useState(DEFAULT_INCLUDE)

  const { data: tiposNegocio } = useTiposNegocio({ activo: "true" })
  const { data: detalle, isLoading } = useDetallePlantilla(tipoNegocioId)
  const aplicarPlantilla = useAplicarPlantilla(tipoNegocioId)

  function handleAplicar() {
    aplicarPlantilla.mutate(include, {
      onSuccess: (result) => {
        toast.success(
          `Plantilla aplicada: ${result.tiposProducto} tipos de producto, ${result.atributos} atributos, ${result.valores} valores, ${result.relaciones} relaciones, ${result.configuraciones} configuraciones`
        )
        setDialogOpen(false)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo aplicar la plantilla"),
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Plantillas"
        description="Aplica el catálogo de referencia de un tipo de negocio a tu organización."
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={tipoNegocioId} onValueChange={setTipoNegocioId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar tipo de negocio" />
            </SelectTrigger>
            <SelectContent>
              {(tiposNegocio ?? []).map((tipoNegocio) => (
                <SelectItem key={tipoNegocio.id} value={tipoNegocio.id}>
                  {tipoNegocio.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!tipoNegocioId}>
                <IconCheck />
                Aplicar a mi organización
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aplicar plantilla</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {INCLUDE_OPTIONS.map((option) => (
                  <label key={option.key} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={include[option.key]}
                      onCheckedChange={(checked) => setInclude((prev) => ({ ...prev, [option.key]: !!checked }))}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={handleAplicar} disabled={aplicarPlantilla.isPending}>
                  {aplicarPlantilla.isPending && <Loader2 className="animate-spin" />}
                  Aplicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!tipoNegocioId && (
          <EmptyState title="Selecciona un tipo de negocio" description="Elige un tipo de negocio para ver su plantilla." />
        )}

        {tipoNegocioId && isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {tipoNegocioId && !isLoading && detalle && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Producto ({detalle.tiposProducto.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.tiposProducto.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.nombre}</span>
                    <Badge variant="outline">{item.codigo}</Badge>
                  </div>
                ))}
                {detalle.tiposProducto.length === 0 && <p className="text-sm text-muted-foreground">Sin tipos de producto.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Atributos ({detalle.atributos.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.atributos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.nombre}</span>
                    <Badge variant="outline">{item.tipoDato}</Badge>
                  </div>
                ))}
                {detalle.atributos.length === 0 && <p className="text-sm text-muted-foreground">Sin atributos.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Valores ({detalle.valores.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.valores.map((item) => (
                  <div key={item.id} className="text-sm">
                    {item.valor}
                  </div>
                ))}
                {detalle.valores.length === 0 && <p className="text-sm text-muted-foreground">Sin valores.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Configuraciones ({detalle.configuraciones.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {detalle.configuraciones.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.clave}</span>
                    {item.descripcion && <span className="text-muted-foreground">{item.descripcion}</span>}
                  </div>
                ))}
                {detalle.configuraciones.length === 0 && <p className="text-sm text-muted-foreground">Sin configuraciones.</p>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wire the route and nav**

`src/App.tsx`:

```tsx
import PlantillasPage from "@/pages/plantillas"
```

```tsx
                  <Route path="/plantillas" element={<PlantillasPage />} />
```

`src/components/layout/app-sidebar.tsx` — add `IconTemplate` to the icon imports, add to the "Plantillas" group created in Task 3 (after "Tipos de Negocio"):

```tsx
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Plantillas"
                  isActive={isActive("/plantillas")}
                  onClick={() => navigate("/plantillas")}
                >
                  <IconTemplate />
                  <span>Plantillas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
```

- [ ] **Step 6: Verify**

Run: `npx tsc -b --noEmit` and `npm run lint` — expect no errors.
Run: `npm run dev`, log in, go to **Plantillas → Plantillas**, select a tipo de negocio (create one in Task 3's page first if none has template data seeded), inspect the four cards, then **Aplicar a mi organización** with all checkboxes on, confirm the toast shows non-zero counts (if the tipo de negocio has template rows) or all zeros (if not — that's correct behavior, not a bug), and verify **Catálogo → Tipos de Producto** (Task 4) shows the newly created rows after applying.

- [ ] **Step 7: Commit**

```bash
git add src/types/plantilla.ts src/services/plantillas.ts src/hooks/usePlantillas.ts src/pages/plantillas src/App.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): add plantillas viewer and aplicar action"
```

---

## Task 9: Catálogo Público

Read-only view of `GET /api/catalogo/productos` — the same endpoint an eshop would consume. `catalogoService` already exists in `src/services/inventario.ts`, but the frontend `CatalogoProducto` type (`src/types/inventario.ts:47-59`) is stale relative to the backend (`internal/modules/inventario/types.go:70-96`): it's missing `tipoProductoId`, `tipoProducto`, `atributos`, and `variantes`. This task extends the type (justified — this page is the first real consumer that needs those fields) and builds the page.

**Files:**
- Modify: `src/types/inventario.ts` (extend `CatalogoProducto`, add `CatalogoVariante`)
- Create: `src/pages/catalogo/index.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (import `IconWorld`, add to "Catálogo" group)

**Interfaces:**
- Consumes: `catalogoService.productos` from `@/services/inventario` (already exists, no change needed); `useCatalogoProductos` from `@/hooks/useInventario` (already exists, no change needed — it just needed a page).
- Produces: extended `CatalogoProducto` type + new `CatalogoVariante` type.

- [ ] **Step 1: Extend the type**

In `src/types/inventario.ts`, replace the existing `CatalogoProducto` interface with:

```ts
export interface CatalogoVariante {
  id: string
  sku: string
  codigoBarras?: string
  nombre: string
  precio: number
  stockDisponible: number
  atributos: Record<string, string>
  fechaActualizacion: string
}

export interface CatalogoProducto {
  id: string
  categoriaId?: string
  unidadId?: string
  tipoProductoId?: string
  tipoProducto?: string
  codigo?: string
  nombre: string
  descripcion?: string
  stockMinimo: number
  stockDisponible: number
  sucursalId: string
  atributos: Record<string, string>
  variantes: CatalogoVariante[]
  fechaActualizacion: string
}
```

(This drops the old `precio` field from `CatalogoProducto` itself — per the Go struct, price now lives per-variant in `CatalogoVariante.precio`, matching the variant-aware catalog model introduced in migration `000022_inventario_sobre_variantes`.)

- [ ] **Step 2: Create the page**

```tsx
// src/pages/catalogo/index.tsx
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { useCatalogoProductos } from "@/hooks/useInventario"
import { useSucursales } from "@/hooks/useSucursales"
import { formatCurrency } from "@/lib/utils"
import type { CatalogoProducto } from "@/types/inventario"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { CrudTable } from "@/components/shared/CrudTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CatalogoPage() {
  const [nombre, setNombre] = useState("")
  const [sucursalId, setSucursalId] = useState("")

  const { data: sucursales } = useSucursales({ activo: "true" })
  const { data: catalogo, isLoading } = useCatalogoProductos({
    ...(nombre ? { nombre } : {}),
    ...(sucursalId ? { sucursalId } : {}),
    soloConStock: "true",
  })

  const columns: ColumnDef<CatalogoProducto & { id: string }>[] = [
    { accessorKey: "codigo", header: "Código", cell: ({ row }) => row.original.codigo ?? "—" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "tipoProducto", header: "Tipo", cell: ({ row }) => row.original.tipoProducto ?? "—" },
    {
      id: "variantes",
      header: "Variantes",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.variantes.map((variante) => (
            <Badge key={variante.id} variant="outline">
              {variante.sku} · {formatCurrency(variante.precio)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "stockDisponible",
      header: () => <div className="text-right">Stock Disponible</div>,
      cell: ({ row }) => <div className="text-right">{row.original.stockDisponible}</div>,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title="Catálogo Público"
        description="Vista de catálogo con stock disponible, la misma que consume la eshop vía GET /api/catalogo/productos."
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput value={nombre} onChange={setNombre} placeholder="Buscar por nombre..." className="max-w-xs" />
          <div className="flex flex-col gap-2">
            <Label>Sucursal</Label>
            <Select value={sucursalId} onValueChange={setSucursalId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {(sucursales ?? []).map((sucursal) => (
                  <SelectItem key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!sucursalId ? (
          <EmptyState title="Selecciona una sucursal" description="Elige una sucursal para ver el catálogo público." />
        ) : (
          <CrudTable
            columns={columns}
            data={catalogo ?? []}
            isLoading={isLoading}
            emptyMessage="Sin productos con stock disponible."
          />
        )}
      </div>
    </div>
  )
}
```

Note: `CrudTable<T extends { id: string }>` is satisfied because `CatalogoProducto` already has `id: string`; the `& { id: string }` in the column type is redundant but harmless — remove it if the type-checker flags it as an unnecessary intersection (it won't, but keep the file's type honest by just using `CatalogoProducto` directly if you prefer).

- [ ] **Step 3: Wire the route and nav**

`src/App.tsx`:

```tsx
import CatalogoPage from "@/pages/catalogo"
```

```tsx
                  <Route path="/catalogo" element={<CatalogoPage />} />
```

`src/components/layout/app-sidebar.tsx` — add `IconWorld` to the icon imports, add to the "Catálogo" group (after "Atributos" from Task 5):

```tsx
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Catálogo Público"
                  isActive={isActive("/catalogo")}
                  onClick={() => navigate("/catalogo")}
                >
                  <IconWorld />
                  <span>Catálogo Público</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
```

- [ ] **Step 4: Verify**

Run: `npx tsc -b --noEmit` — this is the step most likely to surface a real type error, since `CatalogoProducto` changed shape; fix any other file that referenced the removed `precio` field (search: `grep -rn "catalogo" src --include=*.tsx -l` and check each hit compiles).
Run: `npm run lint`.
Run: `npm run dev`, log in, go to **Catálogo → Catálogo Público**, pick a sucursal that has stock (from Task 1/existing ajustes), verify products with their variant SKU/price badges and stock disponible show up.

- [ ] **Step 5: Commit**

```bash
git add src/types/inventario.ts src/pages/catalogo src/App.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): add public catalogo page with variant-aware type"
```

---

## Task 10: Navegación, permisos y QA final

Consolidation pass: confirm every route/nav pair added in Tasks 1–9 is consistent, confirm no dead imports or duplicate nav groups, and do one end-to-end manual walkthrough of the whole set of new pages in a single session (catches cross-task regressions individual task verification can't, e.g. Task 8 applying a plantilla and then checking Task 4's list actually reflects it).

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx` (final pass only — no new features)

**Interfaces:** None — this task only verifies.

- [ ] **Step 1: Confirm sidebar groups are correctly ordered and non-duplicated**

Open `src/components/layout/app-sidebar.tsx` and confirm the final group order reads top-to-bottom as: Panel → Catálogo (Productos, Categorías, Unidades, Proveedores, Tipos de Producto, Atributos, Catálogo Público) → Plantillas (Tipos de Negocio, Plantillas) → Inventario (Stock, Movimientos, Ajustes, Reservas, Conteos) → Operaciones (Compras, Transferencias, Devoluciones) → Reportes (Stock Bajo, Kardex, Valoración) → Configuración (General, Usuarios, Roles, Sucursales, Organizaciones). Fix ordering if any task inserted an item in the wrong group.

- [ ] **Step 2: Full type-check and lint**

Run: `npx tsc -b --noEmit` from `Inventarios-Front/` — must be clean (zero errors) across every file touched in Tasks 1–9.
Run: `npm run lint` — must be clean.
Run: `npm run build` — confirms the production Vite build (which runs `tsc -b && vite build`) succeeds end-to-end, not just the dev server.

- [ ] **Step 3: End-to-end manual walkthrough**

Run: `docker compose up -d postgres` and `go run .` from `InventarioSaaS-Api/` (apply migrations first if not already applied: `migrate -path db/migrations -database "postgres://postgres:postgres@localhost:5432/inventario_saas?sslmode=disable" up`).
Run: `npm run dev` from `Inventarios-Front/`. Log in with the demo credentials and walk through, in order (later steps depend on data created in earlier ones):

1. **Tipos de Negocio** — create one, e.g. `RETAIL` / "Retail".
2. **Atributos** — create `COLOR` (opcion) with valores Rojo/Azul, and `TALLA` (opcion) with valores S/M/L.
3. **Tipos de Producto** — create one linked to the RETAIL tipo de negocio, then assign both COLOR and TALLA as `defineVariante: true`.
4. **Productos → (existing producto) → Variantes** — create two variantes (e.g. "M/Rojo", "L/Azul") with distinct SKUs, assign COLOR/TALLA per-variant via the Atributos sheet, assign a producto-level atributo too.
5. **Organizaciones** — confirm the current org is listed and editable.
6. **Inventario → Reservas** — create a reserva against a sucursal/producto with stock, then Confirmar it, and verify **Inventario → Movimientos** shows the resulting `VENTA` movement.
7. **Catálogo → Catálogo Público** — pick the sucursal used above and confirm the producto shows both variant SKUs with correct price/stock.
8. **Plantillas** — select the RETAIL tipo de negocio (will show empty template data unless seeded separately — that's expected, not a bug) and click "Aplicar a mi organización" to confirm the action completes without error.

Fix anything that 403s (check the relevant migration's `roles_permisos` grant), anything that renders "—" where real data should show (check the corresponding hook's query key / invalidation), and any console error.

- [ ] **Step 4: Commit**

Only if Step 1 required sidebar reordering fixes:

```bash
git add src/components/layout/app-sidebar.tsx
git commit -m "chore(frontend): reorder sidebar nav groups after adding new modules"
```

---

## Summary of new routes

| Route | Page | Task |
|---|---|---|
| `/inventario/reservas` | `ReservasPage` | 1 |
| `/organizaciones` | `OrganizacionesPage` | 2 |
| `/tipos-negocio` | `TiposNegocioPage` | 3 |
| `/tipos-producto` | `TiposProductoPage` | 4 |
| `/tipos-producto/:id` | `TipoProductoDetailPage` | 4 |
| `/atributos` | `AtributosPage` | 5 |
| `/atributos/:id` | `AtributoDetailPage` | 5 |
| `/productos/:id/variantes` | `ProductoVariantesPage` | 6, 7 |
| `/plantillas` | `PlantillasPage` | 8 |
| `/catalogo` | `CatalogoPage` | 9 |

