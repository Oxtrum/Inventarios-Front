import { createContext, useContext, useMemo, useState } from "react"
import { getCookie, setCookie } from "@/lib/cookies"
import { useSucursales } from "@/hooks/useSucursales"
import type { Sucursal } from "@/types/sucursal"

const SUCURSAL_COOKIE_NAME = "sucursal_activa_id"
const SUCURSAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias
// Centinela para distinguir "el usuario eligió Todas" de "aún no eligió nada"
// (sin cookie => por defecto se usa la primera sucursal, no Todas).
const TODAS = "todas"

interface SucursalContextType {
  /** null => "Todas las sucursales" (sin filtro por sucursal). */
  sucursalActiva: Sucursal | null
  sucursales: Sucursal[]
  setSucursalActiva: (sucursal: Sucursal | null) => void
  /** id de la sucursal activa, o "" cuando es "Todas". Listo para pasar como filtro. */
  sucursalId: string
  isLoading: boolean
}

const SucursalContext = createContext<SucursalContextType | null>(null)

export function SucursalProvider({ children }: { children: React.ReactNode }) {
  const { data: sucursales, isLoading } = useSucursales({ activo: "true" })
  // "" (sin cookie) => usar primera sucursal; TODAS => Todas; <id> => esa sucursal.
  const [seleccion, setSeleccion] = useState<string>(() => getCookie(SUCURSAL_COOKIE_NAME) ?? "")

  const lista = useMemo(() => sucursales ?? [], [sucursales])

  // Sucursal activa derivada de la lista:
  // - TODAS => null (todas las sucursales)
  // - id valido => esa sucursal
  // - sin eleccion previa (o id obsoleto) => por defecto la primera sucursal
  const sucursalActiva = useMemo<Sucursal | null>(() => {
    if (seleccion === TODAS) return null
    const encontrada = lista.find((s) => s.id === seleccion)
    if (encontrada) return encontrada
    return lista[0] ?? null
  }, [lista, seleccion])

  const setSucursalActiva = (sucursal: Sucursal | null) => {
    const valor = sucursal ? sucursal.id : TODAS
    setSeleccion(valor)
    setCookie(SUCURSAL_COOKIE_NAME, valor, SUCURSAL_COOKIE_MAX_AGE)
  }

  const value = useMemo<SucursalContextType>(
    () => ({
      sucursalActiva,
      sucursales: lista,
      setSucursalActiva,
      sucursalId: sucursalActiva?.id ?? "",
      isLoading,
    }),
    [sucursalActiva, lista, isLoading]
  )

  return <SucursalContext.Provider value={value}>{children}</SucursalContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSucursal() {
  const context = useContext(SucursalContext)
  if (!context) {
    throw new Error("useSucursal debe usarse dentro de un SucursalProvider")
  }
  return context
}
