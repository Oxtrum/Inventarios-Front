export interface Unidad {
  id: string
  organizacionId: string
  nombre: string
  simbolo: string
  precision: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateUnidadInput {
  nombre: string
  simbolo: string
  precision?: number
}

export interface UpdateUnidadInput {
  nombre?: string
  simbolo?: string
  precision?: number
}
