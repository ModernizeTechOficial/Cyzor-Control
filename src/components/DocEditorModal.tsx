import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  FileText,
  Check,
  Save,
  History,
  Star,
  Link as LinkIcon,
  Building2,
  GitBranch,
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  Eye,
  Printer,
  Layout,
  FileSpreadsheet,
  FileSliders,
  Settings,
  Info,
  Calendar,
  User,
  Layers,
  Share2,
  Globe,
  FileUp,
  Database,
  Compass,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Underline,
  Strikethrough,
  Bold,
  Italic,
  Code,
  Quote,
  PlusCircle,
  AlertOctagon,
  Languages,
  Sparkle,
  RefreshCw,
} from "lucide-react";
import Markdown from "react-markdown";
import { useAuth } from "../context/AuthContext";

// Definitions for the high-end structured documentation format
interface Section {
  id: string;
  title: string;
  content: string;
  isDraft?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  sections: Section[];
  isDraft?: boolean;
}

interface CoverConfig {
  hasCover: boolean;
  title: string;
  subtitle: string;
  author: string;
  company: string;
  client: string;
  project: string;
  createdDate: string;
  revisedDate: string;
  version: string;
  description: string;
  category: string;
  showQrCode: boolean;
  qrUrl: string;
  logoUrl: string;
  bgImage: string;
  bgImageSize: number;
  layout: {
    padding: "narrow" | "normal" | "wide";
    align: "left" | "center" | "right";
    fontFamily: "sans" | "serif" | "mono";
    themeColor: string;
    bgColor: string;
    watermark: string;
  };
}

interface PrintConfig {
  pageSize: "A4";
  orientation: "portrait" | "landscape";
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
  autoTOC: boolean;
}

interface VersionRecord {
  id: string;
  version: string;
  date: string;
  author: string;
  notes: string;
  contentSnapshot: string; // serialized JSON
}

interface DocPackage {
  id?: string;
  documentPackage: true;
  chapters: Chapter[];
  cover: CoverConfig;
  print: PrintConfig;
  versions: VersionRecord[];
}

export default function DocEditorModal({
  doc,
  isOpen,
  onClose,
  onSave,
}: {
  doc: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: any) => void;
}) {
  const { fetchWithAuth, user } = useAuth();

  // Navigation / Modal Main View Tab
  // 'editor' | 'cover' | 'print' | 'preview_pdf'
  const [activeTab, setActiveTab] = useState<
    "editor" | "cover" | "print" | "preview_pdf"
  >("editor");
  const [showMobileTree, setShowMobileTree] = useState(false);

  // General states
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // State for complete Document Package
  const [docPackage, setDocPackage] = useState<DocPackage | null>(null);

  // Selected Tree item
  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  // AI Tools inputs
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Manual version tagging state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState("1.1");
  const [newVersionNotes, setNewVersionNotes] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  const [activeRightTab, setActiveRightTab] = useState<
    "metadata" | "ai" | "library" | "history" | null
  >(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewMode, setPreviewMode] = useState<"page" | "full">("page");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setActiveRightTab((prev) => (prev === "ai" ? null : "ai"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  // Target ref for editing area
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Force cleanup of portal elements on unmount if createPortal doesn't do it
  useEffect(() => {
    return () => {
      if (docPackage?.id) {
        const el = document.getElementById(`print-area-pdf-${docPackage.id}`);
        if (el) el.remove();
      }
    };
  }, [docPackage?.id]);

  // Default initial markdown for new sections
  const initialSectionMarkdown = `## Conteúdo da Seção\n\nComece a editar esta seção de documentação usando markdown ou os botões de formatação acima...`;

  // Fetch projects list for relationships
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetchWithAuth("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjectsList(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProjects();
  }, [fetchWithAuth]);

  // Load backend doc or create a default rich document package
  useEffect(() => {
    if (!isOpen) return;

    if (doc && doc.id) {
      let parsed: DocPackage;
      try {
        const json = JSON.parse(doc.content || "");
        if (json && json.documentPackage) {
          parsed = json;
        } else {
          throw new Error("Fallback to markdown");
        }
      } catch (e) {
        // Fallback or Upgrade existing plain markdown document to Document Package
        parsed = {
          documentPackage: true,
          chapters: [
            {
              id: "chap_intro",
              title: "1. Introdução",
              sections: [
                {
                  id: "sec_intro_1",
                  title: "Visão Geral",
                  content:
                    doc.content ||
                    "# Visão Geral\n\nEste é o conteúdo do documento escrito em **markdown**.",
                },
              ],
            },
          ],
          cover: {
            hasCover: true,
            title: doc.title || "Manual Corporativo",
            subtitle:
              "Especificações técnicas, operacionais e governança organizacional",
            author: user?.displayName || "Administrador",
            company: "CYZOR Tech",
            client: "Ecossistema CYZOR",
            project: "",
            createdDate: new Date().toISOString().split("T")[0],
            revisedDate: new Date().toISOString().split("T")[0],
            version: "1.0",
            description:
              "Esta documentação consolida os fluxos de processos, designs de capitais, especificações técnicas de negócio e visões estratégicas do ecossistema.",
            category: doc.folder || "Processos",
            showQrCode: true,
            qrUrl: "https://cyzor.com",
            logoUrl: "",
            bgImage:
              "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
            bgImageSize: 100,
            layout: {
              padding: "normal",
              align: "center",
              fontFamily: "sans",
              themeColor: "#111111",
              bgColor: "#FFFFFF",
              watermark: "CONFIDENCIAL",
            },
          },
          print: {
            pageSize: "A4",
            orientation: "portrait",
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
            headerText: doc.title || "Manual Técnico de Processos",
            footerText: "CYZOR Control Enterprise Suite • Confidencial",
            showPageNumbers: true,
            autoTOC: true,
          },
          versions: [
            {
              id: "v_init",
              version: "1.0",
              date: new Date().toLocaleString(),
              author: user?.displayName || "Admin",
              notes: "Importação automática do conteúdo legado.",
              contentSnapshot: doc.content || "",
            },
          ],
        };
      }

      setDocPackage(parsed);
      setSelectedProjectId(
        doc.projectId ? String(doc.projectId) : parsed.cover.project || "",
      );

      // Auto-select first chapter & section
      if (parsed.chapters.length > 0) {
        setActiveChapterId(parsed.chapters[0].id);
        if (parsed.chapters[0].sections.length > 0) {
          setActiveSectionId(parsed.chapters[0].sections[0].id);
        } else {
          setActiveSectionId("");
        }
      } else {
        setActiveChapterId("");
        setActiveSectionId("");
      }
      setIsEditing(false);
    } else {
      // New Document Template
      const newPackage: DocPackage = {
        documentPackage: true,
        chapters: [
          {
            id: "chap_1",
            title: "1. Introdução e Propósito",
            sections: [
              {
                id: "sec_1_1",
                title: "Alinhamento Estratégico",
                content:
                  "# Alinhamento Estratégico\n\nDescreva os objetivos fundamentais desta documentação corporativa...",
              },
              {
                id: "sec_1_2",
                title: "Escopo de Atuação",
                content:
                  "# Escopo do Trabalho\n\nDetalhamento prático dos recursos cobertos...",
              },
            ],
          },
          {
            id: "chap_2",
            title: "2. Arquitetura e Engenharia",
            sections: [
              {
                id: "sec_2_1",
                title: "Visão Arquitetural de Sistema",
                content:
                  "# Arquitetura Geral\n\nIncorpore as especificidades do modelo computacional...",
              },
            ],
          },
        ],
        cover: {
          hasCover: true,
          title: doc?.title || "Relatório de Engenharia e Processos",
          subtitle: "Especificação técnica integrada com ecossistemas SaaS",
          author: user?.displayName || "Engenharia CYZOR",
          company: "CYZOR Hub",
          client: "Cliente Corporativo",
          project: doc?.projectId ? String(doc.projectId) : "",
          createdDate: new Date().toISOString().split("T")[0],
          revisedDate: new Date().toISOString().split("T")[0],
          version: "1.0",
          description:
            "Modelo de documentação sistêmica unificada para as operações e auditorias de desempenho de sistemas de alta resiliência.",
          category: doc?.folder || "Engenharia",
          showQrCode: true,
          qrUrl: "https://cyzor.com",
          logoUrl: "",
          bgImage: "",
          bgImageSize: 100,
          layout: {
            padding: "normal",
            align: "center",
            fontFamily: "sans",
            themeColor: "#111111",
            bgColor: "#FFFFFF",
            watermark: "DRAFT",
          },
        },
        print: {
          pageSize: "A4",
          orientation: "portrait",
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
          headerText: doc?.title || "Documentação Organizacional Corporativa",
          footerText: "Todos os direitos reservados • Documento Interno",
          showPageNumbers: true,
          autoTOC: true,
        },
        versions: [
          {
            id: "v_init",
            version: "1.0",
            date: new Date().toLocaleString(),
            author: user?.displayName || "Autor Principal",
            notes: "Criação inicial da estrutura corporativa.",
            contentSnapshot: "",
          },
        ],
      };

      setDocPackage(newPackage);
      setSelectedProjectId(doc?.projectId ? String(doc.projectId) : "");
      setActiveChapterId("chap_1");
      setActiveSectionId("sec_1_1");
      setIsEditing(true); // Se for novo, inicia editando
    }
  }, [doc, isOpen]);

  if (!isOpen || !docPackage) return null;

  // Active elements references
  const activeChapter = docPackage.chapters.find(
    (c) => c.id === activeChapterId,
  );
  const activeSection = activeChapter?.sections.find(
    (s) => s.id === activeSectionId,
  );

  // Save the complete Document Package stringified to the database
  const handleSaveDocument = async () => {
    setLoading(true);
    setSaveMessage(null);
    try {
      const dbPayload = {
        title: docPackage.cover.title || "Documento Corporativo",
        content: JSON.stringify(docPackage),
        folder: docPackage.cover.category || doc?.folder || "Geral",
        projectId: selectedProjectId ? Number(selectedProjectId) : null,
        isFavorite: doc?.isFavorite || false,
      };

      let res;
      if (doc?.id) {
        res = await fetchWithAuth(`/api/documents/${doc.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dbPayload),
        });
      } else {
        res = await fetchWithAuth("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dbPayload),
        });
      }

      if (res.ok) {
        const savedDoc = await res.json();
        onSave(savedDoc);
        setSaveMessage("Documento salvo com sucesso!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSaveMessage(
          `Erro ao salvar: ${errorData.error || "Erro desconhecido"}`,
        );
      }
    } catch (e) {
      console.error("Erro ao salvar documento:", e);
      setSaveMessage("Erro ao salvar documento.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setDocPackage((prev) => ({
          ...prev,
          cover: { ...prev.cover, bgImage: base64String },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper formatting injector
  const injectFormatting = (before: string, after: string = "") => {
    if (!textareaRef.current || !activeSection) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = activeSection.content;
    const selectedText = text.substring(start, end);
    const replacement = before + (selectedText || "texto_aqui") + after;

    const newContent =
      text.substring(0, start) + replacement + text.substring(end);

    // Update State
    updateActiveSectionContent(newContent);

    // Dynamic focus restore
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + before.length,
          start +
            before.length +
            (selectedText ? selectedText.length : "texto_aqui".length),
        );
      }
    }, 50);
  };

  const updateActiveSectionContent = (content: string) => {
    if (!activeChapterId || !activeSectionId) return;

    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map((chap) => {
          if (chap.id !== activeChapterId) return chap;
          return {
            ...chap,
            sections: chap.sections.map((sec) => {
              if (sec.id !== activeSectionId) return sec;
              return { ...sec, content };
            }),
          };
        }),
      };
    });
  };

  // Hierarchy Structure Controllers
  const addChapter = () => {
    const num = docPackage.chapters.length + 1;
    const key = `chap_custom_${Date.now()}`;
    const newChap: Chapter = {
      id: key,
      title: `${num}. Novo Capítulo Corporativo`,
      sections: [
        {
          id: `sec_dyn_${Date.now()}`,
          title: "Introdução Secundária",
          content: "# Introdução\n\nInsira a base informacional aqui...",
        },
      ],
    };

    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: [...prev.chapters, newChap],
      };
    });
    setActiveChapterId(key);
    setActiveSectionId(newChap.sections[0].id);
  };

  const addSection = (chapId: string) => {
    const chap = docPackage.chapters.find((c) => c.id === chapId);
    if (!chap) return;
    const secKey = `sec_dyn_${Date.now()}`;
    const newSec: Section = {
      id: secKey,
      title: `Subseção Adicional ${chap.sections.length + 1}`,
      content: initialSectionMarkdown,
    };

    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map((c) => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            sections: [...c.sections, newSec],
          };
        }),
      };
    });
    setActiveChapterId(chapId);
    setActiveSectionId(secKey);
  };

  const renameChapter = (chapId: string, title: string) => {
    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.id === chapId ? { ...c, title } : c,
        ),
      };
    });
  };

  const renameSection = (chapId: string, secId: string, title: string) => {
    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map((c) => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            sections: c.sections.map((s) =>
              s.id === secId ? { ...s, title } : s,
            ),
          };
        }),
      };
    });
  };

  const deleteChapter = (chapId: string) => {
    if (docPackage.chapters.length <= 1) return; // Must hold at least 1
    setDocPackage((prev) => {
      if (!prev) return null;
      const filtered = prev.chapters.filter((c) => c.id !== chapId);
      return { ...prev, chapters: filtered };
    });
    // Auto shift selected
    const remaining = docPackage.chapters.filter((c) => c.id !== chapId);
    setActiveChapterId(remaining[0].id);
    setActiveSectionId(remaining[0].sections[0]?.id || "");
  };

  const deleteSection = (chapId: string, secId: string) => {
    const chap = docPackage.chapters.find((c) => c.id === chapId);
    if (!chap || chap.sections.length <= 1) return; // Keep at least one

    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map((c) => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            sections: c.sections.filter((s) => s.id !== secId),
          };
        }),
      };
    });

    const rem = chap.sections.filter((s) => s.id !== secId);
    setActiveSectionId(rem[0].id);
  };

  // Positioning movers
  const moveChapter = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= docPackage.chapters.length) return;

    setDocPackage((prev) => {
      if (!prev) return null;
      const arr = [...prev.chapters];
      const temp = arr[index];
      arr[index] = arr[targetIndex];
      arr[targetIndex] = temp;
      return { ...prev, chapters: arr };
    });
  };

  const moveSection = (
    chapId: string,
    index: number,
    direction: "up" | "down",
  ) => {
    const chap = docPackage.chapters.find((c) => c.id === chapId);
    if (!chap) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chap.sections.length) return;

    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map((c) => {
          if (c.id !== chapId) return c;
          const sArr = [...c.sections];
          const temp = sArr[index];
          sArr[index] = sArr[targetIndex];
          sArr[targetIndex] = temp;
          return { ...c, sections: sArr };
        }),
      };
    });
  };

  // Library structures templates injectors
  const injectTemplate = (type: string) => {
    let content = "";
    if (type === "api") {
      content = `# Documentação de API Técnica\n\n### 🌐 Endpoint: \`POST /api/v1/auth/sync\`\n\nRealiza a sincronização e provisionamento do workspace corporativo.\n\n#### 📥 Request Headers:\n| Header | Tipo | Obrigatório | Descrição |\n| :--- | :--- | :--- | :--- |\n| Authorization | String | Sim | Bearer Token de autenticação |\n| Content-Type | String | Sim | deve ser \`application/json\` |\n\n\n> 💡 **Nota do Arquiteto:** Verifique os limites de cotas de APIs do plano contratado antes de integrar fluxos automáticos de sincronismo.\n\n\`\`\`json\n{\n  "uid": "usr_99837aef",\n  "workspaceId": 12,\n  "timezone": "America/Sao_Paulo"\n}\n\`\`\`\n\n#### 📤 Response (200 OK):\n\`\`\`json\n{\n  "status": "synchronized",\n  "activeWorkspace": {\n    "id": 12,\n    "name": "CYZOR Headquarters",\n    "plan": "Enterprise"\n  }\n}\n\`\`\`\n`;
    } else if (type === "guide") {
      content = `# Relatório Executivo & SWOT Organizacional\n\n## 1. Sumário Executivo\nEste documento descreve as decisões de arquitetura e mitigação operacional adotadas durante as revisões gerais de performance do sistema corporativo.\n\n### Matriz SWOT Aplicada:\n\n*   **Forças (Strengths):** Engine SQLite nativo persistente de alta velocidade.\n*   **Oportunidades (Opportunities):** Integração com modelos generativos corporativos Gemini.\n*   **Fraquezas (Weaknesses):** Latência na verificação em múltiplos brokers.\n*   **Ameaças (Threats):** Mudanças regulatórias de proteção de dados (LGPD).\n\n---\n\n### 📈 Resumo do Acordo de Nível de Serviço (SLA):\n| Serviço | SLA Garantido | Meta Interna | Status |\n| :--- | :--- | :--- | :--- |\n| API Portal | 99.9% | 99.95% | Atendido |\n| Storage Cloud | 99.99% | 100% | Atendido |\n`;
    } else if (type === "warning") {
      content = `\n:::📌 **AVISO DE SEGURANÇA E COMPLIANCE**\n\nEste documento é de uso estritamente restrito. De acordo com os padrões da LGPD e regulamento de conformidade de informação e auditoria externa, o vazamento ou reprodução não autorizada deste conteúdo acarretará sansões severas vigentes em diretrizes internas de segurança.\n:::\n`;
    } else {
      content = `# Estrutura Geral e Checklist de Aceite\n\n- [ ] Definição clara dos objetivos estratégicos\n- [ ] Levantamento de infraestrutura provisionada\n- [ ] Aceite assinado pelo patrocinador (Sponsor)\n- [ ] Liberação da documentação pela auditoria regulatória\n`;
    }

    updateActiveSectionContent(content);
  };

  // AI Generative integrations
  const runAiService = async (
    mode: "rewrite" | "grammar" | "summary" | "contextual",
  ) => {
    if (!activeSection) return;
    setAiLoading(true);
    setAiError("");

    let prompt = "";

    if (mode === "grammar") {
      prompt = `Corrija e melhore gramaticalmente o seguinte conteúdo em markdown, mantendo um tom extremamente corporativo, profissional e polido. Mantenha os mesmos marcadores markdown e estrutura. Texto:\n\n${activeSection.content}`;
    } else if (mode === "summary") {
      prompt = `Gere um sumário executivo profissional de alto impacto e metas claras (bullet-points) baseado no seguinte conteúdo em markdown:\n\n${activeSection.content}`;
    } else if (mode === "contextual") {
      const selectedProjObj = projectsList.find(
        (p) => String(p.id) === selectedProjectId,
      );
      const projContext = selectedProjObj
        ? `Nome do Projeto: ${selectedProjObj.name}. Descrição: ${selectedProjObj.description || "N/A"}`
        : "Geral";
      prompt = `Crie uma seção completa de documentação técnica/estratégica corporativa de acordo com o seguinte contexto de projeto: ${projContext}. Use markdown, inclua tabelas informativas, objetivos claros e callouts de observações relevantes. Seja profissional e detalhado.`;
    } else {
      // Custom instructions
      if (!aiPrompt.trim()) {
        setAiError("Coloque uma instrução personalizada no campo acima.");
        setAiLoading(false);
        return;
      }
      prompt = `Modifique o seguinte markdown com base na instrução fornecida. Forneça apenas o markdown resultante.\n\nInstrução: ${aiPrompt}\n\nConteúdo atual:\n\n${activeSection.content}`;
    }

    try {
      const res = await fetchWithAuth("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setAiResult(data.text);
          // Auto update active section
          updateActiveSectionContent(data.text);
          setAiPrompt("");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setAiError(
          errorData.message || "Erro ao processar pela IA. Tente novamente.",
        );
      }
    } catch (e) {
      setAiError("Falha interna de rede ao conectar à IA.");
    } finally {
      setAiLoading(false);
    }
  };

  // Version historical backup tag manager
  const saveMilestoneVersion = () => {
    if (!newVersionLabel.trim()) return;
    const historyItem: VersionRecord = {
      id: `v_dyn_${Date.now()}`,
      version: newVersionLabel,
      date: new Date().toLocaleString(),
      author: user?.displayName || "Administrador",
      notes: newVersionNotes || "Revisão manual corporativa.",
      contentSnapshot: JSON.stringify(docPackage),
    };

    setDocPackage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        versions: [historyItem, ...prev.versions],
        cover: {
          ...prev.cover,
          version: newVersionLabel,
        },
      };
    });

    setShowVersionModal(false);
    setNewVersionNotes("");
  };

  const restoreVersionSnapshot = (snapshotJson: string) => {
    try {
      if (!snapshotJson) {
        console.error("snapshotJson is empty or falsy", snapshotJson);
        return;
      }
      const parsed =
        typeof snapshotJson === "string"
          ? JSON.parse(snapshotJson)
          : snapshotJson;
      if (parsed && parsed.documentPackage) {
        setDocPackage(parsed);
        if (parsed.chapters.length > 0) {
          setActiveChapterId(parsed.chapters[0].id);
          setActiveSectionId(parsed.chapters[0].sections[0]?.id || "");
        }
      }
    } catch (e) {
      console.error(
        "Falha ao restaurar versão:",
        e,
        "snapshot type:",
        typeof snapshotJson,
        "snapshot start:",
        typeof snapshotJson === "string" ? snapshotJson.substring(0, 100) : "",
      );
    }
  };

  const renderPages = () => {
    const chapterStartPage =
      (docPackage.cover.hasCover ? 1 : 0) + (docPackage.print.autoTOC ? 1 : 0) + 1;

    return (
      <>
      {/* PAGE 1: BEAUTIFUL VIRTUAL CAPA */}
      {docPackage.cover.hasCover && (
        <div
          className="a4-page-sheet a4-page-sheet-fixed bg-[#FFFFFF] shadow-2xl relative flex flex-col justify-between text-center overflow-hidden border p-16"
          style={{
            width: "210mm",
            height: "297mm",
            paddingTop: `${docPackage.print.marginTop}mm`,
            paddingBottom: `${docPackage.print.marginBottom}mm`,
            paddingLeft: `${docPackage.print.marginLeft}mm`,
            paddingRight: `${docPackage.print.marginRight}mm`,
            fontFamily:
              docPackage.cover.layout.fontFamily === "serif"
                ? "Georgia, serif"
                : docPackage.cover.layout.fontFamily === "mono"
                  ? "monospace"
                  : "sans-serif",
          }}
        >
          {/* ACCENT COLORED ROW */}
          <div
            className="absolute top-0 left-0 w-full h-4"
            style={{ backgroundColor: docPackage.cover.layout.themeColor }}
          ></div>

          {/* WATERMARK BACKGROUND EFFECT */}
          {docPackage.cover.layout.watermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
              <span className="text-8xl font-black tracking-widest uppercase -rotate-45">
                {docPackage.cover.layout.watermark}
              </span>
            </div>
          )}

          {/* Organization Banner Cover */}
          <div className="flex flex-col items-center mt-4">
            <span className="text-xs font-black tracking-widest text-[#64748B] block mb-2">
              {docPackage.cover.company || "ORGANIZAÇÃO CORPORATIVA"}
            </span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-dashed rounded px-3 py-1 bg-neutral-50">
              {docPackage.cover.category || "Especificação"}
            </span>
          </div>

          {/* Main Core Cover title */}
          <div className="my-auto py-10 flex flex-col gap-6">
            {/* Optional Primary Layout Banner Graphic */}
            {docPackage.cover.bgImage && (
              <div className="w-full mb-6 flex items-center justify-center">
                <img
                  src={docPackage.cover.bgImage}
                  style={{
                    width: `${docPackage.cover.bgImageSize}%`,
                    height: "auto",
                  }}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <h1
              className="text-3xl font-bold tracking-tight text-[#111111] leading-tight"
              style={{ color: docPackage.cover.layout.themeColor }}
            >
              {docPackage.cover.title || "Manual Operacional"}
            </h1>

            <div
              className="w-16 h-1 mx-auto"
              style={{ backgroundColor: docPackage.cover.layout.themeColor }}
            ></div>

            <p className="text-sm text-neutral-500 font-medium italic max-w-lg mx-auto leading-relaxed">
              {docPackage.cover.subtitle}
            </p>
          </div>

          {/* Metadados block */}
          <div className="flex flex-col gap-6 border-t pt-8 text-xs">
            <div className="text-left leading-relaxed">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Resumo Executivo Informativo:
              </span>
              <p className="text-neutral-500 leading-relaxed font-semibold italic">
                {docPackage.cover.description || "Nenhum resumo fornecido."}
              </p>
            </div>

            <div className="grid grid-cols-2 text-left text-xs gap-4 font-semibold bg-neutral-50 p-4 rounded-xl border border-black/5">
              <div className="flex flex-col">
                <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">
                  Autor Do Documento:
                </span>
                <span className="text-neutral-700 font-extrabold mt-0.5">
                  {docPackage.cover.author || "Administrador"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">
                  Versão Registrada:
                </span>
                <span className="text-neutral-700 font-extrabold mt-0.5">
                  Módulo Geral V.{docPackage.cover.version}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">
                  Receptor do Trabalho:
                </span>
                <span className="text-neutral-700 font-extrabold mt-0.5">
                  {docPackage.cover.client || "Mercado Geral"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">
                  Data de Revisão Final:
                </span>
                <span className="text-neutral-500 mt-0.5">
                  {docPackage.cover.revisedDate}
                </span>
              </div>
            </div>

            {/* Header and Qr component */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-neutral-400 font-mono tracking-widest">
                {docPackage.print.footerText}
              </span>
              {docPackage.cover.showQrCode && (
                <div className="flex items-center gap-3 bg-white border p-1 px-3 rounded-lg">
                  <span className="text-[8px] font-mono text-neutral-400 text-right">
                    Acesse o portal para assinar:
                    <br />
                    <span className="text-neutral-600 font-bold">
                      {docPackage.cover.qrUrl}
                    </span>
                  </span>
                  <div className="w-10 h-10 flex items-center justify-center pointer-events-none">
                    <QRCodeSVG
                      value={docPackage.cover.qrUrl || "https://ais-dev.run.app"}
                      size={40}
                      level="L"
                      includeMargin={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: AUTOMATIC TABLE OF CONTENTS (SUMÁRIO) */}
      {docPackage.print.autoTOC && (
        <div
          className="a4-page-sheet a4-page-sheet-fixed bg-[#FFFFFF] shadow-2xl relative flex flex-col justify-between text-left border p-16"
          style={{
            width: "210mm",
            height: "297mm",
            paddingTop: `${docPackage.print.marginTop}mm`,
            paddingBottom: `${docPackage.print.marginBottom}mm`,
            paddingLeft: `${docPackage.print.marginLeft}mm`,
            paddingRight: `${docPackage.print.marginRight}mm`,
          }}
        >
          {/* WATERMARK BACKGROUND EFFECT */}
          {docPackage.cover.layout.watermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
              <span className="text-8xl font-black tracking-widest uppercase -rotate-45">
                {docPackage.cover.layout.watermark}
              </span>
            </div>
          )}

          {/* Header bar layout representation */}
          <div className="flex items-center justify-between border-b pb-3 mb-6">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
              {docPackage.print.headerText}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
              Sumário Geral
            </span>
          </div>

          <div className="flex-1 py-4">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8 font-display">
              Sumário de Conteúdo
            </h2>

            <div className="flex flex-col gap-5 text-sm">
              {docPackage.chapters.map((chap, cIdx) => {
                return (
                  <div key={chap.id} className="flex flex-col gap-2">
                    <div className="flex items-end justify-between font-bold">
                      <span className="text-neutral-900">{chap.title}</span>
                      <span className="bg-repeat-x border-b border-dotted flex-1 mx-2 mb-1.5 opacity-40"></span>
                      <span className="text-neutral-900 font-mono font-bold">
                        pág. {chapterStartPage + cIdx}
                      </span>
                    </div>

                    <div className="pl-6 flex flex-col gap-1.5 text-neutral-600 font-medium">
                      {chap.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="flex items-end justify-between text-xs"
                        >
                          <span>{sec.title}</span>
                          <span className="bg-repeat-x border-b border-dotted flex-1 mx-2 mb-1 opacity-20"></span>
                          <span className="text-neutral-400 font-mono text-[10px]">
                            pág. {chapterStartPage + cIdx}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between border-t pt-3 mt-6">
            <span className="text-[9px] tracking-tight text-neutral-400 font-mono">
              {docPackage.print.footerText}
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-600">
              Pág. ii
            </span>
          </div>
        </div>
      )}

      {/* FLOWING CONTENT GENERATION CHAPTERS (1 PAGE PER CHAPTER MODEL) */}
      {docPackage.chapters.map((chap, cIdx) => {
        return (
          <div
            key={chap.id}
            className="a4-page-sheet a4-page-sheet-flow bg-[#FFFFFF] shadow-2xl relative flex flex-col justify-between text-left border p-16"
            style={{
              width: "210mm",
              minHeight: "297mm",
              paddingTop: `${docPackage.print.marginTop}mm`,
              paddingBottom: `${docPackage.print.marginBottom}mm`,
              paddingLeft: `${docPackage.print.marginLeft}mm`,
              paddingRight: `${docPackage.print.marginRight}mm`,
            }}
          >
            {/* WATERMARK BACKGROUND EFFECT */}
            {docPackage.cover.layout.watermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
                <span className="text-8xl font-black tracking-widest uppercase -rotate-45">
                  {docPackage.cover.layout.watermark}
                </span>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-6 text-neutral-400">
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {docPackage.print.headerText}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {chap.title}
              </span>
            </div>

            {/* Content parsing zone */}
            <div className="flex-1 overflow-visible leading-relaxed text-sm">
              <div className="prose prose-slate max-w-none text-left select-text scroll-smooth prose-h1:text-2xl prose-h1:font-display prose-h1:font-bold prose-h1:text-[#111111] prose-h2:text-lg prose-h2:font-bold prose-h2:text-[#111111] prose-a:text-indigo-600 prose-code:bg-[#FAFAFA] prose-code:text-[#ef4444] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-[#111111] prose-pre:text-white prose-pre:p-4 prose-pre:rounded-xl prose-pre:whitespace-pre-wrap prose-pre:break-words">
                {chap.sections.map((sec, sIdx) => (
                  <div
                    key={sec.id}
                    className="mb-8 border-b pb-6 last:border-none last:pb-0"
                  >
                    <h3
                      className="text-base font-bold text-neutral-800 mb-3 border-l-4 pl-3.5"
                      style={{
                        borderColor: docPackage.cover.layout.themeColor,
                      }}
                    >
                      {sec.title}
                    </h3>
                    <Markdown>{sec.content}</Markdown>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t pt-3 mt-6 text-neutral-400 text-xs">
              <span className="text-[9px] tracking-tight text-neutral-400 font-mono">
                {docPackage.print.footerText}
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-600">
                Pág. {chapterStartPage + cIdx}
              </span>
            </div>
          </div>
        );
      })}
    </>
    );
  };

  // Print system handler browser trigger
  const triggerNativePrint = () => {
    window.print();
  };

  const applyAIInstruction = async (prompt: string, loadingMessage: string) => {
    setAiPrompt(prompt);
    // Let React batch the state update
    setTimeout(() => {
      runAiService("custom" as any);
    }, 10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full h-full sm:h-[95vh] sm:w-[98vw] sm:rounded-2xl border border-black/5 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <style>{`
          @page {
            size: A4 portrait;
            margin: ${docPackage.print.marginTop}mm ${docPackage.print.marginRight}mm ${docPackage.print.marginBottom}mm ${docPackage.print.marginLeft}mm;
          }
          @page fixedpage {
            margin: 0;
          }
          @media print {
            body > *:not(.print-area-pdf) {
              display: none !important;
            }
            body > .print-area-pdf {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              position: static !important;
              width: 100% !important;
              background-color: #FFFFFF !important;
            }
            body, html {
              background: #FFFFFF !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              height: auto !important;
              overflow: visible !important;
              position: static !important;
            }
            .a4-page-sheet {
              border: none !important;
              box-shadow: none !important;
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 210mm !important;
              page-break-after: always !important;
            }
            .a4-page-sheet-fixed {
              page: fixedpage;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              height: 297mm !important;
            }
            .a4-page-sheet-flow {
              display: block !important;
              min-height: auto !important;
              height: auto !important;
              page-break-inside: auto !important;
              break-inside: auto !important;
              padding: 0 !important;
            }
            .a4-page-sheet:last-child {
              page-break-after: auto !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
        {/* TOP STATUS BAR & BREADCRUMBS */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/5 bg-[#FAFAFA] flex-shrink-0 no-print">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="hover:text-black cursor-pointer">
              Documentações
            </span>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="hover:text-black cursor-pointer">
              {docPackage?.cover.category || "Categoria"}
            </span>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="text-black font-semibold">
              {docPackage?.cover.title || "Novo Documento"}
            </span>
            <span className="ml-2 text-[10px] font-bold bg-black/5 px-2 py-0.5 rounded-full">
              v{docPackage?.cover.version}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
              {loading ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />{" "}
                  <span>Salvando...</span>
                </>
              ) : saveMessage ? (
                <>
                  <Check size={12} className="text-emerald-500" />{" "}
                  <span className="text-emerald-600">{saveMessage}</span>
                </>
              ) : (
                <>
                  <Check size={12} /> <span>Salvo na nuvem</span>
                </>
              )}
            </div>

            <div className="w-px h-4 bg-black/10"></div>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isFocusMode ? "bg-indigo-50 text-indigo-600" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"}`}
              title="Modo Foco (ESC para sair)"
            >
              Foco
            </button>
            <button
              onClick={handleSaveDocument}
              disabled={loading}
              className="px-4 py-1.5 text-xs font-bold bg-[#111111] text-white hover:bg-black rounded-full shadow-sm transition-all disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR (15%) - Document Hierarchy */}
          {!isFocusMode && (
            <div className="w-[15%] min-w-[240px] border-r border-black/5 bg-[#FAFAFA] flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-black/5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Hierarquia
                </span>
                <button
                  onClick={addChapter}
                  className="p-1 text-neutral-400 hover:text-black hover:bg-black/5 rounded"
                  title="Novo Capítulo"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {docPackage.chapters.map((chap, cIndex) => {
                  const isPassedChap = activeChapterId === chap.id;
                  return (
                    <div key={chap.id} className="mb-2">
                      <div
                        className={`group p-2 flex items-center justify-between rounded-lg transition-colors ${isPassedChap ? "bg-black/5" : "hover:bg-black/5"}`}
                      >
                        <div
                          className="flex items-center gap-1.5 overflow-hidden flex-1 cursor-pointer"
                          onClick={() => setActiveChapterId(chap.id)}
                        >
                          <ChevronDown
                            size={14}
                            className="text-neutral-400 shrink-0"
                          />
                          <input
                            value={chap.title}
                            onChange={(e) =>
                              renameChapter(chap.id, e.target.value)
                            }
                            className="font-semibold text-[#111111] bg-transparent outline-none w-full border-none p-0 text-xs truncate"
                          />
                        </div>
                        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => moveChapter(cIndex, "up")}
                            className="p-0.5 text-neutral-400 hover:text-black"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => moveChapter(cIndex, "down")}
                            className="p-0.5 text-neutral-400 hover:text-black"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            onClick={() => deleteChapter(chap.id)}
                            className="p-0.5 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="pl-4 mt-1 flex flex-col gap-0.5">
                        {chap.sections.map((sec, sIndex) => {
                          const isPassedSec = activeSectionId === sec.id;
                          return (
                            <div
                              key={sec.id}
                              onClick={() => {
                                setActiveChapterId(chap.id);
                                setActiveSectionId(sec.id);
                              }}
                              className={`group p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${isPassedSec ? "bg-[#111111] text-white" : "text-neutral-600 hover:bg-black/5"}`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <FileText
                                  size={12}
                                  className={
                                    isPassedSec
                                      ? "text-white/70"
                                      : "text-neutral-400"
                                  }
                                />
                                <input
                                  value={sec.title}
                                  onChange={(e) =>
                                    renameSection(
                                      chap.id,
                                      sec.id,
                                      e.target.value,
                                    )
                                  }
                                  className={`p-0 border-none bg-transparent outline-none text-xs w-full truncate ${isPassedSec ? "text-white" : "text-[#111111]"}`}
                                />
                              </div>
                              <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSection(chap.id, sIndex, "up");
                                  }}
                                  className={`p-0.5 ${isPassedSec ? "text-white/70 hover:text-white" : "text-neutral-400 hover:text-black"}`}
                                >
                                  <ArrowUp size={10} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSection(chap.id, sIndex, "down");
                                  }}
                                  className={`p-0.5 ${isPassedSec ? "text-white/70 hover:text-white" : "text-neutral-400 hover:text-black"}`}
                                >
                                  <ArrowDown size={10} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSection(chap.id, sec.id);
                                  }}
                                  className={`p-0.5 ${isPassedSec ? "text-red-300 hover:text-red-100" : "text-red-400 hover:text-red-600"}`}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => addSection(chap.id)}
                          className="p-1.5 text-[10px] font-semibold text-neutral-400 hover:text-neutral-700 flex items-center gap-1.5 ml-2 mt-0.5 rounded-lg hover:bg-black/5"
                        >
                          <Plus size={10} /> Nova Página
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EDITOR (42.5%) */}
          <div className="flex-1 border-r border-black/5 flex flex-col bg-white">
            {activeSection ? (
              <>
                {/* PROFESSIONAL TOOLBAR */}
                <div className="p-2 border-b border-black/5 flex items-center flex-wrap gap-1 bg-[#FAFAFA] text-neutral-600">
                  {/* Headers */}
                  <div className="flex items-center gap-0.5 px-1">
                    <button
                      onClick={() => injectFormatting("# ", "\n")}
                      className="p-1.5 hover:bg-black/5 rounded text-xs font-bold"
                      title="H1"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => injectFormatting("## ", "\n")}
                      className="p-1.5 hover:bg-black/5 rounded text-xs font-bold"
                      title="H2"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => injectFormatting("### ", "\n")}
                      className="p-1.5 hover:bg-black/5 rounded text-xs font-bold"
                      title="H3"
                    >
                      H3
                    </button>
                  </div>
                  <div className="w-px h-4 bg-black/10 mx-1"></div>

                  {/* Formatting */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => injectFormatting("**", "**")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Negrito"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      onClick={() => injectFormatting("*", "*")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Itálico"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      onClick={() => injectFormatting("<u>", "</u>")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Sublinhado"
                    >
                      <Underline size={14} />
                    </button>
                    <button
                      onClick={() => injectFormatting("~~", "~~")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Tachado"
                    >
                      <Strikethrough size={14} />
                    </button>
                  </div>
                  <div className="w-px h-4 bg-black/10 mx-1"></div>

                  {/* Lists */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => injectFormatting("- ", "\n")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Lista"
                    >
                      <List size={14} />
                    </button>
                    <button
                      onClick={() => injectFormatting("- [ ] ", "\n")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Checklist"
                    >
                      <CheckSquare size={14} />
                    </button>
                    <button
                      onClick={() => injectFormatting("1. ", "\n")}
                      className="p-1.5 hover:bg-black/5 rounded text-xs font-bold"
                      title="Numerada"
                    >
                      1.
                    </button>
                  </div>
                  <div className="w-px h-4 bg-black/10 mx-1"></div>

                  {/* Blocks */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() =>
                        injectFormatting("```javascript\n", "\n```")
                      }
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Código"
                    >
                      <Code size={14} />
                    </button>
                    <button
                      onClick={() => injectFormatting("> ", "\n")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Citação"
                    >
                      <Quote size={14} />
                    </button>
                    <button
                      onClick={() =>
                        injectFormatting(":::📌 **CALLOUT**\n", "\n:::")
                      }
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Callout"
                    >
                      <AlertCircle size={14} />
                    </button>
                  </div>
                  <div className="w-px h-4 bg-black/10 mx-1"></div>

                  {/* Insert */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => injectFormatting("[Link](", ")")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Link"
                    >
                      <LinkIcon size={14} />
                    </button>
                    <button
                      onClick={() => injectFormatting("![Imagem](", ")")}
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Imagem"
                    >
                      <FileText size={14} />
                    </button>
                    <button
                      onClick={() =>
                        injectFormatting(
                          "\n| Col 1 | Col 2 |\n| :--- | :--- |\n| Val 1 | Val 2 |\n",
                        )
                      }
                      className="p-1.5 hover:bg-black/5 rounded"
                      title="Tabela"
                    >
                      <FileSpreadsheet size={14} />
                    </button>
                  </div>

                  <div className="flex-1"></div>

                  {/* AI Quick Button */}
                  <button
                    onClick={() => setActiveRightTab("ai")}
                    className="px-2 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles size={12} /> ⌘ IA
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={activeSection.content}
                  onChange={(e) => updateActiveSectionContent(e.target.value)}
                  className="flex-1 w-full resize-none outline-none p-8 font-mono text-[13px] leading-relaxed text-[#111111] bg-white custom-scrollbar"
                  placeholder="Comece a escrever..."
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
                <FileText size={48} className="stroke-1 mb-4 opacity-50" />
                <p className="text-sm font-medium">
                  Selecione uma página para editar
                </p>
              </div>
            )}
          </div>

          {/* PREVIEW (42.5%) - Real Document Style */}
          <div className="flex-1 bg-[#F5F5F4] overflow-y-auto relative custom-scrollbar flex flex-col items-center py-10">
            {/* Zoom Controls */}
            <div className="fixed bottom-6 flex items-center bg-white border border-black/10 rounded-full shadow-lg p-1 z-10 text-xs font-semibold text-neutral-600">
              <button
                onClick={() => setPreviewZoom(80)}
                className={`px-3 py-1.5 rounded-full ${previewZoom === 80 ? "bg-black/5 text-black" : "hover:bg-black/5"}`}
              >
                80%
              </button>
              <button
                onClick={() => setPreviewZoom(100)}
                className={`px-3 py-1.5 rounded-full ${previewZoom === 100 ? "bg-black/5 text-black" : "hover:bg-black/5"}`}
              >
                100%
              </button>
              <button
                onClick={() => setPreviewZoom(125)}
                className={`px-3 py-1.5 rounded-full ${previewZoom === 125 ? "bg-black/5 text-black" : "hover:bg-black/5"}`}
              >
                125%
              </button>
              <button
                onClick={() => setPreviewZoom(150)}
                className={`px-3 py-1.5 rounded-full ${previewZoom === 150 ? "bg-black/5 text-black" : "hover:bg-black/5"}`}
              >
                150%
              </button>
              <div className="w-px h-4 bg-black/10 mx-1"></div>

              <button
                onClick={() => setPreviewMode("page")}
                className={`px-3 py-1.5 rounded-full ${previewMode === "page" ? "bg-black/5 text-black" : "hover:bg-black/5"}`}
              >
                Página Atual
              </button>
              <button
                onClick={() => setPreviewMode("full")}
                className={`px-3 py-1.5 rounded-full ${previewMode === "full" ? "bg-black/5 text-black" : "hover:bg-black/5"}`}
              >
                Visão Completa
              </button>

              <div className="w-px h-4 bg-black/10 mx-1"></div>
              <button
                onClick={triggerNativePrint}
                className="px-3 py-1.5 hover:bg-black/5 rounded-full text-indigo-600 flex items-center gap-1.5"
              >
                <Printer size={12} /> Imprimir
              </button>
            </div>

            {previewMode === "page" && activeSection && (
              <div
                className="bg-white rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-black/5 origin-top transition-transform duration-200"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: `${docPackage.print.marginTop}mm ${docPackage.print.marginRight}mm ${docPackage.print.marginBottom}mm ${docPackage.print.marginLeft}mm`,
                  transform: `scale(${previewZoom / 100})`,
                }}
              >
                <div className="prose prose-slate max-w-none prose-h1:text-2xl prose-h1:font-bold prose-h1:text-[#111111] prose-h2:text-lg prose-h2:font-bold prose-h2:text-[#111111] prose-a:text-indigo-600 prose-code:bg-black/5 prose-code:text-[#ef4444] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#111111] prose-pre:text-white prose-pre:p-4 prose-pre:rounded-xl prose-pre:whitespace-pre-wrap">
                  <Markdown>{activeSection.content}</Markdown>
                </div>
              </div>
            )}

            {previewMode === "full" && (
              <div
                className="origin-top transition-transform duration-200 flex flex-col items-center gap-8 pb-32"
                style={{
                  transform: `scale(${previewZoom / 100})`,
                }}
              >
                {renderPages()}
              </div>
            )}
          </div>

          {/* RIGHT PANEL (Collapsible Tabs) */}
          {!isFocusMode && (
            <div
              className={`bg-white border-l border-black/5 flex flex-shrink-0 transition-all duration-300 ease-in-out ${activeRightTab ? "w-[320px]" : "w-[56px]"}`}
            >
              {/* Tab Navigation */}
              <div className="w-[56px] border-r border-black/5 flex flex-col items-center py-4 gap-4 bg-[#FAFAFA] flex-shrink-0">
                <button
                  onClick={() =>
                    setActiveRightTab((prev) =>
                      prev === "metadata" ? null : "metadata",
                    )
                  }
                  className={`p-2.5 rounded-xl transition-colors ${activeRightTab === "metadata" ? "bg-[#111111] text-white" : "text-neutral-400 hover:text-black hover:bg-black/5"}`}
                  title="Metadados & Capa"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={() =>
                    setActiveRightTab((prev) => (prev === "ai" ? null : "ai"))
                  }
                  className={`p-2.5 rounded-xl transition-colors ${activeRightTab === "ai" ? "bg-indigo-600 text-white shadow-md" : "text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50"}`}
                  title="Copiloto IA"
                >
                  <Sparkles size={18} />
                </button>
                <button
                  onClick={() =>
                    setActiveRightTab((prev) =>
                      prev === "library" ? null : "library",
                    )
                  }
                  className={`p-2.5 rounded-xl transition-colors ${activeRightTab === "library" ? "bg-[#111111] text-white" : "text-neutral-400 hover:text-black hover:bg-black/5"}`}
                  title="Biblioteca de Blocos"
                >
                  <Layers size={18} />
                </button>
                <button
                  onClick={() =>
                    setActiveRightTab((prev) =>
                      prev === "history" ? null : "history",
                    )
                  }
                  className={`p-2.5 rounded-xl transition-colors ${activeRightTab === "history" ? "bg-[#111111] text-white" : "text-neutral-400 hover:text-black hover:bg-black/5"}`}
                  title="Histórico de Versões"
                >
                  <History size={18} />
                </button>
              </div>

              {/* Tab Content */}
              <div
                className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${activeRightTab ? "opacity-100" : "opacity-0 hidden"}`}
              >
                <div className="p-4 border-b border-black/5 bg-[#FAFAFA]">
                  <h3 className="font-bold text-[#111111] text-xs uppercase tracking-wider">
                    {activeRightTab === "metadata" && "Metadados & Capa"}
                    {activeRightTab === "ai" && "Copiloto IA"}
                    {activeRightTab === "library" && "Biblioteca Corporativa"}
                    {activeRightTab === "history" && "Histórico"}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 text-xs">
                  {activeRightTab === "metadata" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-neutral-500 uppercase">
                          Título da Capa
                        </label>
                        <input
                          value={docPackage.cover.title}
                          onChange={(e) =>
                            setDocPackage({
                              ...docPackage,
                              cover: {
                                ...docPackage.cover,
                                title: e.target.value,
                              },
                            })
                          }
                          className="border p-2 rounded-lg bg-white outline-none focus:border-black/20"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-neutral-500 uppercase">
                          Subtítulo
                        </label>
                        <input
                          value={docPackage.cover.subtitle}
                          onChange={(e) =>
                            setDocPackage({
                              ...docPackage,
                              cover: {
                                ...docPackage.cover,
                                subtitle: e.target.value,
                              },
                            })
                          }
                          className="border p-2 rounded-lg bg-white outline-none focus:border-black/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-neutral-500 uppercase">
                            Autor
                          </label>
                          <input
                            value={docPackage.cover.author}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                cover: {
                                  ...docPackage.cover,
                                  author: e.target.value,
                                },
                              })
                            }
                            className="border p-2 rounded-lg bg-white outline-none focus:border-black/20"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-neutral-500 uppercase">
                            Organização
                          </label>
                          <input
                            value={docPackage.cover.company}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                cover: {
                                  ...docPackage.cover,
                                  company: e.target.value,
                                },
                              })
                            }
                            className="border p-2 rounded-lg bg-white outline-none focus:border-black/20"
                          />
                        </div>
                      </div>
                      <div className="border-t border-black/5 pt-4 flex flex-col gap-3">
                        <span className="font-bold text-[#111111] text-sm uppercase">
                          Configurações Avançadas da Capa
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="hasCover"
                            checked={docPackage.cover.hasCover}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                cover: {
                                  ...docPackage.cover,
                                  hasCover: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <label
                            htmlFor="hasCover"
                            className="text-xs font-bold text-neutral-600"
                          >
                            Incluir Capa no PDF
                          </label>
                        </div>
                        {docPackage.cover.hasCover && (
                          <div className="flex flex-col gap-3 mt-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Categoria do Doc.
                                </label>
                                <input
                                  value={docPackage.cover.category}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        category: e.target.value,
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Marca D'Água
                                </label>
                                <input
                                  value={docPackage.cover.layout.watermark}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        layout: {
                                          ...docPackage.cover.layout,
                                          watermark: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                  placeholder="CONFIDENCIAL"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Versão
                                </label>
                                <input
                                  value={docPackage.cover.version}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        version: e.target.value,
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Data Criado
                                </label>
                                <input
                                  value={docPackage.cover.createdDate}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        createdDate: e.target.value,
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                Imagem de Destaque (URL)
                              </label>
                              <input
                                value={docPackage.cover.bgImage}
                                onChange={(e) =>
                                  setDocPackage({
                                    ...docPackage,
                                    cover: {
                                      ...docPackage.cover,
                                      bgImage: e.target.value,
                                    },
                                  })
                                }
                                className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                Tamanho da Imagem (%)
                              </label>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                value={docPackage.cover.bgImageSize}
                                onChange={(e) =>
                                  setDocPackage({
                                    ...docPackage,
                                    cover: {
                                      ...docPackage.cover,
                                      bgImageSize: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="border-y border-black/5 py-3 my-1 flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="showQrCode"
                                  checked={docPackage.cover.showQrCode}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        showQrCode: e.target.checked,
                                      },
                                    })
                                  }
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                                <label
                                  htmlFor="showQrCode"
                                  className="text-xs font-bold text-neutral-600"
                                >
                                  Mostrar QR Code na Capa
                                </label>
                              </div>
                              {docPackage.cover.showQrCode && (
                                <div className="flex flex-col gap-1.5">
                                  <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                    URL do QR Code
                                  </label>
                                  <input
                                    value={docPackage.cover.qrUrl}
                                    onChange={(e) =>
                                      setDocPackage({
                                        ...docPackage,
                                        cover: {
                                          ...docPackage.cover,
                                          qrUrl: e.target.value,
                                        },
                                      })
                                    }
                                    className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                    placeholder="https://..."
                                  />
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Revisor/Data Revisão
                                </label>
                                <input
                                  value={docPackage.cover.revisedDate}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        revisedDate: e.target.value,
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Cliente
                                </label>
                                <input
                                  value={docPackage.cover.client}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        client: e.target.value,
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Projeto
                                </label>
                                <input
                                  value={docPackage.cover.project}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        project: e.target.value,
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Alinhamento
                                </label>
                                <select
                                  value={docPackage.cover.layout.align}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        layout: {
                                          ...docPackage.cover.layout,
                                          align: e.target.value as
                                            | "left"
                                            | "center"
                                            | "right",
                                        },
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                >
                                  <option value="left">Esquerda</option>
                                  <option value="center">Centro</option>
                                  <option value="right">Direita</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                  Fonte
                                </label>
                                <select
                                  value={docPackage.cover.layout.fontFamily}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        layout: {
                                          ...docPackage.cover.layout,
                                          fontFamily: e.target.value as
                                            | "sans"
                                            | "serif"
                                            | "mono",
                                        },
                                      },
                                    })
                                  }
                                  className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                >
                                  <option value="sans">Sans-serif</option>
                                  <option value="serif">
                                    Serif (Elegante)
                                  </option>
                                  <option value="mono">
                                    Monospace (Técnico)
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                Cor Principal (Accent)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={docPackage.cover.layout.themeColor}
                                  onChange={(e) =>
                                    setDocPackage({
                                      ...docPackage,
                                      cover: {
                                        ...docPackage.cover,
                                        layout: {
                                          ...docPackage.cover.layout,
                                          themeColor: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                />
                                <span className="text-xs font-mono text-neutral-500">
                                  {docPackage.cover.layout.themeColor}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-neutral-500 uppercase text-[10px]">
                                Texto de Marca D'água
                              </label>
                              <input
                                value={docPackage.cover.layout.watermark}
                                onChange={(e) =>
                                  setDocPackage({
                                    ...docPackage,
                                    cover: {
                                      ...docPackage.cover,
                                      layout: {
                                        ...docPackage.cover.layout,
                                        watermark: e.target.value,
                                      },
                                    },
                                  })
                                }
                                className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                                placeholder="EX: CONFIDENCIAL"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-black/5 pt-4 flex flex-col gap-3">
                        <span className="font-bold text-[#111111] text-sm uppercase">
                          Cabeçalho & Rodapé
                        </span>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-neutral-500 uppercase text-[10px]">
                            Texto do Cabeçalho
                          </label>
                          <input
                            value={docPackage.print.headerText}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                print: {
                                  ...docPackage.print,
                                  headerText: e.target.value,
                                },
                              })
                            }
                            className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-neutral-500 uppercase text-[10px]">
                            Texto do Rodapé
                          </label>
                          <input
                            value={docPackage.print.footerText}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                print: {
                                  ...docPackage.print,
                                  footerText: e.target.value,
                                },
                              })
                            }
                            className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-neutral-500 uppercase">
                          Resumo
                        </label>
                        <textarea
                          value={docPackage.cover.description}
                          onChange={(e) =>
                            setDocPackage({
                              ...docPackage,
                              cover: {
                                ...docPackage.cover,
                                description: e.target.value,
                              },
                            })
                          }
                          className="border p-2 rounded-lg bg-white outline-none focus:border-black/20 h-20 resize-none"
                        />
                      </div>
                      <div className="border-t border-black/5 pt-4 flex flex-col gap-3">
                        <span className="font-bold text-neutral-500 uppercase">
                          Margens A4 de Impressão (mm)
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Top"
                            value={docPackage.print.marginTop}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                print: {
                                  ...docPackage.print,
                                  marginTop: Number(e.target.value),
                                },
                              })
                            }
                            className="border p-2 rounded-lg"
                          />
                          <input
                            type="number"
                            placeholder="Bottom"
                            value={docPackage.print.marginBottom}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                print: {
                                  ...docPackage.print,
                                  marginBottom: Number(e.target.value),
                                },
                              })
                            }
                            className="border p-2 rounded-lg"
                          />
                          <input
                            type="number"
                            placeholder="Left"
                            value={docPackage.print.marginLeft}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                print: {
                                  ...docPackage.print,
                                  marginLeft: Number(e.target.value),
                                },
                              })
                            }
                            className="border p-2 rounded-lg"
                          />
                          <input
                            type="number"
                            placeholder="Right"
                            value={docPackage.print.marginRight}
                            onChange={(e) =>
                              setDocPackage({
                                ...docPackage,
                                print: {
                                  ...docPackage.print,
                                  marginRight: Number(e.target.value),
                                },
                              })
                            }
                            className="border p-2 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeRightTab === "ai" && (
                    <div className="flex flex-col gap-4 h-full">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                            Ações Rápidas (Cursor Style)
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() =>
                                applyAIInstruction(
                                  "Corrigir gramática e ortografia do texto mantendo o mesmo tom.",
                                  "Corrigindo gramática...",
                                )
                              }
                              className="p-1.5 bg-white rounded-lg text-xs font-semibold text-neutral-700 hover:text-indigo-600 shadow-sm border border-black/5"
                            >
                              Corrigir Gramática
                            </button>
                            <button
                              onClick={() =>
                                applyAIInstruction(
                                  "Crie um resumo conciso de um parágrafo para o texto.",
                                  "Criando resumo...",
                                )
                              }
                              className="p-1.5 bg-white rounded-lg text-xs font-semibold text-neutral-700 hover:text-indigo-600 shadow-sm border border-black/5"
                            >
                              Criar Resumo
                            </button>
                            <button
                              onClick={() =>
                                applyAIInstruction(
                                  "Reescreva o texto de forma mais profissional e clara.",
                                  "Reescrevendo...",
                                )
                              }
                              className="p-1.5 bg-white rounded-lg text-xs font-semibold text-neutral-700 hover:text-indigo-600 shadow-sm border border-black/5"
                            >
                              Reescrever
                            </button>
                            <button
                              onClick={() =>
                                applyAIInstruction(
                                  "Deixe a linguagem mais técnica e corporativa.",
                                  "Melhorando linguagem...",
                                )
                              }
                              className="p-1.5 bg-white rounded-lg text-xs font-semibold text-neutral-700 hover:text-indigo-600 shadow-sm border border-black/5"
                            >
                              Tom Técnico
                            </button>
                          </div>
                        </div>

                        {aiError && (
                          <div className="text-red-500 bg-red-50 p-2 rounded-lg text-[10px] font-bold">
                            {aiError}
                          </div>
                        )}

                        <div className="flex-1 border rounded-xl bg-neutral-50 overflow-y-auto p-3 prose prose-sm max-w-none text-xs">
                          {aiResult ? (
                            <Markdown>{aiResult}</Markdown>
                          ) : (
                            <span className="text-neutral-400 italic">
                              O resultado da IA aparecerá aqui. Você pode
                              aplicar instruções no conteúdo selecionado do
                              editor.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Digite um prompt customizado..."
                          className="w-full h-20 p-3 border rounded-xl bg-white resize-none outline-none focus:border-indigo-500 transition-colors"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setAiResult("");
                              setAiPrompt("");
                            }}
                            className="p-2 border rounded-xl hover:bg-neutral-50 font-bold text-neutral-600 w-1/3"
                          >
                            Limpar
                          </button>
                          <button
                            onClick={() =>
                              applyAIInstruction(aiPrompt, "Processando...")
                            }
                            disabled={aiLoading || !aiPrompt.trim()}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex-1 flex justify-center items-center gap-2"
                          >
                            {aiLoading ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <Sparkles size={12} />
                            )}{" "}
                            Executar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeRightTab === "library" && (
                    <div className="flex flex-col gap-2">
                      <p className="text-neutral-500 mb-2">
                        Injete modelos com 1 clique:
                      </p>
                      {[
                        {
                          title: "Modelo de API",
                          text: `## Endpoint: /api/v1/...
**Método**: GET

### Parâmetros

### Respostas`,
                        },
                        {
                          title: "Análise SWOT",
                          text: `## Análise SWOT

**Strengths (Forças)**:

**Weaknesses (Fraquezas)**:

**Opportunities (Oportunidades)**:

**Threats (Ameaças)**:`,
                        },
                        {
                          title: "Aviso de Compliance",
                          text: `:::📌 **AVISO DE COMPLIANCE LGPD**
Os dados a seguir contêm PII...`,
                        },
                        {
                          title: "Checklist de Auditoria",
                          text: `## Checklist
- [ ] Validação de logs
- [ ] Revisão de acessos
- [ ] Backup verificado`,
                        },
                      ].map((tpl, i) => (
                        <button
                          key={i}
                          onClick={() => injectFormatting(tpl.text, "")}
                          className="p-3 border rounded-xl text-left hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                        >
                          <span className="font-bold text-[#111111] group-hover:text-indigo-600 block">
                            {tpl.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 mt-1 line-clamp-1">
                            {tpl.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeRightTab === "history" && (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setShowVersionModal(true)}
                        className="w-full p-2 bg-[#111111] text-white rounded-xl font-bold mb-2"
                      >
                        Criar Nova Tag de Versão
                      </button>
                      {docPackage.versions.length === 0 ? (
                        <span className="text-neutral-400 italic">
                          Nenhuma versão salva no histórico.
                        </span>
                      ) : (
                        docPackage.versions.map((ver) => (
                          <div
                            key={ver.id}
                            className="border rounded-xl p-3 hover:border-black/20 transition-colors cursor-pointer"
                            onClick={() =>
                              restoreVersionSnapshot(ver.contentSnapshot)
                            }
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-indigo-600">
                                V {ver.version}
                              </span>
                              <span className="text-[9px] text-neutral-400">
                                {new Date(ver.date).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[#111111] block mb-1 font-medium">
                              {ver.notes}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              Por {ver.author}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PRINT TARGET AREA (Hidden except when printing) */}
        {createPortal(
          <div
            id="print-area-only"
            className="hidden print:flex flex-col items-center print-area-pdf"
          >
            {renderPages()}
          </div>,
          document.body
        )}
      </div>

      {/* Version Tagging Modal overlay logic left unchanged/adapted slightly for space */}
      {showVersionModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[400px] shadow-2xl flex flex-col gap-4">
            <h3 className="font-bold text-lg">Criar Versão Fixa</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase">
                Label (Ex: 1.2 ou Final)
              </label>
              <input
                value={newVersionLabel}
                onChange={(e) => setNewVersionLabel(e.target.value)}
                className="border p-2 rounded-lg outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase">
                Notas da Versão
              </label>
              <textarea
                value={newVersionNotes}
                onChange={(e) => setNewVersionNotes(e.target.value)}
                className="border p-2 rounded-lg outline-none resize-none h-20"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 font-bold text-neutral-500"
              >
                Cancelar
              </button>
              <button
                onClick={saveMilestoneVersion}
                className="px-4 py-2 font-bold bg-[#111111] text-white rounded-xl"
              >
                Salvar Versão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
