import { IconBuildingCommunity, IconBuildingStore } from "@tabler/icons-react"

import type { AlcanceDatos } from "@/types/auth"
import type { Sucursal } from "@/types/sucursal"
import type { UpdateUsuarioAlcanceInput } from "@/types/usuario"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface UsuarioAlcanceFieldsProps {
  value: UpdateUsuarioAlcanceInput
  onChange: (value: UpdateUsuarioAlcanceInput) => void
  sucursales?: Sucursal[]
  isLoading?: boolean
  disabled?: boolean
}

export function UsuarioAlcanceFields({
  value,
  onChange,
  sucursales,
  isLoading = false,
  disabled = false,
}: UsuarioAlcanceFieldsProps) {
  const branchItems = Array.isArray(sucursales) ? sucursales : []
  const selected = new Set(value.sucursalIds)
  const selectedBranches = branchItems.filter((item) => selected.has(item.id))

  function setScope(scope: AlcanceDatos) {
    onChange(scope === "organizacion"
      ? { alcanceDatos: "organizacion", sucursalIds: [] }
      : { alcanceDatos: "sucursales", sucursalIds: [] })
  }

  function toggleBranch(id: string) {
    const nextIds = selected.has(id)
      ? value.sucursalIds.filter((item) => item !== id)
      : [...value.sucursalIds, id]
    const nextPrincipal = nextIds.includes(value.sucursalPrincipalId ?? "")
      ? value.sucursalPrincipalId
      : nextIds[0]

    onChange({
      alcanceDatos: "sucursales",
      sucursalIds: nextIds,
      sucursalPrincipalId: nextPrincipal,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Alcance de datos</Label>
        <Select
          value={value.alcanceDatos}
          disabled={disabled}
          onValueChange={(scope) => setScope(scope as AlcanceDatos)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="organizacion">Toda la organización</SelectItem>
            <SelectItem value="sucursales">Sucursales seleccionadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.alcanceDatos === "organizacion" ? (
        <div className="flex gap-3 rounded-md border border-highlight/25 bg-highlight/5 p-3 text-sm">
          <IconBuildingCommunity className="mt-0.5 size-5 shrink-0 text-highlight" />
          <div>
            <p className="font-medium">Acceso organizacional</p>
            <p className="text-muted-foreground">
              Podrá consultar todas las sucursales actuales y las que se creen posteriormente.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Sucursales permitidas</Label>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : branchItems.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                No hay sucursales disponibles.
              </div>
            ) : (
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
                {branchItems.map((branch) => (
                  <label
                    key={branch.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                  >
                    <Checkbox
                      checked={selected.has(branch.id)}
                      disabled={disabled}
                      onCheckedChange={() => toggleBranch(branch.id)}
                    />
                    <IconBuildingStore className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{branch.nombre}</span>
                    {branch.codigo && <span className="text-xs text-muted-foreground">{branch.codigo}</span>}
                    {!branch.activo && <Badge variant="outline">Inactiva</Badge>}
                  </label>
                ))}
              </div>
            )}
            {value.sucursalIds.length === 0 && !isLoading && (
              <p className="text-sm text-destructive">Selecciona al menos una sucursal.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Sucursal principal</Label>
            <Select
              value={value.sucursalPrincipalId ?? ""}
              disabled={disabled || selectedBranches.length === 0}
              onValueChange={(id) => onChange({ ...value, sucursalPrincipalId: id })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar sucursal principal" />
              </SelectTrigger>
              <SelectContent>
                {selectedBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  )
}
