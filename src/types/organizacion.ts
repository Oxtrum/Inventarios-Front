export interface Organizacion {
  id: string
  nombre: string
  codigo: string
  plan: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateOrganizacionInput {
  nombre: string
  codigo: string
  plan?: string
}

export interface UpdateOrganizacionInput {
  nombre?: string
  plan?: string
}
