export interface Rol {
  id: string
  organizacionId: string
  nombre: string
  codigo: string
  descripcion?: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface Permiso {
  id: string
  accion: string
  recurso: string
  descripcion?: string
  clave: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateRolInput {
  nombre: string
  codigo: string
  descripcion?: string
}

export interface UpdateRolInput {
  nombre?: string
  descripcion?: string
}

export interface CreatePermisoInput {
  accion: string
  recurso: string
  descripcion?: string
}

export interface AssignPermisoInput {
  permisoId: string
}
