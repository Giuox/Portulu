import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { json } from "../../../shared/http";
import { withCors } from "../../../shared/cors";
import { getBearerToken, verifyJwt } from "../../../shared/security";

export async function getProfile(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  if (req.method === "OPTIONS") return withCors(req, json({}));
  const token = getBearerToken(req);
  if (!token) return withCors(req, json({ error: "unauthorized" }, 401));
  const auth = verifyJwt(token);
  // TODO: load profile from DB
  return withCors(req, json({ id: auth.sub, roles: auth.roles }));
}

app.http("profile-get", {
  methods: ["GET", "OPTIONS"],
  authLevel: "function",
  route: "profile",
  handler: getProfile
});

