import { db } from './src/db/index.ts';
import { companies, workspaces, tenants } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

async function run() {
  try {
    const allCompanies = await db.select({
      id: companies.id,
      name: companies.name,
      cnpj: companies.cnpj,
      industry: companies.industry,
      size: companies.size,
      website: companies.website,
      status: companies.status,
      createdAt: companies.createdAt,
      workspaceId: companies.workspaceId,
      workspaceName: workspaces.name,
      tenantId: companies.tenantId,
      tenantName: tenants.name,
    })
    .from(companies)
    .leftJoin(workspaces, eq(companies.workspaceId, workspaces.id))
    .leftJoin(tenants, eq(companies.tenantId, tenants.id))
    .orderBy(desc(companies.createdAt));
    console.log(allCompanies);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
run();
