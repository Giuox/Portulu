type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api"; // SWA proxies to Functions

async function request<T>(path: string, method: HttpMethod, body?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers["authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include"
  });
  if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export const api = {
  health: () => request<{ status: string }>("/health", "GET"),
  listRestaurants: () => request<{ data: unknown[] }>("/restaurants", "GET"),
  createOrder: (payload: { restaurantId: string; items: { productId: string; quantity: number }[]; notes?: string }) =>
    request<{ orderId: string }>("/orders", "POST", payload),
  login: (idToken: string) => request<{ ok: boolean }>("/auth/login", "POST", { idToken }),
  // Temporary helpers for current Next API routes until B2C is fully integrated
  loginPassword: (payload: { email: string; password: string }) =>
    fetch(`/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' })
      .then(async (r) => ({ ok: r.ok, data: await r.json() })),
  register: (payload: { email: string; password: string; name: string; phone?: string; role: 'customer'|'restaurant'|'rider'|'admin' }) =>
    fetch(`/api/auth/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' })
      .then(async (r) => ({ ok: r.ok, data: await r.json() })),
  getProfile: (token: string) => request<{ id: string; roles: string[] }>("/profile", "GET", undefined, token),
  createPayment: (payload: { orderId: string; amountCents: number; method: "stripe" | "paypal" }) =>
    request<{ paymentId: string; status: string }>("/payments", "POST", payload),
  riderTracking: (payload: { orderId: string; lat: number; lng: number }) => request<{ ok: boolean }>("/rider/tracking", "POST", payload),
  upsertMenu: (payload: { restaurantId: string; products: { id?: string; name: string; priceCents: number; available: boolean }[] }) =>
    request<{ ok: true }>("/restaurants/menu", "POST", payload),
  updateAvailability: (payload: { restaurantId: string; isOpen: boolean }) =>
    request<{ ok: true }>("/restaurants/availability", "POST", payload)
};

