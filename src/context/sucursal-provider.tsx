import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { getCookie, setCookie } from "@/lib/cookies"
import { useSucursales } from "@/hooks/useSucursales"
import { useAuth } from "@/context/auth-provider"
import type { SucursalPermitida } from "@/types/auth"

const SUCURSAL_COOKIE_NAME = "sucursal_activa_id"
const SUCURSAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias
// Centinela para distinguir "el usuario eligió Todas" de "aún no eligió nada"
// (sin cookie => por defecto se usa la primera sucursal, no Todas).
const TODAS = "todas"

interface SucursalContextType {
  /** null => "Todas las sucursales" (sin filtro por sucursal). */
  sucursalActiva: SucursalPermitida | null
  sucursales: SucursalPermitida[]
  setSucursalActiva: (sucursal: SucursalPermitida | null) => void
  /** id de la sucursal activa, o "" cuando es "Todas". Listo para pasar como filtro. */
  sucursalId: string
  isLoading: boolean
  puedeSeleccionarTodas: boolean
}

const SucursalContext = createContext<SucursalContextType | null>(null)

export function SucursalProvider({ children }: { children: React.ReactNode }) {
  const {
    alcanceDatos,
    sucursalPrincipalId,
    sucursalesPermitidas,
    hasPermission,
  } = useAuth()
  const usaAlcanceLocal = alcanceDatos === "sucursales"
  const puedeListarSucursales = hasPermission("sucursales:leer")
  const { data: sucursales, isLoading: isLoadingSucursales } = useSucursales(
    { activo: "true" },
    { enabled: !usaAlcanceLocal && puedeListarSucursales }
  )
  // "" (sin cookie) => usar primera sucursal; TODAS => Todas; <id> => esa sucursal.
  const [seleccion, setSeleccion] = useState<string>(() => getCookie(SUCURSAL_COOKIE_NAME) ?? "")

  const lista = useMemo(
    () => usaAlcanceLocal ? sucursalesPermitidas : (sucursales ?? []),
    [usaAlcanceLocal, sucursalesPermitidas, sucursales]
  )
  const puedeSeleccionarTodas = !usaAlcanceLocal
  const isLoading = !usaAlcanceLocal && puedeListarSucursales && isLoadingSucursales

  // Sucursal activa derivada de la lista:
  // - TODAS => null (todas las sucursales)
  // - id valido => esa sucursal
  // - sin eleccion previa (o id obsoleto) => por defecto la primera sucursal
  const sucursalActiva = useMemo<SucursalPermitida | null>(() => {
    if (seleccion === TODAS && puedeSeleccionarTodas) return null
    const encontrada = lista.find((s) => s.id === seleccion)
    if (encontrada) return encontrada
    return lista.find((s) => s.id === sucursalPrincipalId) ?? lista[0] ?? null
  }, [lista, puedeSeleccionarTodas, seleccion, sucursalPrincipalId])

  const setSucursalActiva = useCallback((sucursal: SucursalPermitida | null) => {
    const fallback = lista.find((item) => item.id === sucursalPrincipalId) ?? lista[0]
    const seleccionValida = sucursal ?? (puedeSeleccionarTodas ? null : fallback)
    const valor = seleccionValida ? seleccionValida.id : TODAS
    setSeleccion(valor)
    setCookie(SUCURSAL_COOKIE_NAME, valor, SUCURSAL_COOKIE_MAX_AGE)
  }, [lista, puedeSeleccionarTodas, sucursalPrincipalId])

  const value = useMemo<SucursalContextType>(
    () => ({
      sucursalActiva,
      sucursales: lista,
      setSucursalActiva,
      sucursalId: sucursalActiva?.id ?? "",
      isLoading,
      puedeSeleccionarTodas,
    }),
    [sucursalActiva, lista, setSucursalActiva, isLoading, puedeSeleccionarTodas]
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
