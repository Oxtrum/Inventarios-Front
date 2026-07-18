import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authService } from "@/services/auth"
import { getToken, setToken, clearToken } from "@/lib/api"
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

  useEffect(() => {
    const savedToken = getToken()
    if (!savedToken) {
      return
    }
    authService.me()
      .then((data) => {
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
      })
      .catch(() => {
        clearToken()
        setTokenState(null)
        setUser(null)
        setPermisos([])
        setAlcanceDatos(null)
        setSucursalPrincipalId(null)
        setSucursalesPermitidas([])
      })
      .finally(() => setIsLoading(false))
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
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
    setPermisos([])
    setAlcanceDatos(null)
    setSucursalPrincipalId(null)
    setSucursalesPermitidas([])
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
