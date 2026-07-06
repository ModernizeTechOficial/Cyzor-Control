import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AIService } from '../services/AIService';

export class AIController {
  static async chat(req: AuthRequest, res: Response) {
    try {
      const { message, prompt, context, agentId, overrideAgent } = req.body;
      const actualMessage = message || prompt;
      
      const response = await AIService.execute({
        message: actualMessage,
        context,
        userId: req.user?.uid || 'anonymous', 
        workspaceId: req.workspaceId?.toString() || 'default',
        tenantId: req.tenantId || 'default',
        agentId: agentId || 'workspace-assistant',
        overrideAgent
      });
      
      res.json({
        ...response,
        text: response.message
      });
    } catch (error) {
      console.error('AIController chat error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI processing failed' });
    }
  }

  static async executeAction(req: AuthRequest, res: Response) {
    try {
      const { actionId, entityId, additionalInput, overrideAgent } = req.body;
      const response = await AIService.executeAction({
        actionId,
        entityId,
        additionalInput,
        userId: req.user?.uid || 'anonymous',
        workspaceId: req.workspaceId?.toString() || 'default',
        tenantId: req.tenantId || 'default',
        overrideAgent
      });
      res.json({ text: response, message: response });
    } catch (error) {
      console.error('AIController executeAction error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI Action failed' });
    }
  }
}
