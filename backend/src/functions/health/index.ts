import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { json } from "../../shared/http";
import { withCors } from "../../shared/cors";

export async function health(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const res = json({ status: "ok", timestamp: new Date().toISOString() });
  return withCors(req, res);
}

app.http("health", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "health",
  handler: health
});

