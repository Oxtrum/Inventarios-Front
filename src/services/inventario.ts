import { api } from "@/lib/api"
import type {
  Stock,
  Movimiento,
  ReservaStock,
  AjusteRequest,
  MermaRequest,
  CrearReservaRequest,
  CatalogoProducto,
} from "@/types/inventario"

export const inventarioService = {
  stock: (params?: Record<string, string>) =>
    api.get<Stock[]>("/inventario/stock", { params }),

  movimientos: (params?: Record<string, string>) =>
    api.get<Movimiento[]>("/inventario/movimientos", { params }),

  ajustar: (data: AjusteRequest) =>
    api.post<Movimiento>("/inventario/ajustes", data),

  merma: (data: MermaRequest) =>
    api.post<Movimiento>("/inventario/mermas", data),

  reservas: (params?: Record<string, string>) =>
    api.get<ReservaStock[]>("/inventario/reservas", { params }),

  crearReserva: (data: CrearReservaRequest) =>
    api.post<ReservaStock>("/inventario/reservas", data),

  confirmarReserva: (id: string) =>
    api.patch<ReservaStock>(`/inventario/reservas/${id}/confirmar`),

  liberarReserva: (id: string) =>
    api.patch<ReservaStock>(`/inventario/reservas/${id}/liberar`),

  expirarReserva: (id: string) =>
    api.patch<ReservaStock>(`/inventario/reservas/${id}/expirar`),
}

export const catalogoService = {
  productos: (params?: Record<string, string>) =>
    api.get<CatalogoProducto[]>("/catalogo/productos", { params }),
}
