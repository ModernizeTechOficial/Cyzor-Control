import { Request, Response } from 'express';
import { AIRouterService } from '../services/AIRouterService';

const aiRouter = new AIRouterService();

export class AIController {
  static async chat(req: Request, res: Response) {
    try {
      const { message, context, provider } = req.body;
      const response = await aiRouter.chat({
        message,
        context,
        userId: req.body.userId, // Should get from Auth
        workspaceId: req.body.workspaceId, // Should get from Auth
      }, provider);
      
      res.json(response);
    } catch (error) {
      console.error('AIController chat error:', error);
      res.status(500).json({ error: 'AI processing failed' });
    }
  }
}
