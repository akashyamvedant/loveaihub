import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Use DATABASE_URL from environment or fallback to Supabase connection
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.gfrpidhedgqixkgafumc:[AKraj@$5630]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
