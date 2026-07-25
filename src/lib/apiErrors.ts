import { ApiError } from "@/lib/api"

const MENSAJES_POR_ESTADO: Record<number, string> = {
  401: "Tu sesión expiró. Vuelve a iniciar sesión para continuar.",
  403: "No tienes permiso para consultar esta información.",
  404: "No encontramos la información solicitada.",
  409: "La operación entró en conflicto con el estado actual de los datos.",
  429: "Demasiadas solicitudes seguidas. Espera un momento y reintenta.",
}

export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return "El servidor no pudo responder. Reintenta en unos segundos."
    }
    return MENSAJES_POR_ESTADO[error.status] ?? error.message
  }
  return "No pudimos contactar al servidor. Revisa tu conexión y reintenta."
}
