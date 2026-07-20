import { db } from './src/db/index.ts';
import { 
  companies, products, projects, financeEntries, deploys, 
  tasks, workspaceMembers, agendaEvents, clients, ideas, notifications 
} from './src/db/schema.ts';

async function testTable(name: string, query: any) {
  try {
    const res = await query;
    console.log(`✅ Table "${name}" queried successfully. Count: ${res.length}`);
  } catch (err: any) {
    console.error(`❌ Table "${name}" failed:`, err.message || err);
  }
}

async function run() {
  console.log("Starting database tables test...");
  await testTable("companies", db.select().from(companies).limit(1));
  await testTable("products", db.select().from(products).limit(1));
  await testTable("projects", db.select().from(projects).limit(1));
  await testTable("financeEntries", db.select().from(financeEntries).limit(1));
  await testTable("deploys", db.select().from(deploys).limit(1));
  await testTable("tasks", db.select().from(tasks).limit(1));
  await testTable("workspaceMembers", db.select().from(workspaceMembers).limit(1));
  await testTable("agendaEvents", db.select().from(agendaEvents).limit(1));
  await testTable("clients", db.select().from(clients).limit(1));
  await testTable("ideas", db.select().from(ideas).limit(1));
  await testTable("notifications", db.select().from(notifications).limit(1));
  console.log("Database tables test completed.");
  process.exit();
}

run();
