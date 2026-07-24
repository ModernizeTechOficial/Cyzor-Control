import { db } from './src/db/index.ts';
import { workspaceMembers } from './src/db/schema.ts';

(async () => {
  const memberValues = {
    tenantId: '00000000-0000-0000-0000-000000000000',
    workspaceId: 1,
    userUid: 'abc',
    role: 'OWNER',
    cargo: 'Proprietário',
    department: 'Administração',
    teamName: 'Owner',
    managerUid: null,
    permissions: [],
    status: 'Ativo',
    onboardingCompleted: false,
  };

  try {
    const result = await db.transaction(async (tx) => {
      return await tx.insert(workspaceMembers).values(memberValues).returning({ id: workspaceMembers.id });
    });
    console.log('RESULT', result);
  } catch (error: any) {
    console.error('RAW_ERROR_NAME', error?.name);
    console.error('RAW_ERROR_MESSAGE', error?.message);
    console.error('RAW_ERROR_CODE', error?.code);
    console.error('RAW_ERROR_CONSTRAINT', error?.constraint);
    console.error('RAW_ERROR_DETAIL', error?.detail);
    console.error('RAW_ERROR_HINT', error?.hint);
    console.error('RAW_ERROR_TABLE', error?.table);
    console.error('RAW_ERROR_COLUMN', error?.column);
    console.error('RAW_ERROR', error);
    if (error && typeof error === 'object') {
      console.error('OWN_KEYS', Object.getOwnPropertyNames(error));
      for (const key of Object.getOwnPropertyNames(error)) {
        console.error('KEY', key, error[key]);
      }
    }
  } finally {
    process.exit(0);
  }
})();
