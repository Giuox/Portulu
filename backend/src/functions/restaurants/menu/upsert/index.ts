import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { z } from "zod";
import { json } from "../../../../shared/http";
import { withCors } from "../../../../shared/cors";
import { getPgPool } from "../../../../shared/db";
import { randomUUID } from "node:crypto";

const bodySchema = z.object({
  restaurantId: z.string().uuid(),
  products: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1),
      priceCents: z.number().int().positive(),
      available: z.boolean().default(true)
    })
  )
});

export async function upsertMenu(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  if (req.method === "OPTIONS") return withCors(req, json({}));
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return withCors(req, json({ error: parsed.error.message }, 400));
  const { restaurantId, products } = parsed.data;
  const pool = getPgPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const p of products) {
      if (p.id) {
        await client.query(
          `update products set name = $1, price_cents = $2, available = $3 where id = $4 and restaurant_id = $5`,
          [p.name, p.priceCents, p.available, p.id, restaurantId]
        );
      } else {
        await client.query(
          `insert into products (id, restaurant_id, name, price_cents, available) values ($1, $2, $3, $4, $5)`,
          [randomUUID(), restaurantId, p.name, p.priceCents, p.available]
        );
      }
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    const msg = e instanceof Error ? e.message : "menu_error";
    return withCors(req, json({ error: msg }, 400));
  } finally {
    client.release();
  }
  return withCors(req, json({ ok: true }));
}

app.http("restaurants-menu-upsert", {
  methods: ["POST", "OPTIONS"],
  authLevel: "function",
  route: "restaurants/menu",
  handler: upsertMenu
});

