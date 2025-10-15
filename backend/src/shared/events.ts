import { EventGridPublisherClient, AzureKeyCredential, SendCloudEventInput } from "@azure/eventgrid";

let client: EventGridPublisherClient<"CloudEvent"> | null = null;

export function getEventGridClient(): EventGridPublisherClient<"CloudEvent"> {
  if (!client) {
    const endpoint = process.env.EVENT_GRID_TOPIC_ENDPOINT as string;
    const key = process.env.EVENT_GRID_TOPIC_KEY as string;
    if (!endpoint || !key) throw new Error("missing_event_grid_config");
    client = new EventGridPublisherClient(endpoint, "CloudEvent", new AzureKeyCredential(key));
  }
  return client;
}

export async function publishEvent(type: string, data: unknown, subject?: string): Promise<void> {
  const client = getEventGridClient();
  const ev: SendCloudEventInput = {
    type,
    source: "/portulu/functions",
    subject,
    data
  };
  await client.send([ev]);
}

