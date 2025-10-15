import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { json } from "../../../shared/http";
import { withCors } from "../../../shared/cors";

export async function listRestaurants(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const data = [
    { id: "11111111-1111-1111-1111-111111111111", name: "Ristorante A" },
    { id: "22222222-2222-2222-2222-222222222222", name: "Ristorante B" }
  ];
  return withCors(req, json({ data }));
}

app.http("restaurants-list", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "restaurants",
  handler: listRestaurants
});

