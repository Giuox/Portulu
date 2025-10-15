import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { z } from "zod";
import { json } from "../../../shared/http";
import { withCors } from "../../../shared/cors";
import { publishEvent } from "../../../shared/events";

const bodySchema = z.object({
  orderId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export async function tracking(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  if (req.method === "OPTIONS") return withCors(req, json({}));
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return withCors(req, json({ error: "invalid_body" }, 400));
  const { orderId, lat, lng } = parsed.data;
  await publishEvent("portulu.rider.location.updated", { orderId, lat, lng });
  return withCors(req, json({ ok: true }));
}

app.http("rider-tracking", {
  methods: ["POST", "OPTIONS"],
  authLevel: "function",
  route: "rider/tracking",
  handler: tracking
});

