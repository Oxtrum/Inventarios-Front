export interface PlantillaTipoProducto {
  id: string
  tipoNegocioId: string
  codigo: string
  nombre: string
  descripcion?: string
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaAtributo {
  id: string
  tipoNegocioId: string
  codigo: string
  nombre: string
  descripcion?: string
  tipoDato: string
  esFiltrable: boolean
  esVariante: boolean
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaAtributoValor {
  id: string
  plantillaAtributoId: string
  codigo: string
  valor: string
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaTipoProductoAtributo {
  id: string
  plantillaTipoProductoId: string
  plantillaAtributoId: string
  requerido: boolean
  defineVariante: boolean
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaConfiguracion {
  id: string
  tipoNegocioId: string
  clave: string
  valor: unknown
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PlantillaDetalle {
  tiposProducto: PlantillaTipoProducto[]
  atributos: PlantillaAtributo[]
  valores: PlantillaAtributoValor[]
  relaciones: PlantillaTipoProductoAtributo[]
  configuraciones: PlantillaConfiguracion[]
}

export interface AplicarPlantillaInput {
  incluirTiposProducto?: boolean
  incluirAtributos?: boolean
  incluirValores?: boolean
  incluirRelaciones?: boolean
  incluirConfiguraciones?: boolean
}

export interface AplicarPlantillaResult {
  tipoNegocioId: string
  tiposProducto: number
  atributos: number
  valores: number
  relaciones: number
  configuraciones: number
}
