import { db } from '../db/index.ts';
import { roles, rolePermissions, permissions, modules, resources } from '../db/schema.ts';
import { roleEngine } from '../lib/bos/authorization/RoleEngine';
import { moduleRegistry } from '../lib/bos/module-registry/ModuleRegistry';

async function seed() {
  console.log('🌱 Starting BOS seed...');

  // Get first tenant or create one
  const { tenants } = await import('../db/schema.ts');
  const { eq } = await import('drizzle-orm');
  
  const [tenant] = await db.select().from(tenants).limit(1);
  const tenantId = tenant?.id || 'default-tenant';

  console.log(`📦 Using tenant: ${tenantId}`);

  // Seed system roles
  console.log('👥 Seeding system roles...');
  const createdRoles = await roleEngine.seedSystemRoles(tenantId);
  console.log(`   Created ${createdRoles.length} system roles`);

  // Seed builtin modules
  console.log('📦 Seeding builtin modules...');
  await moduleRegistry.registerBuiltinModules(tenantId);
  console.log('   Builtin modules registered');

  console.log('✅ BOS seed completed successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
