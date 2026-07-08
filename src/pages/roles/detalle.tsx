import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import { toast } from "sonner"

import { useRoles, useRolPermisos, usePermisos, useAssignPermiso, useRemovePermiso } from "@/hooks/useRoles"
import { ApiError } from "@/lib/api"
import type { Permiso } from "@/types/rol"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

export default function RolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const rolId = id ?? ""
  const [pendingId, setPendingId] = useState<string | null>(null)

  const { data: roles } = useRoles()
  const rol = (roles ?? []).find((r) => r.id === rolId)
  const { data: asignados, isLoading: isLoadingAsignados } = useRolPermisos(rolId)
  const { data: permisos, isLoading: isLoadingPermisos } = usePermisos()
  const assignPermiso = useAssignPermiso(rolId)
  const removePermiso = useRemovePermiso(rolId)

  const asignadoIds = useMemo(() => new Set((asignados ?? []).map((p) => p.id)), [asignados])

  const grupos = useMemo(() => {
    const map = new Map<string, Permiso[]>()
    for (const permiso of permisos ?? []) {
      const list = map.get(permiso.recurso) ?? []
      list.push(permiso)
      map.set(permiso.recurso, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [permisos])

  function handleToggle(permiso: Permiso, checked: boolean) {
    setPendingId(permiso.id)
    if (checked) {
      assignPermiso.mutate(
        { permisoId: permiso.id },
        {
          onSuccess: () => toast.success("Permiso asignado"),
          onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo asignar el permiso"),
          onSettled: () => setPendingId(null),
        }
      )
    } else {
      removePermiso.mutate(permiso.id, {
        onSuccess: () => toast.success("Permiso removido"),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo remover el permiso"),
        onSettled: () => setPendingId(null),
      })
    }
  }

  const isLoading = isLoadingAsignados || isLoadingPermisos

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:py-6">
      <PageHeader
        title={rol ? `Permisos de ${rol.nombre}` : "Permisos del rol"}
        description="Asigna o remueve permisos para este rol."
        action={
          <Button variant="outline" asChild>
            <Link to="/roles">
              <IconArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : grupos.length === 0 ? (
          <EmptyState title="No hay permisos definidos" description="Aún no se han registrado permisos en el sistema." />
        ) : (
          grupos.map(([recurso, items]) => (
            <Card key={recurso}>
              <CardHeader>
                <CardTitle className="capitalize">{recurso}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {items.map((permiso) => (
                  <label key={permiso.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={asignadoIds.has(permiso.id)}
                      disabled={pendingId === permiso.id}
                      onCheckedChange={(checked) => handleToggle(permiso, !!checked)}
                    />
                    <span className="font-medium">{permiso.accion}</span>
                    {permiso.descripcion && (
                      <span className="text-muted-foreground">{permiso.descripcion}</span>
                    )}
                  </label>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
