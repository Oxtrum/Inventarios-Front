export interface Sucursal {
  id: string
  organizacionId: string
  nombre: string
  codigo?: string
  direccion?: string
  telefono?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateSucursalInput {
  nombre: string
  codigo?: string
  direccion?: string
  telefono?: string
}

export interface UpdateSucursalInput {
  nombre?: string
  codigo?: string
  direccion?: string
  telefono?: string
}
