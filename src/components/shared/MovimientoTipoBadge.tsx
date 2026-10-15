import type { MovementType } from "@/types/common"
import { esMovimientoEntrada } from "@/lib/movimientos"
import { cn } from "@/lib/utils"

export function MovimientoTipoBadge({ tipo }: { tipo: MovementType }) {
  const esEntrada = esMovimientoEntrada(tipo)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium",
        esEntrada
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400",
      )}
    >
      <span aria-hidden="true" className="font-mono font-semibold">
        {esEntrada ? "+" : "−"}
      </span>
      {tipo}
      <span className="sr-only">
        {esEntrada ? " (entrada de stock)" : " (salida de stock)"}
      </span>
    </span>
  )
}
