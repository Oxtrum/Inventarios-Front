import { IconBuildingStore, IconCheck, IconFilter } from "@tabler/icons-react"

import type { ReportFiltersState } from "@/hooks/useReportFilters"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportFiltersProps {
  filters: ReportFiltersState
  showPeriod?: boolean
  showGranularity?: boolean
}

export function ReportFilters({ filters, showPeriod = false, showGranularity = false }: ReportFiltersProps) {
  const selected = new Set(filters.sucursalIds)

  function toggleSucursal(id: string) {
    filters.setSucursalIds(
      selected.has(id)
        ? filters.sucursalIds.filter((item) => item !== id)
        : [...filters.sucursalIds, id]
    )
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-wrap items-end gap-3 py-4">
        <div className="flex min-w-[220px] flex-col gap-2">
          <Label>Alcance del reporte</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between font-normal">
                <span className="flex min-w-0 items-center gap-2">
                  <IconBuildingStore className="size-4 shrink-0 text-highlight" />
                  <span className="truncate">{filters.scopeLabel}</span>
                </span>
                <IconFilter className="size-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 gap-2 p-2">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted",
                  filters.sucursalIds.length === 0 && "bg-highlight/10"
                )}
                onClick={() => filters.setSucursalIds([])}
              >
                <IconCheck className={cn("size-4", filters.sucursalIds.length === 0 ? "opacity-100" : "opacity-0")} />
                <span>{filters.allScopeLabel}</span>
              </button>
              <div className="my-1 border-t" />
              <div className="max-h-64 overflow-y-auto">
                {filters.sucursales.map((sucursal) => (
                  <label key={sucursal.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                    <Checkbox
                      checked={selected.has(sucursal.id)}
                      onCheckedChange={() => toggleSucursal(sucursal.id)}
                    />
                    <span className="min-w-0 truncate">{sucursal.nombre}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {showPeriod && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reporte-fecha-desde">Desde</Label>
              <Input
                id="reporte-fecha-desde"
                type="date"
                className="w-40"
                value={filters.fechaDesde}
                max={filters.fechaHasta}
                onChange={(event) => filters.setFechaDesde(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reporte-fecha-hasta">Hasta</Label>
              <Input
                id="reporte-fecha-hasta"
                type="date"
                className="w-40"
                value={filters.fechaHasta}
                min={filters.fechaDesde}
                onChange={(event) => filters.setFechaHasta(event.target.value)}
              />
            </div>
          </>
        )}

        {showGranularity && (
          <div className="flex flex-col gap-2">
            <Label>Granularidad</Label>
            <Select value={filters.granularidad} onValueChange={filters.setGranularidad}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dia">Diaria</SelectItem>
                <SelectItem value="semana">Semanal</SelectItem>
                <SelectItem value="mes">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
