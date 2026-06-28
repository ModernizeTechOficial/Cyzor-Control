const fs = require('fs');
let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

// Replace imports
schema = schema.replace(
  /import \{ pgTable, serial, text, timestamp, boolean, integer, decimal, jsonb \} from 'drizzle-orm\/pg-core';/,
  "import { sqliteTable, text, integer, real as decimal } from 'drizzle-orm/sqlite-core';\nimport { sql } from 'drizzle-orm';"
);

// We replace pgTable to sqliteTable
schema = schema.replace(/pgTable/g, 'sqliteTable');

// Replace timestamp
schema = schema.replace(/timestamp\((.*?)\)/g, 'integer($1, { mode: "timestamp_ms" })');
// Default now
schema = schema.replace(/\.defaultNow\(\)/g, '.default(sql`(unixepoch() * 1000)`)');

// Replace serial -> integer pk auto increment
schema = schema.replace(/serial\((.*?)\)\.primaryKey\(\)/g, 'integer($1).primaryKey({ autoIncrement: true })');

// Replace boolean -> integer mode boolean
schema = schema.replace(/boolean\((.*?)\)/g, 'integer($1, { mode: "boolean" })');

// Replace jsonb -> text mode json
schema = schema.replace(/jsonb\((.*?)\)/g, 'text($1, { mode: "json" })');

// Replace decimal -> real
schema = schema.replace(/decimal\((.*?),\s*\{.*?\}\)/g, 'decimal($1)');

fs.writeFileSync('src/db/schema.ts', schema);
console.log('Done converting schema');
