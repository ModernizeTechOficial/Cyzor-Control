import nodemailer from 'nodemailer';
import { db } from './index.ts';
import { workspaces, platformSettings } from './schema.ts';
import { eq } from 'drizzle-orm';

async function loadPlatformSmtpConfig() {
  try {
    const [configRow] = await db.select().from(platformSettings).where(eq(platformSettings.key, 'smtp_config')).limit(1);
    if (configRow) {
      return configRow.value as any;
    }
  } catch (err) {
    console.error('[Mail] Failed to load platform SMTP config:', err);
  }
  return null;
}

async function logEmailAction(workspaceId: number, emailLog: {
  to: string;
  subject: string;
  templateType: string;
  status: 'success' | 'error';
  errorMessage?: string;
  previewUrl?: string;
}) {
  try {
    const [workspaceRecord] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
    if (workspaceRecord) {
      let settings: any = workspaceRecord.settings || {};
      if (typeof settings === 'string') {
        try { settings = JSON.parse(settings); } catch (e) {}
      }
      if (!settings.emailLogs) {
        settings.emailLogs = [];
      }
      const newLog = {
        id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        date: new Date().toISOString(),
        to: emailLog.to,
        subject: emailLog.subject,
        templateType: emailLog.templateType,
        status: emailLog.status,
        errorMessage: emailLog.errorMessage,
        previewUrl: emailLog.previewUrl
      };
      // Keep only the last 100 logs
      settings.emailLogs = [newLog, ...settings.emailLogs].slice(0, 100);
      await db.update(workspaces).set({
        settings: settings
      }).where(eq(workspaces.id, workspaceId));
    }
  } catch (err) {
    console.error("[Mail] Falha ao gravar logs de email no workspace:", err);
  }
}

export async function sendProjectNotificationEmail({
  to,
  userName,
  projectName,
  role,
  workspaceName,
  assignedBy,
  workspaceId,
}: {
  to: string;
  userName: string;
  projectName: string;
  role: string;
  workspaceName: string;
  assignedBy: string;
  workspaceId?: number;
}) {
  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let from = process.env.SMTP_FROM || '"Cyzor Control" <noreply@cyzor.com>';

  let platformSmtp: any = null;
  let wsSettings: any = null;
  if (workspaceId) {
    try {
      const [workspaceRecord] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
      if (workspaceRecord && workspaceRecord.settings) {
        let settings: any = workspaceRecord.settings;
        if (typeof settings === 'string') {
          try { settings = JSON.parse(settings); } catch (e) { settings = {}; }
        }
        wsSettings = settings;
      }
    } catch (e) {
      console.error('[Mail] Erro ao carregar configurações do workspace para templates:', e);
    }
  }

  try {
    platformSmtp = await loadPlatformSmtpConfig();
  } catch (e) {
    console.error('[Mail] Erro ao carregar SMTP global da plataforma:', e);
  }

  let secure = port === 465;
  if (platformSmtp?.enabled) {
    host = platformSmtp.host || host;
    port = platformSmtp.port ? Number(platformSmtp.port) : port;
    user = platformSmtp.user || user;
    pass = platformSmtp.pass || pass;
    from = platformSmtp.from || from;
    secure = platformSmtp.secure ?? secure;
  }

  let transporter;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  } else {
    // Fallback: create an ethereal test account on the fly (very real and works out-of-the-box in Node!)
    try {
      console.log("[Mail] Criando conta de teste temporária (Ethereal)...");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn("[Mail] Falha ao criar conta de teste do Nodemailer. Usando logger de console.", err);
    }
  }

  function replacePlaceholders(str: string) {
    return str
      .replace(/\{\{userName\}\}/g, userName)
      .replace(/\{\{projectName\}\}/g, projectName)
      .replace(/\{\{role\}\}/g, role)
      .replace(/\{\{workspaceName\}\}/g, workspaceName)
      .replace(/\{\{assignedBy\}\}/g, assignedBy)
      .replace(/\{\{appUrl\}\}/g, process.env.APP_URL || 'http://localhost:3000');
  }

  let subject = `[Jira / Cyzor] Você foi adicionado ao projeto "${projectName}" no Workspace "${workspaceName}"`;
  
  let textBody = `Olá, ${userName}!

Você foi adicionado ao projeto "${projectName}" no Workspace "${workspaceName}" por ${assignedBy}.

Sua Função: ${role}

Acesse o painel do projeto para visualizar suas tarefas pendentes e iniciar a colaboração.

Atenciosamente,
Equipe Cyzor Control`;

  let htmlBody = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
      <div style="background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Cyzor Control</h2>
          <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9; font-weight: 500;">Notificação de Acesso ao Projeto</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 16px; font-weight: 700; color: #0f172a;">Olá, ${userName}!</p>
          <p style="font-size: 14px; color: #475569;">
            Temos o prazer de informar que você foi integrado à equipe de desenvolvimento do projeto 
            <strong style="color: #1e2530;">"${projectName}"</strong> dentro do workspace 
            <strong style="color: #1e2530;">"${workspaceName}"</strong>.
          </p>
          
          <!-- Info block -->
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; width: 40%;">Projeto</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${projectName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">Sua Função</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #4f46e5;">${role}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">Adicionado por</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #334155;">${assignedBy}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">Workspace</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #334155;">${workspaceName}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569; margin-bottom: 30px;">
            Agora você já pode acompanhar as sprints, gerenciar tarefas do quadro Kanban, consultar o planejamento de produtos e colaborar ativamente com seu time.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.15);">
              Ir para o Painel do Projeto
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Este é um e-mail automático enviado pelo Cyzor Control. Por favor, não responda a esta mensagem.
          </p>
        </div>
      </div>
    </div>
  `;

  // Apply custom template if enabled and defined
  if (wsSettings && wsSettings.emailTemplates && wsSettings.emailTemplates.projectNotification) {
    const customTemplate = wsSettings.emailTemplates.projectNotification;
    if (customTemplate.subject) {
      subject = replacePlaceholders(customTemplate.subject);
    }
    if (customTemplate.htmlBody) {
      htmlBody = replacePlaceholders(customTemplate.htmlBody);
    }
    if (customTemplate.textBody) {
      textBody = replacePlaceholders(customTemplate.textBody);
    }
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[Mail] E-mail enviado com sucesso para ${to}. ID: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Mail] URL de visualização do Ethereal: ${previewUrl}`);
      }

      if (workspaceId) {
        await logEmailAction(workspaceId, {
          to,
          subject,
          templateType: 'Acesso ao Projeto',
          status: 'success',
          previewUrl: previewUrl || undefined
        });
      }

      return { success: true, messageId: info.messageId, previewUrl: previewUrl || undefined };
    } catch (err: any) {
      console.error("[Mail Error] Erro ao enviar e-mail via transporter:", err);

      if (workspaceId) {
        await logEmailAction(workspaceId, {
          to,
          subject,
          templateType: 'Acesso ao Projeto',
          status: 'error',
          errorMessage: err instanceof Error ? err.message : String(err)
        });
      }

      return { success: false, error: err };
    }
  } else {
    // Absolute fallback: log to standard output beautifully
    console.log("================== EMAIL NOTIFICATION LOG ==================");
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Corpo de Texto:\n${textBody}`);
    console.log("============================================================");

    if (workspaceId) {
      await logEmailAction(workspaceId, {
        to,
        subject,
        templateType: 'Acesso ao Projeto',
        status: 'success',
        errorMessage: 'Simulação / Logger Console'
      });
    }

    return { success: true, mocked: true };
  }
}

export async function testSmtpConnection({
  host,
  port,
  user,
  pass,
  from,
  to,
  workspaceId
}: {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  workspaceId?: number;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    // Verify SMTP connection
    await transporter.verify();

    const subject = "🔒 Teste de Conexão SMTP - Cyzor Control";
    const text = `Conexão SMTP estabelecida com sucesso!

Seu servidor SMTP em ${host}:${port} foi configurado corretamente no Cyzor Control.

Data/Hora do teste: ${new Date().toLocaleString()}`;

    const html = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
        <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 40px;">⚡</span>
            <h2 style="margin: 10px 0 0; color: #10b981; font-weight: 800; text-transform: uppercase; font-size: 18px;">SMTP Ativo & Conectado!</h2>
          </div>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; text-align: center;">
            Sua integração de e-mail foi autenticada e validada com sucesso pelo nosso serviço.
          </p>
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #64748b; font-weight: bold; width: 40%; font-size: 11px; text-transform: uppercase;">Servidor Host:</td>
                <td style="font-weight: 600; color: #0f172a;">${host}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase;">Porta SMTP:</td>
                <td style="font-weight: 600; color: #0f172a;">${port}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase;">Usuário / E-mail:</td>
                <td style="font-weight: 600; color: #0f172a;">${user}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase;">Remetente (From):</td>
                <td style="font-weight: 600; color: #0f172a;">${from}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 25px;">
            Enviado por Cyzor Control Mail Tester.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    if (workspaceId) {
      await logEmailAction(workspaceId, {
        to,
        subject,
        templateType: 'Teste de SMTP',
        status: 'success'
      });
    }

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[SMTP Test Error]:", error);
    if (workspaceId) {
      await logEmailAction(workspaceId, {
        to,
        subject: "🔒 Teste de Conexão SMTP - Falha",
        templateType: 'Teste de SMTP',
        status: 'error',
        errorMessage: error.message || String(error)
      });
    }
    return { success: false, error: error.message || String(error) };
  }
}
