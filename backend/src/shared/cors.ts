import type { HttpRequest, HttpResponseInit } from "@azure/functions";
import { env } from "./config";
import { getRequestOrigin } from "./http";

export function withCors(req: HttpRequest, res: HttpResponseInit): HttpResponseInit {
  const origin = getRequestOrigin(req);
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  const isAllowed = origin && (allowed.includes("*") || allowed.includes(origin));
  return {
    ...res,
    headers: {
      ...(res.headers || {}),
      ...(isAllowed
        ? {
            "access-control-allow-origin": origin!,
            "vary": "origin",
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": "authorization,content-type",
            "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS"
          }
        : {})
    }
  };
}

