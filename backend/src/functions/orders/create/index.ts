import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { z } from "zod";
import { json } from "../../../shared/http";
import { withCors } from "../../../shared/cors";
import { getPgPool } from "../../../shared/db";
import { randomUUID } from "node:crypto";
import { publishEvent } from "../../../shared/events";

const bodySchema = z.object({
  restaurantId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive()
    })
  ),
  notes: z.string().optional()
});

export async function createOrder(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  if (req.method === "OPTIONS") return withCors(req, json({}));
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return withCors(req, json({ error: parsed.error.message }, 400));
  const { restaurantId, items, notes } = parsed.data;
  const orderId = randomUUID();
  const pool = getPgPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const totalCents = items.reduce((sum, it) => sum + it.quantity * 1, 0); // price validated when inserting items
    await client.query(
      `insert into orders (id, user_id, restaurant_id, status, total_cents) values ($1, $2, $3, 'created', $4)`,
      [orderId, null, restaurantId, totalCents]
    );
    for (const it of items) {
      const { rows } = await client.query(`select price_cents from products where id = $1 and restaurant_id = $2`, [it.productId, restaurantId]);
      if (rows.length === 0) throw new Error("invalid_product");
      const price = rows[0].price_cents as number;
      await client.query(
        `insert into order_items (id, order_id, product_id, quantity, price_cents) values ($1, $2, $3, $4, $5)`,
        [randomUUID(), orderId, it.productId, it.quantity, price]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    const msg = e instanceof Error ? e.message : "order_error";
    return withCors(req, json({ error: msg }, 400));
  } finally {
    client.release();
  }
  await publishEvent("portulu.order.created", { orderId, restaurantId, notes: notes || null });
  return withCors(req, json({ orderId }, 201));
}

app.http("orders-create", {
  methods: ["POST", "OPTIONS"],
  authLevel: "function",
  route: "orders",
  handler: createOrder
});

