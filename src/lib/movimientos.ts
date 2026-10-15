import type { MovementType } from "@/types/common"

const TIPOS_ENTRADA: readonly MovementType[] = [
  "STOCK_INICIAL",
  "COMPRA",
  "AJUSTE_ENTRADA",
  "TRANSFERENCIA_ENTRA",
  "DEVOLUCION_ENTRA",
]

export function esMovimientoEntrada(tipo: MovementType): boolean {
  return TIPOS_ENTRADA.includes(tipo)
}
