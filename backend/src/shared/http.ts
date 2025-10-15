import type { HttpRequest, HttpResponseInit } from "@azure/functions";

export function json(body: unknown, status: number = 200, headers: Record<string, string> = {}): HttpResponseInit {
  return {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export function getRequestOrigin(req: HttpRequest): string | undefined {
  return req.headers.get("origin") ?? req.headers.get("x-forwarded-origin") ?? undefined;
}

