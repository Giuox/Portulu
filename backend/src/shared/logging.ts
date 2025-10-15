import appInsights from "applicationinsights";

let aiStarted = false;

export function startAppInsights(): void {
  if (aiStarted) return;
  const key = process.env.APPINSIGHTS_INSTRUMENTATIONKEY || process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!key) return;
  if (key.startsWith("InstrumentationKey=") || key.includes(";")) {
    appInsights.setup(key);
  } else {
    appInsights.setup().setAutoCollectDependencies(true).setAutoCollectPerformance(true).setAutoCollectRequests(true);
    appInsights.defaultClient.config.instrumentationKey = key;
  }
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "functions-api";
  appInsights.start();
  aiStarted = true;
}

export function logInfo(message: string, props?: Record<string, unknown>): void {
  if (!aiStarted) startAppInsights();
  appInsights.defaultClient?.trackTrace({ message, severity: 1, properties: props });
}

export function logError(error: Error, props?: Record<string, unknown>): void {
  if (!aiStarted) startAppInsights();
  appInsights.defaultClient?.trackException({ exception: error, properties: props });
}

