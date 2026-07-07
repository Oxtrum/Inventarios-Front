import { api } from "@/lib/api"
import type { LoginRequest, LoginResponse, AuthContextData } from "@/types/auth"

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", data),

  me: () =>
    api.get<AuthContextData>("/auth/me"),
}
