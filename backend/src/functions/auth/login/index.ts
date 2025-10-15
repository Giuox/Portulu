import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { z } from "zod";
import { json } from "../../../shared/http";
import { withCors } from "../../../shared/cors";

const bodySchema = z.object({
  idToken: z.string().min(10)
});

export async function login(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  if (req.method === "OPTIONS") return withCors(req, json({}));
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return withCors(req, json({ error: "invalid_body" }, 400));
  }
  // In production, validate idToken with Azure AD B2C and mint API session/JWT
  return withCors(req, json({ ok: true }));
}

app.http("auth-login", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "auth/login",
  handler: login
});

