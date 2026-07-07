export interface Proveedor {
  id: string
  organizacionId: string
  nombre: string
  nit?: string
  email?: string
  telefono?: string
  direccion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateProveedorInput {
  nombre: string
  nit?: string
  email?: string
  telefono?: string
  direccion?: string
}

export interface UpdateProveedorInput {
  nombre?: string
  nit?: string
  email?: string
  telefono?: string
  direccion?: string
}
