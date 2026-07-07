export interface Conteo {
  id: string
  organizacionId: string
  sucursalId: string
  estado: string
  observacion?: string
  creadoPorId?: string
  cerradoPorId?: string
  items: ConteoItem[]
  fechaCreacion: string
  fechaCierre?: string
  fechaActualizacion: string
}

export interface ConteoItem {
  id: string
  conteoId: string
  productoId: string
  cantidadTeorica: number
  cantidadContada?: number
  diferencia?: number
}

export interface CreateConteoInput {
  sucursalId: string
  observacion?: string
  productoIds: string[]
}

export interface RegistrarConteoItem {
  productoId: string
  cantidadContada: number
}

export interface RegistrarConteoInput {
  items: RegistrarConteoItem[]
}
