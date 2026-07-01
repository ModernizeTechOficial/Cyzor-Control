import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

function getDatabaseUrl(): string {
  return "postgresql://cyzor_control_user:8e8be4c12906a1c87619c3d1ac2ae37cf65b@72.60.247.117:5432/cyzor_control_db";
}

const dbUrl = getDatabaseUrl();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
});


