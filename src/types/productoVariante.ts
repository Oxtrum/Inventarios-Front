export interface ProductoVariante {
  id: string
  organizacionId: string
  productoId: string
  codigoSku: string
  codigoBarras?: string
  nombre: string
  costo: number
  precio: number
  esDefault: boolean
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateProductoVarianteInput {
  codigoSku: string
  codigoBarras?: string
  nombre: string
  costo?: number
  precio?: number
  esDefault?: boolean
}

export interface UpdateProductoVarianteInput {
  codigoSku?: string
  codigoBarras?: string
  nombre?: string
  costo?: number
  precio?: number
  esDefault?: boolean
}

export interface ProductoAtributoValor {
  id: string
  organizacionId: string
  atributoId: string
  atributoValorId?: string
  valorTexto?: string
  valorNumero?: number
  valorBooleano?: boolean
  valorFecha?: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface SetAtributoValorInput {
  atributoId: string
  atributoValorId?: string
  valorTexto?: string
  valorNumero?: number
  valorBooleano?: boolean
  valorFecha?: string
}

export interface UpdateAtributoValorAsignadoInput {
  atributoValorId?: string
  valorTexto?: string
  valorNumero?: number
  valorBooleano?: boolean
  valorFecha?: string
}
