"use client";

import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Marge de sécurité : on rafraîchit un peu avant l'expiration réelle plutôt
// que pile dessus.
const SAFETY_MARGIN_SECONDS = 30;

// Si le cookie d'expiration est absent/illisible (utilisateur pas encore
// connecté, cookie pas encore posé...), on retente à cet intervalle plutôt
// que de ne rien programmer du tout.
const FALLBACK_RETRY_MS = 60_000;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Lit `access_token_expires_at` (cookie non-httpOnly ne contenant qu'un
 * timestamp epoch, posé par le backend à chaque login/refresh). On ne lit
 * JAMAIS l'access token lui-même : il est httpOnly, donc illisible en JS —
 * c'est justement pour ça que le backend expose cette date séparément.
 */
function getAccessTokenExpiresAt(): number | null {
  const raw = readCookie("access_token_expires_at");
  if (!raw) return null;
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds : null;
}

/**
 * Veille automatique d'authentification, 100% dynamique : calcule le délai
 * exact restant avant expiration à partir de la vraie date renvoyée par le
 * backend (aucune durée figée en dur côté front — si la durée de vie du
 * token change côté backend un jour, rien à changer ici).
 *
 * - Refresh réussi → le backend a déjà réinjecté les nouveaux cookies
 *   (access_token, refresh_token, et access_token_expires_at mis à jour) ;
 *   on relit ce nouveau timestamp et on reprogramme le prochain cycle sur
 *   sa vraie durée exacte.
 * - Refresh échoué → redirection vers /login.
 *
 * À monter une seule fois, tout en haut du layout des routes authentifiées :
 *
 *   export default function DashboardLayout({ children }) {
 *     useAuthWatcher();
 *     return <>{children}</>;
 *   }
 */
export function useAuthWatcher() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleNext = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const expiresAt = getAccessTokenExpiresAt();

      if (expiresAt === null) {
        timeoutRef.current = setTimeout(scheduleNext, FALLBACK_RETRY_MS);
        return;
      }

      const nowSeconds = Date.now() / 1000;
      const delayMs = Math.max(
        (expiresAt - nowSeconds - SAFETY_MARGIN_SECONDS) * 1000,
        0,
      );

      timeoutRef.current = setTimeout(async () => {
        try {
          const res = await authService.refresh();

          if (!res.success) {
            router.replace("/login");
            return;
          }

          // Le backend a posé un nouveau access_token_expires_at : on relit
          // cette vraie valeur pour programmer le prochain cycle exactement.
          scheduleNext();
        } catch {
          router.replace("/login");
        }
      }, delayMs);
    };

    scheduleNext();

    // Les timers JS sont ralentis/suspendus quand l'onglet est en
    // arrière-plan (throttling navigateur, veille mobile...). Au retour au
    // premier plan, on recalcule immédiatement le délai réel plutôt que de
    // faire confiance à un setTimeout qui a pu prendre du retard.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") scheduleNext();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);
}
