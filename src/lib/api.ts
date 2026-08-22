import type { ApiResponse } from "@/types/common";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiRequestOptions extends RequestInit {
  responseType?: "json" | "blob";
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ============================================================
 * Construction des headers
 * ========================================================== */

function createHeaders(options: RequestInit): Headers {
  const headers = new Headers(options.headers);

  /*
   * FormData doit laisser le navigateur
   * définir automatiquement le Content-Type
   * avec son boundary.
   */
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

/* ============================================================
 * Gestion des erreurs JSON
 * ========================================================== */

async function extractApiError(response: Response): Promise<never> {
  let errorData: unknown;

  try {
    errorData = await response.json();
  } catch {
    errorData = undefined;
  }

  let message = "Une erreur est survenue";

  if (typeof errorData === "object" && errorData !== null) {
    if ("message" in errorData && typeof errorData.message === "string") {
      message = errorData.message;
    } else if ("detail" in errorData && typeof errorData.detail === "string") {
      message = errorData.detail;
    }
  }

  throw new ApiError(message, response.status, errorData);
}

/* ============================================================
 * Requête JSON
 * ========================================================== */

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const headers = createHeaders(options);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    await extractApiError(response);
  }

  const json = await response.json();

  if (!json.success) {
    const message = json.message ?? json.detail ?? "Une erreur est survenue";

    throw new ApiError(message, response.status, json);
  }

  return json as ApiResponse<T>;
}

/* ============================================================
 * Requête Blob
 * ========================================================== */

async function requestBlob(
  path: string,
  options: RequestInit = {},
): Promise<Blob> {
  const headers = createHeaders(options);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    await extractApiError(response);
  }

  return response.blob();
}

/* ============================================================
 * API publique
 * ========================================================== */

export const api = {
  get: <T>(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> =>
    requestJson<T>(path, {
      method: "GET",
      ...options,
    }),

  getBlob: (
    path: string,
    options?: Omit<ApiRequestOptions, "responseType">,
  ): Promise<Blob> =>
    requestBlob(path, {
      method: "GET",
      ...options,
    }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> =>
    requestJson<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> =>
    requestJson<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> =>
    requestJson<T>(path, {
      method: "DELETE",
      ...options,
    }),

  upload: <T>(
    path: string,
    formData: FormData,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> =>
    requestJson<T>(path, {
      method: "POST",
      body: formData,
      ...options,
    }),
};

export { ApiError };
