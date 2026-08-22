import { api } from "@/lib/api";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";

export const authService = {
  register: (data: RegisterRequest) => api.post<User>("/auth/register", data),

  verifyEmail: (token: string) =>
    api.post<null>("/auth/verify-email", { token }),

  login: (data: LoginRequest) => api.post<{ user: User }>("/auth/login", data),

  logout: () => api.post<null>("/auth/logout"),

  refresh: () => api.post<null>("/auth/refresh"),

  me: () => api.get<User>("/auth/me"),

  forgotPassword: (email: string) =>
    api.post<null>("/auth/forgot-password", { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post<null>("/auth/reset-password", { token, new_password }),

  changePassword: (current_password: string, new_password: string) =>
    api.patch<null>("/auth/change-password", {
      current_password,
      new_password,
    }),
};
