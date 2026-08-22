"use client";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";

export function useAuth() {
  const { user, setUser, clearUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Vérifie la session au montage si pas déjà authentifié
    if (!isAuthenticated) {
      authService
        .me()
        .then((res) => {
          if (res.data) setUser(res.data);
        })
        .catch(() => clearUser());
    }
  }, []);

  return { user, isAuthenticated };
}
