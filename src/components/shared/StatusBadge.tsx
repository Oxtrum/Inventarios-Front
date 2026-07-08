import { Badge } from "@/components/ui/badge"

export function StatusBadge({ activo }: { activo: boolean }) {
  return (
    <Badge variant={activo ? "default" : "outline"}>
      {activo ? "Activo" : "Inactivo"}
    </Badge>
  )
}

const ESTADO_LABELS: Record<string, string> = {
  registrada: "Registrada",
  anulada: "Anulada",
  abierto: "Abierto",
  cerrado: "Cerrado",
  anulado: "Anulado",
  activa: "Activa",
  confirmada: "Confirmada",
  liberada: "Liberada",
  expirada: "Expirada",
}

const ESTADO_VARIANTS: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  registrada: "default",
  anulada: "destructive",
  abierto: "default",
  cerrado: "secondary",
  anulado: "destructive",
  activa: "default",
  confirmada: "default",
  liberada: "secondary",
  expirada: "destructive",
}

export function EstadoBadge({ estado }: { estado: string }) {
  const key = estado.toLowerCase()
  return (
    <Badge variant={ESTADO_VARIANTS[key] ?? "outline"}>
      {ESTADO_LABELS[key] ?? estado}
    </Badge>
  )
}
