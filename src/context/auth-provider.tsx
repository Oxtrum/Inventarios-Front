import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authService } from "@/services/auth"
import { ApiError, getToken, setToken, clearToken } from "@/lib/api"
import type { AlcanceDatos, SucursalPermitida, UsuarioSesion } from "@/types/auth"

interface AuthContextType {
  user: UsuarioSesion | null
  token: string | null
  permisos: string[]
  alcanceDatos: AlcanceDatos | null
  sucursalPrincipalId: string | null
  sucursalesPermitidas: SucursalPermitida[]
  isAuthenticated: boolean
  isLoading: boolean
  authError: unknown
  retryAuth: () => void
  login: (codigoOrganizacion: string, usuario: string, contrasena: string) => Promise<void>
  logout: () => void
  hasPermission: (permiso: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioSesion | null>(null)
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [permisos, setPermisos] = useState<string[]>([])
  const [alcanceDatos, setAlcanceDatos] = useState<AlcanceDatos | null>(null)
  const [sucursalPrincipalId, setSucursalPrincipalId] = useState<string | null>(null)
  const [sucursalesPermitidas, setSucursalesPermitidas] = useState<SucursalPermitida[]>([])
  const [isLoading, setIsLoading] = useState(() => !!getToken())
  const [authError, setAuthError] = useState<unknown>(null)
  const [authRetry, setAuthRetry] = useState(0)

  useEffect(() => {
    const savedToken = getToken()
    if (!savedToken) {
      return
    }
    let cancelled = false
    authService.me()
      .then((data) => {
        if (cancelled) return
        setUser({
          id: data.usuarioId,
          organizacionId: data.organizacionId,
          email: "",
          rolId: data.rolId,
          rolCodigo: data.rolCodigo,
          fechaCreacion: "",
        })
        setPermisos(data.permisos)
        setAlcanceDatos(data.alcanceDatos ?? null)
        setSucursalPrincipalId(data.sucursalPrincipalId ?? null)
        setSucursalesPermitidas(data.sucursalesPermitidas ?? [])
        setAuthError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          clearToken()
          setTokenState(null)
          setUser(null)
          setPermisos([])
          setAlcanceDatos(null)
          setSucursalPrincipalId(null)
          setSucursalesPermitidas([])
          return
        }
        setAuthError(error)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [authRetry])

  const retryAuth = useCallback(() => {
    setAuthError(null)
    setIsLoading(true)
    setAuthRetry((current) => current + 1)
  }, [])

  const login = useCallback(async (codigoOrganizacion: string, usuario: string, contrasena: string) => {
    const response = await authService.login({
      codigoOrganizacion,
      email: usuario,
      contrasena,
    })
    setToken(response.token)
    setTokenState(response.token)
    setUser(response.usuario)
    setPermisos(response.permisos)
    setAlcanceDatos(response.alcanceDatos ?? response.usuario.alcanceDatos ?? null)
    setSucursalPrincipalId(response.sucursalPrincipalId ?? response.usuario.sucursalPrincipalId ?? null)
    setSucursalesPermitidas(response.sucursalesPermitidas ?? response.usuario.sucursalesPermitidas ?? [])
    setAuthError(null)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
    setPermisos([])
    setAlcanceDatos(null)
    setSucursalPrincipalId(null)
    setSucursalesPermitidas([])
    setAuthError(null)
  }, [])

  const hasPermission = useCallback((permiso: string) => {
    return permisos.includes(permiso)
  }, [permisos])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permisos,
        alcanceDatos,
        sucursalPrincipalId,
        sucursalesPermitidas,
        isAuthenticated: !!token && !!user,
        isLoading,
        authError,
        retryAuth,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}
