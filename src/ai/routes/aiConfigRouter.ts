import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../../middleware/tenant';
import { db } from '../../db';
import { aiProviders } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// GET /api/ai/config/providers
router.get('/providers', requireAuth, tenantMiddleware as any, async (req: TenantRequest, res: Response) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID required' });

    const providers = await db.select({
      id: aiProviders.id,
      name: aiProviders.name,
      enabled: aiProviders.enabled,
      apiKey: aiProviders.apiKey, // We'll mask this on the frontend or here
      baseUrl: aiProviders.baseUrl,
      defaultModel: aiProviders.defaultModel
    })
    .from(aiProviders)
    .where(eq(aiProviders.workspaceId, workspaceId));

    // Mask API keys
    const maskedProviders = providers.map(p => ({
      ...p,
      apiKey: p.apiKey ? `****${p.apiKey.slice(-4)}` : ''
    }));

    res.json(maskedProviders);
  } catch (error: any) {
    console.error('Error fetching AI providers:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/config/providers
router.post('/providers', requireAuth, tenantMiddleware as any, async (req: TenantRequest, res: Response) => {
  try {
    const workspaceId = req.workspaceId;
    const tenantId = req.tenantId;
    if (!workspaceId || !tenantId) return res.status(400).json({ error: 'Workspace and Tenant required' });

    const { name, apiKey, enabled, baseUrl, defaultModel } = req.body;

    if (!name) return res.status(400).json({ error: 'Provider name required' });

    // Check if exists
    const [existing] = await db.select()
      .from(aiProviders)
      .where(
        and(
          eq(aiProviders.name, name),
          eq(aiProviders.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (existing) {
      await db.update(aiProviders)
        .set({
          apiKey: apiKey || existing.apiKey,
          enabled: enabled !== undefined ? enabled : existing.enabled,
          baseUrl: baseUrl !== undefined ? baseUrl : existing.baseUrl,
          defaultModel: defaultModel !== undefined ? defaultModel : existing.defaultModel,
          updatedAt: new Date()
        })
        .where(eq(aiProviders.id, existing.id));
    } else {
      await db.insert(aiProviders).values({
        workspaceId,
        tenantId,
        name,
        apiKey: apiKey || '',
        enabled: enabled !== undefined ? enabled : true,
        baseUrl: baseUrl || null,
        defaultModel: defaultModel || null,
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving AI provider:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
