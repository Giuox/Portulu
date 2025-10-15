import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { z } from "zod";
import { json } from "../../../../shared/http";
import { withCors } from "../../../../shared/cors";
import { publishEvent } from "../../../../shared/events";
import { getPgPool } from "../../../../shared/db";

const bodySchema = z.object({
  restaurantId: z.string().uuid(),
  isOpen: z.boolean()
});

export async function updateAvailability(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  if (req.method === "OPTIONS") return withCors(req, json({}));
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return withCors(req, json({ error: parsed.error.message }, 400));
  const { restaurantId, isOpen } = parsed.data;
  const pool = getPgPool();
  const { rowCount } = await pool.query(`update restaurants set is_open = $1 where id = $2`, [isOpen, restaurantId]);
  if (rowCount === 0) return withCors(req, json({ error: "restaurant_not_found" }, 404));
  await publishEvent("portulu.restaurant.availability.updated", { restaurantId, isOpen });
  return withCors(req, json({ ok: true }));
}

app.http("restaurants-availability-update", {
  methods: ["POST", "OPTIONS"],
  authLevel: "function",
  route: "restaurants/availability",
  handler: updateAvailability
});

