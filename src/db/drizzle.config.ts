import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DB_URL || process.env.DATABASE_URL;
const sqlHost = process.env.PGHOST || process.env.DB_HOST;
const sqlDbName = process.env.PGDATABASE || process.env.DB_DATABASE;
const user = process.env.PGUSER || process.env.DB_USERNAME;
const password = process.env.PGPASSWORD || process.env.DB_PASSWORD;
const port = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432;

if (!connectionString && (!sqlHost || !sqlDbName || !user || !password)) {
  throw new Error("Either DB_URL/DATABASE_URL or proper PGHOST vars must be set.");
}

if (connectionString) {
  console.log("Using Connection String for migrations.");
} else {
  console.log(`Using host ${sqlHost} and user ${user} for database migrations.`);
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: connectionString ? {
    url: connectionString,
  } : {
    host: sqlHost!,
    user: user!,
    password: password!,
    database: sqlDbName!,
    port: port,
    ssl: false,
  },
  verbose: true,
});
