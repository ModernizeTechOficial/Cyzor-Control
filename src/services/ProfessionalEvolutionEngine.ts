import { db } from '../db/index.ts';
import { professionalProfiles, professionalEvolutionEvents, notifications, auditLogs } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { EvolutionEvent, EvolutionSkillDelta } from '../types/evolution.ts';
import { getProfessionalEvolutionInfo } from '../utils/professionalEvolutionCalculator.ts';

export class ProfessionalEvolutionEngine {
  static async processEvent(event: EvolutionEvent) {
    const workspaceId = event.payload.workspaceId;
    const userUid = event.payload.userUid;
    const tenantId = event.payload.tenantId;

    if (!workspaceId || !userUid) {
      console.warn('[EvolutionEngine] Missing workspaceId or userUid in event payload', event);
      return;
    }

    const xpDelta = this.calculateXp(event);
    const skillDeltas = this.calculateSkills(event);
    const achievementKeys = this.evaluateAchievements(event);

    await this.recordEvolutionEvent(event, xpDelta, skillDeltas, achievementKeys);
    await this.applyUserEvolution(userUid, workspaceId, xpDelta, skillDeltas, achievementKeys, tenantId || '00000000-0000-0000-0000-000000000000');
    await this.notifyUser(userUid, workspaceId, xpDelta, skillDeltas, achievementKeys, event);
  }

  private static calculateXp(event: EvolutionEvent) {
    const xpMap: Record<string, number> = {
      TASK_COMPLETED: 20,
      PROJECT_COMPLETED: 250,
      DOCUMENTATION_CREATED: 30,
      IDEA_APPROVED: 40,
      AUTOMATION_CREATED: 45,
      MEETING_JOINED: 10,
      CUSTOMER_SATISFIED: 80,
      LEAD_CONVERTED: 60,
      COURSE_COMPLETED: 120,
      BUG_RESOLVED: 35,
      CUSTOMER_CREATED: 50,
      FEATURE_VALIDATED: 25,
      REVENUE_GENERATED: 80,
      DELIVERY_COMPLETED: 60,
      PLANNING_APPROVED: 40,
      PRODUCT_RELEASED: 90,
      COMPANY_CREATED: 70,
      CUSTOMER_ACQUIRED: 55,
      BUSINESS_MILESTONE_REACHED: 180
    };
    return xpMap[event.type] || 0;
  }

  private static calculateSkills(event: EvolutionEvent): EvolutionSkillDelta[] {
    const skillMap: Record<string, EvolutionSkillDelta[]> = {
      TASK_COMPLETED: [
        { skillCode: 'execucao', delta: 2 },
        { skillCode: 'organizacao', delta: 1 }
      ],
      PROJECT_COMPLETED: [
        { skillCode: 'lideranca', delta: 8 },
        { skillCode: 'organizacao', delta: 10 }
      ],
      DOCUMENTATION_CREATED: [
        { skillCode: 'comunicacao', delta: 4 },
        { skillCode: 'conhecimento_tecnico', delta: 3 }
      ],
      IDEA_APPROVED: [
        { skillCode: 'inovacao', delta: 6 },
        { skillCode: 'colaboracao', delta: 2 }
      ],
      AUTOMATION_CREATED: [
        { skillCode: 'conhecimento_tecnico', delta: 8 },
        { skillCode: 'execucao', delta: 2 }
      ],
      MEETING_JOINED: [
        { skillCode: 'comunicacao', delta: 2 },
        { skillCode: 'relacionamento', delta: 1 }
      ],
      CUSTOMER_SATISFIED: [
        { skillCode: 'relacionamento', delta: 8 },
        { skillCode: 'gestao', delta: 4 }
      ],
      LEAD_CONVERTED: [
        { skillCode: 'comunicacao', delta: 4 },
        { skillCode: 'gestao', delta: 3 }
      ],
      COURSE_COMPLETED: [
        { skillCode: 'conhecimento_tecnico', delta: 10 },
        { skillCode: 'planejamento', delta: 2 }
      ],
      BUG_RESOLVED: [
        { skillCode: 'execucao', delta: 3 },
        { skillCode: 'conhecimento_tecnico', delta: 2 }
      ],
      CUSTOMER_CREATED: [
        { skillCode: 'relacionamento', delta: 5 },
        { skillCode: 'gestao', delta: 2 }
      ],
      COMPANY_CREATED: [
        { skillCode: 'gestao', delta: 6 },
        { skillCode: 'lideranca', delta: 4 }
      ],
      CUSTOMER_ACQUIRED: [
        { skillCode: 'relacionamento', delta: 8 },
        { skillCode: 'comunicacao', delta: 3 }
      ],
      BUSINESS_MILESTONE_REACHED: [
        { skillCode: 'planejamento', delta: 7 },
        { skillCode: 'organizacao', delta: 5 }
      ],
      FEATURE_VALIDATED: [
        { skillCode: 'organizacao', delta: 3 },
        { skillCode: 'execucao', delta: 2 }
      ],
      REVENUE_GENERATED: [
        { skillCode: 'gestao', delta: 5 },
        { skillCode: 'planejamento', delta: 4 }
      ],
      DELIVERY_COMPLETED: [
        { skillCode: 'organizacao', delta: 4 },
        { skillCode: 'lideranca', delta: 3 }
      ],
      PLANNING_APPROVED: [
        { skillCode: 'planejamento', delta: 6 },
        { skillCode: 'comunicacao', delta: 2 }
      ],
      PRODUCT_RELEASED: [
        { skillCode: 'gestao', delta: 6 },
        { skillCode: 'inovacao', delta: 3 }
      ]
    };
    return skillMap[event.type] || [];
  }

  private static evaluateAchievements(event: EvolutionEvent): string[] {
    const achievements: string[] = [];
    if (event.type === 'TASK_COMPLETED') achievements.push('primeira_tarefa');
    if (event.type === 'PROJECT_COMPLETED') achievements.push('primeiro_projeto');
    if (event.type === 'CUSTOMER_CREATED') achievements.push('primeiro_cliente');
    if (event.type === 'IDEA_APPROVED') achievements.push('primeira_idea_aprovada');
    if (event.type === 'DOCUMENTATION_CREATED') achievements.push('mestre_da_documentacao');
    return achievements;
  }

  private static async recordEvolutionEvent(
    event: EvolutionEvent,
    xpDelta: number,
    skillDeltas: EvolutionSkillDelta[],
    achievementKeys: string[]
  ) {
    const tenantId = event.payload.tenantId;
    if (!tenantId) {
      throw new Error('Evolution event missing tenantId');
    }

    await db.insert(professionalEvolutionEvents).values({
      workspaceId: event.payload.workspaceId,
      tenantId,
      userUid: event.payload.userUid,
      eventType: event.type,
      payload: event.payload,
      xpDelta,
      skillDeltas,
      achievementKeys,
      createdAt: new Date()
    });
  }

  private static async applyUserEvolution(
    userUid: string,
    workspaceId: number,
    xpDelta: number,
    skillDeltas: EvolutionSkillDelta[],
    achievementKeys: string[],
    tenantId: string
  ) {
    const [profile] = await db
      .select()
      .from(professionalProfiles)
      .where(and(eq(professionalProfiles.userUid, userUid), eq(professionalProfiles.workspaceId, workspaceId)))
      .limit(1);

    if (!profile) {
      await db.insert(professionalProfiles).values({
        tenantId,
        userUid,
        workspaceId,
        xpTotal: xpDelta,
        xpMonth: xpDelta,
        xpWeek: xpDelta,
        xpToday: xpDelta,
        level: 1,
        title: 'Aprendiz',
        competencies: skillDeltas.reduce((acc, item) => {
          acc[item.skillCode] = Math.min(100, Math.max(0, item.delta));
          return acc;
        }, {} as Record<string, number>),
        achievements: achievementKeys,
        updatedAt: new Date(),
        createdAt: new Date()
      });
      return;
    }

    const existingCompetencies = (profile.competencies || {}) as Record<string, number>;
    const updatedCompetencies = { ...existingCompetencies };
    skillDeltas.forEach(item => {
      updatedCompetencies[item.skillCode] = Math.min(100, Math.max(0, (updatedCompetencies[item.skillCode] || 0) + item.delta));
    });

    const newXpTotal = (profile.xpTotal || 0) + xpDelta;
    const { currentStage } = getProfessionalEvolutionInfo(newXpTotal);

    await db.update(professionalProfiles).set({
      xpTotal: newXpTotal,
      xpMonth: (profile.xpMonth || 0) + xpDelta,
      xpWeek: (profile.xpWeek || 0) + xpDelta,
      xpToday: (profile.xpToday || 0) + xpDelta,
      level: Math.max(1, Math.floor(Math.log2(newXpTotal + 1) * 1.85)),
      title: profile.title || currentStage.role,
      competencies: updatedCompetencies,
      achievements: Array.from(new Set([...(profile.achievements || []) as string[], ...achievementKeys])),
      updatedAt: new Date()
    }).where(and(eq(professionalProfiles.userUid, userUid), eq(professionalProfiles.workspaceId, workspaceId)));
  }

  private static async notifyUser(
    userUid: string,
    workspaceId: number,
    xpDelta: number,
    skillDeltas: EvolutionSkillDelta[],
    achievementKeys: string[],
    event: EvolutionEvent
  ) {
    const title = `+${xpDelta} XP em ${event.type.replace(/_/g, ' ')}`;
    await db.insert(notifications).values({
      workspaceId,
      tenantId: event.payload.tenantId || null,
      title,
      description: `Evento registrado: ${event.type.replace(/_/g, ' ')}. Competências atualizadas: ${skillDeltas.map(s => `${s.skillCode} +${s.delta}`).join(', ')}.`,
      type: 'success'
    });
    await db.insert(auditLogs).values({
      tenantId: event.payload.tenantId as any,
      workspaceId,
      userId: userUid,
      action: 'PROFESSIONAL_EVOLUTION_EVENT',
      tableName: 'professional_evolution_events',
      recordId: userUid,
      newValues: { xpDelta, skillDeltas, achievementKeys, eventType: event.type },
      createdAt: new Date()
    });
  }
}
