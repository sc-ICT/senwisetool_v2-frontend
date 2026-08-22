import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
];

// URL du backend, appelée directement depuis le serveur (middleware), jamais
// exposée au client — ne pas préfixer par NEXT_PUBLIC_.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
const REFRESH_ENDPOINT = `${BACKEND_URL}/auth/refresh`;

/** Extrait la valeur d'un cookie donné depuis une liste d'en-têtes Set-Cookie brutes. */
function extractCookieValue(
  setCookieHeaders: string[],
  name: string,
): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

/** Remplace (ou ajoute) la valeur d'un cookie donné dans un en-tête Cookie brut. */
function withUpdatedCookie(
  cookieHeader: string,
  name: string,
  value: string,
): string {
  const pairs = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !p.startsWith(`${name}=`));
  pairs.push(`${name}=${value}`);
  return pairs.join("; ");
}

interface RefreshResult {
  setCookieHeaders: string[];
  newAccessToken: string;
}

/**
 * Appelle /auth/refresh en transmettant tel quel l'en-tête Cookie reçu par
 * le serveur Next.js. NOTE IMPORTANTE : contrairement à `authService.refresh()`
 * (pensé pour le navigateur, où les cookies s'attachent automatiquement),
 * cet appel tourne côté serveur (edge) — il n'y a pas de "cookies du
 * visiteur" attachés automatiquement à un fetch() serveur, il faut les
 * transmettre nous-mêmes explicitement. C'est pourquoi le middleware a son
 * propre appel réseau plutôt que de réutiliser authService directement.
 * C'est le backend, dans /auth/refresh, qui valide seul le refresh token.
 */
async function refreshAccessToken(
  request: NextRequest,
): Promise<RefreshResult | null> {
  try {
    const res = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (!res.ok) return null;

    const setCookieHeaders = res.headers.getSetCookie
      ? res.headers.getSetCookie()
      : [];

    const newAccessToken = extractCookieValue(setCookieHeaders, "access_token");
    if (!newAccessToken) return null;

    return { setCookieHeaders, newAccessToken };
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("access_token_expires_at");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const hasToken = request.cookies.has("access_token");

  if (!hasToken && !isPublicRoute) {
    const refreshed = await refreshAccessToken(request);

    if (!refreshed) {
      // /auth/refresh a échoué (refresh token absent, expiré, invalide, ou
      // backend injoignable) → déconnexion complète.
      return redirectToLogin(request);
    }

    // Succès : on transmet le nouvel access_token à la requête en cours, ET
    // on pose les cookies pour le navigateur — l'utilisateur reste connecté.
    // (return explicite ici : on ne doit surtout pas retomber sur la
    // redirection login du dessous quand le refresh a réussi.)
    const forwardedHeaders = new Headers(request.headers);
    const updatedCookieHeader = withUpdatedCookie(
      forwardedHeaders.get("cookie") ?? "",
      "access_token",
      refreshed.newAccessToken,
    );
    forwardedHeaders.set("cookie", updatedCookieHeader);

    const response = NextResponse.next({
      request: { headers: forwardedHeaders },
    });
    for (const cookie of refreshed.setCookieHeaders) {
      response.headers.append("Set-Cookie", cookie);
    }
    return response;
  }

  if (hasToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Exclut explicitement :
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images Next.js)
     * - favicon.ico
     * - Toutes les extensions de fichiers statiques (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|mp4|mp3|pdf)).*)",
  ],
};
