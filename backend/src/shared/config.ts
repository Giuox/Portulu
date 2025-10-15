import { z } from "zod";

const envSchema = z.object({
  PGHOST: z.string().min(1),
  PGPORT: z.string().default("5432"),
  PGDATABASE: z.string().min(1),
  PGUSER: z.string().min(1),
  PGPASSWORD: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
  JWT_ISSUER: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default("*")
});

export const env = envSchema.parse(process.env as unknown as Record<string, string>);

