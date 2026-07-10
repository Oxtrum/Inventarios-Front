export type AtributoTipoDato = "texto" | "numero" | "booleano" | "fecha" | "opcion"

export interface Atributo {
  id: string
  organizacionId: string
  codigo: string
  nombre: string
  tipoDato: AtributoTipoDato
  esFiltrable: boolean
  esVariante: boolean
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateAtributoInput {
  codigo: string
  nombre: string
  tipoDato: AtributoTipoDato
  esFiltrable: boolean
  esVariante: boolean
}

export interface UpdateAtributoInput {
  codigo?: string
  nombre?: string
  tipoDato?: AtributoTipoDato
  esFiltrable?: boolean
  esVariante?: boolean
}

export interface AtributoValor {
  id: string
  atributoId: string
  codigo: string
  valor: string
  orden: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateAtributoValorInput {
  codigo: string
  valor: string
  orden: number
}

export interface UpdateAtributoValorInput {
  codigo?: string
  valor?: string
  orden?: number
}
