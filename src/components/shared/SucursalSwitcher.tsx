import { useState } from "react"
import { IconBuildingStore, IconCheck, IconSelector } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-provider"
import { useSucursal } from "@/context/sucursal-provider"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const TODAS_LABEL = "Todas las sucursales"

export function SucursalSwitcher() {
  const { hasPermission } = useAuth()
  const { sucursalActiva, sucursales, setSucursalActiva, isLoading } = useSucursal()
  const [open, setOpen] = useState(false)

  // Solo tiene sentido para quien puede listar sucursales.
  if (!hasPermission("sucursales:leer")) return null
  if (!isLoading && sucursales.length === 0) return null

  const label = sucursalActiva?.nombre ?? TODAS_LABEL

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className="h-8 max-w-[220px] justify-between gap-2"
          disabled={isLoading}
        >
          <IconBuildingStore className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
          <IconSelector className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar sucursal..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={TODAS_LABEL}
                onSelect={() => {
                  setSucursalActiva(null)
                  setOpen(false)
                }}
              >
                <IconCheck className={cn("size-4", sucursalActiva ? "opacity-0" : "opacity-100")} />
                {TODAS_LABEL}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Sucursales">
              {sucursales.map((sucursal) => (
                <CommandItem
                  key={sucursal.id}
                  value={sucursal.nombre}
                  onSelect={() => {
                    setSucursalActiva(sucursal)
                    setOpen(false)
                  }}
                >
                  <IconCheck
                    className={cn(
                      "size-4",
                      sucursalActiva?.id === sucursal.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {sucursal.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
