import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { z } from "zod";
import { json } from "../../../shared/http";
import { withCors } from "../../../shared/cors";
import { publishEvent } from "../../../shared/events";

const bodySchema = z.object({
  orderId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  method: z.enum(["stripe", "paypal"])
});

export async function createPayment(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  if (req.method === "OPTIONS") return withCors(req, json({}));
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return withCors(req, json({ error: "invalid_body" }, 400));
  const paymentId = "pay_" + Math.random().toString(36).slice(2);
  await publishEvent("portulu.payment.created", { ...parsed.data, paymentId });
  return withCors(req, json({ paymentId, status: "authorized" }, 201));
}

app.http("payments-create", {
  methods: ["POST", "OPTIONS"],
  authLevel: "function",
  route: "payments",
  handler: createPayment
});

