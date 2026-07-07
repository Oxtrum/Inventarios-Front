import type { ApiResponse } from "@/types/common"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

const TOKEN_KEY = "auth_token"

function getToken(): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(^| )${TOKEN_KEY}=([^;]+)`))
    return match ? decodeURIComponent(match[2]) : localStorage.getItem(TOKEN_KEY)
  } catch {
    return localStorage.getItem(TOKEN_KEY)
  }
}

function setToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=strict`
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
  localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  status: number
  codigo: number

  constructor(status: number, mensaje: string, codigo: number) {
    super(mensaje)
    this.name = "ApiError"
    this.status = status
    this.codigo = codigo
  }
}

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  })

  if (response.status === 401) {
    clearToken()
    window.location.href = "/login"
    throw new ApiError(401, "Sesión expirada", 401)
  }

  let json: ApiResponse<T>
  try {
    json = await response.json()
  } catch {
    throw new ApiError(response.status, "Error al procesar la respuesta del servidor", response.status)
  }

  if (json.error || !response.ok) {
    throw new ApiError(response.status, json.mensaje || "Error desconocido", json.codigo)
  }

  return json.data
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),

  del: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
}

export { getToken, setToken, clearToken, ApiError }
export type { RequestOptions }
