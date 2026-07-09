const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const REQUEST_TIMEOUT_MS = 12000;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("medcarex_token");
}

export function setSession(data) {
  localStorage.setItem("medcarex_token", data.token);
  localStorage.setItem("medcarex_user", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("medcarex_token");
  localStorage.removeItem("medcarex_user");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("medcarex_user");
  return raw ? JSON.parse(raw) : null;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  let data;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    data = await response.json().catch(() => ({}));
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Request timed out. Please check the API server."
      : "Unable to reach the API server.";
    const apiError = new Error(message);
    apiError.status = 0;
    throw apiError;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const apiError = new Error(data.message || "Request failed.");
    apiError.status = response.status;
    apiError.requestId = data.requestId;
    throw apiError;
  }
  return data;
}
