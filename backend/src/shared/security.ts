import jwt from "jsonwebtoken";
import type { HttpRequest } from "@azure/functions";
import { env } from "./config";

export type AuthContext = {
  sub: string;
  roles: string[];
};

export function getBearerToken(req: HttpRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function verifyJwt(token: string): AuthContext {
  const decoded = jwt.verify(token, undefined as unknown as jwt.Secret, {
    audience: env.JWT_AUDIENCE,
    issuer: env.JWT_ISSUER,
    complete: false
  }) as jwt.JwtPayload;
  const roles = Array.isArray(decoded.roles) ? (decoded.roles as string[]) : [];
  return { sub: decoded.sub as string, roles };
}

export function requireRole(ctx: AuthContext, allowed: string[]): void {
  const ok = ctx.roles.some((r) => allowed.includes(r));
  if (!ok) throw new Error("forbidden");
}

