import { useEffect, useState, useRef } from 'react';
import { 
  X, FileText, Check, Save, History, Star, Link as LinkIcon, 
  Building2, GitBranch, Sparkles, Wand2, Plus, Trash2, ArrowUp, 
  ArrowDown, Edit3, Eye, Printer, Layout, FileSpreadsheet, 
  FileSliders, Settings, Info, Calendar, User, Layers, Share2, 
  Globe, FileUp, Database, Compass, AlertCircle, HelpCircle, 
  ChevronRight, ChevronDown, CheckSquare, List, AlignLeft, 
  AlignCenter, AlignRight, AlignJustify, Type, Underline, 
  Strikethrough, Bold, Italic, Code, Quote, PlusCircle, AlertOctagon,
  Languages, Sparkle, RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

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
  layout: {
    padding: 'narrow' | 'normal' | 'wide';
    align: 'left' | 'center' | 'right';
    fontFamily: 'sans' | 'serif' | 'mono';
    themeColor: string;
    bgColor: string;
    watermark: string;
  }
}

interface PrintConfig {
  pageSize: 'A4';
  orientation: 'portrait' | 'landscape';
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
  onSave 
}: { 
  doc: any; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (d: any) => void; 
}) {
  const { token, user } = useAuth();
  
  // Navigation / Modal Main View Tab
  // 'editor' | 'cover' | 'print' | 'preview_pdf'
  const [activeTab, setActiveTab] = useState<'editor' | 'cover' | 'print' | 'preview_pdf'>('editor');
  
  // General states
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // State for complete Document Package
  const [docPackage, setDocPackage] = useState<DocPackage | null>(null);
  
  // Selected Tree item
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  
  // AI Tools inputs
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState('');
  
  // Manual version tagging state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('1.1');
  const [newVersionNotes, setNewVersionNotes] = useState('');

  // Target ref for editing area
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Default initial markdown for new sections
  const initialSectionMarkdown = `## Conteúdo da Seção\n\nComece a editar esta seção de documentação usando markdown ou os botões de formatação acima...`;

  // Fetch projects list for relationships
  useEffect(() => {
    const fetchProjects = async () => {
      if (token) {
        try {
          const res = await fetch('/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setProjectsList(data);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchProjects();
  }, [token]);

  // Load backend doc or create a default rich document package
  useEffect(() => {
    if (!isOpen) return;

    if (doc && doc.id) {
      let parsed: DocPackage;
      try {
        const json = JSON.parse(doc.content || '');
        if (json && json.documentPackage) {
          parsed = json;
        } else {
          throw new Error('Fallback to markdown');
        }
      } catch (e) {
        // Fallback or Upgrade existing plain markdown document to Document Package
        parsed = {
          documentPackage: true,
          chapters: [
            {
              id: 'chap_intro',
              title: '1. Introdução',
              sections: [
                {
                  id: 'sec_intro_1',
                  title: 'Visão Geral',
                  content: doc.content || '# Visão Geral\n\nEste é o conteúdo do documento escrito em **markdown**.'
                }
              ]
            }
          ],
          cover: {
            hasCover: true,
            title: doc.title || 'Manual Corporativo',
            subtitle: 'Especificações técnicas, operacionais e governança organizacional',
            author: user?.displayName || 'Administrador',
            company: 'CYZOR Tech',
            client: 'Ecossistema CYZOR',
            project: '',
            createdDate: new Date().toISOString().split('T')[0],
            revisedDate: new Date().toISOString().split('T')[0],
            version: '1.0',
            description: 'Esta documentação consolida os fluxos de processos, designs de capitais, especificações técnicas de negócio e visões estratégicas do ecossistema.',
            category: doc.folder || 'Processos',
            showQrCode: true,
            qrUrl: 'https://cyzor.com',
            logoUrl: '',
            bgImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
            layout: {
              padding: 'normal',
              align: 'center',
              fontFamily: 'sans',
              themeColor: '#111111',
              bgColor: '#FFFFFF',
              watermark: 'CONFIDENCIAL'
            }
          },
          print: {
            pageSize: 'A4',
            orientation: 'portrait',
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
            headerText: doc.title || 'Manual Técnico de Processos',
            footerText: 'CYZOR Control Enterprise Suite • Confidencial',
            showPageNumbers: true,
            autoTOC: true
          },
          versions: [
            {
              id: 'v_init',
              version: '1.0',
              date: new Date().toLocaleString(),
              author: user?.displayName || 'Admin',
              notes: 'Importação automática do conteúdo legado.',
              contentSnapshot: doc.content || ''
            }
          ]
        };
      }

      setDocPackage(parsed);
      setSelectedProjectId(doc.projectId ? String(doc.projectId) : (parsed.cover.project || ''));
      
      // Auto-select first chapter & section
      if (parsed.chapters.length > 0) {
        setActiveChapterId(parsed.chapters[0].id);
        if (parsed.chapters[0].sections.length > 0) {
          setActiveSectionId(parsed.chapters[0].sections[0].id);
        } else {
          setActiveSectionId('');
        }
      } else {
        setActiveChapterId('');
        setActiveSectionId('');
      }
      setIsEditing(false);
    } else {
      // New Document Template
      const newPackage: DocPackage = {
        documentPackage: true,
        chapters: [
          {
            id: 'chap_1',
            title: '1. Introdução e Propósito',
            sections: [
              {
                id: 'sec_1_1',
                title: 'Alinhamento Estratégico',
                content: '# Alinhamento Estratégico\n\nDescreva os objetivos fundamentais desta documentação corporativa...'
              },
              {
                id: 'sec_1_2',
                title: 'Escopo de Atuação',
                content: '# Escopo do Trabalho\n\nDetalhamento prático dos recursos cobertos...'
              }
            ]
          },
          {
            id: 'chap_2',
            title: '2. Arquitetura e Engenharia',
            sections: [
              {
                id: 'sec_2_1',
                title: 'Visão Arquitetural de Sistema',
                content: '# Arquitetura Geral\n\nIncorpore as especificidades do modelo computacional...'
              }
            ]
          }
        ],
        cover: {
          hasCover: true,
          title: doc?.title || 'Relatório de Engenharia e Processos',
          subtitle: 'Especificação técnica integrada com ecossistemas SaaS',
          author: user?.displayName || 'Engenharia CYZOR',
          company: 'CYZOR Hub',
          client: 'Cliente Corporativo',
          project: doc?.projectId ? String(doc.projectId) : '',
          createdDate: new Date().toISOString().split('T')[0],
          revisedDate: new Date().toISOString().split('T')[0],
          version: '1.0',
          description: 'Modelo de documentação sistêmica unificada para as operações e auditorias de desempenho de sistemas de alta resiliência.',
          category: doc?.folder || 'Engenharia',
          showQrCode: true,
          qrUrl: 'https://cyzor.com',
          logoUrl: '',
          bgImage: '',
          layout: {
            padding: 'normal',
            align: 'center',
            fontFamily: 'sans',
            themeColor: '#111111',
            bgColor: '#FFFFFF',
            watermark: 'DRAFT'
          }
        },
        print: {
          pageSize: 'A4',
          orientation: 'portrait',
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
          headerText: doc?.title || 'Documentação Organizacional Corporativa',
          footerText: 'Todos os direitos reservados • Documento Interno',
          showPageNumbers: true,
          autoTOC: true
        },
        versions: [
          {
            id: 'v_init',
            version: '1.0',
            date: new Date().toLocaleString(),
            author: user?.displayName || 'Autor Principal',
            notes: 'Criação inicial da estrutura corporativa.',
            contentSnapshot: ''
          }
        ]
      };

      setDocPackage(newPackage);
      setSelectedProjectId(doc?.projectId ? String(doc.projectId) : '');
      setActiveChapterId('chap_1');
      setActiveSectionId('sec_1_1');
      setIsEditing(true); // Se for novo, inicia editando
    }
  }, [doc, isOpen]);

  if (!isOpen || !docPackage) return null;

  // Active elements references
  const activeChapter = docPackage.chapters.find(c => c.id === activeChapterId);
  const activeSection = activeChapter?.sections.find(s => s.id === activeSectionId);

  // Save the complete Document Package stringified to the database
  const handleSaveDocument = async () => {
    setLoading(true);
    try {
      const dbPayload = {
        title: docPackage.cover.title || 'Documento Corporativo',
        content: JSON.stringify(docPackage),
        folder: docPackage.cover.category || doc?.folder || 'Geral',
        projectId: selectedProjectId ? Number(selectedProjectId) : null,
        isFavorite: doc?.isFavorite || false
      };

      let res;
      if (doc?.id) {
        res = await fetch(`/api/documents/${doc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(dbPayload)
        });
      } else {
        res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(dbPayload)
        });
      }

      if (res.ok) {
        const savedDoc = await res.json();
        onSave(savedDoc);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Erro ao salvar documento:', e);
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting injector
  const injectFormatting = (before: string, after: string = '') => {
    if (!textareaRef.current || !activeSection) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = activeSection.content;
    const selectedText = text.substring(start, end);
    const replacement = before + (selectedText || 'texto_aqui') + after;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    // Update State
    updateActiveSectionContent(newContent);

    // Dynamic focus restore
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + before.length, start + before.length + (selectedText ? selectedText.length : 'texto_aqui'.length));
      }
    }, 50);
  };

  const updateActiveSectionContent = (content: string) => {
    if (!activeChapterId || !activeSectionId) return;

    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map(chap => {
          if (chap.id !== activeChapterId) return chap;
          return {
            ...chap,
            sections: chap.sections.map(sec => {
              if (sec.id !== activeSectionId) return sec;
              return { ...sec, content };
            })
          };
        })
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
          title: 'Introdução Secundária',
          content: '# Introdução\n\nInsira a base informacional aqui...'
        }
      ]
    };

    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: [...prev.chapters, newChap]
      };
    });
    setActiveChapterId(key);
    setActiveSectionId(newChap.sections[0].id);
  };

  const addSection = (chapId: string) => {
    const chap = docPackage.chapters.find(c => c.id === chapId);
    if (!chap) return;
    const secKey = `sec_dyn_${Date.now()}`;
    const newSec: Section = {
      id: secKey,
      title: `Subseção Adicional ${chap.sections.length + 1}`,
      content: initialSectionMarkdown
    };

    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map(c => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            sections: [...c.sections, newSec]
          };
        })
      };
    });
    setActiveChapterId(chapId);
    setActiveSectionId(secKey);
  };

  const renameChapter = (chapId: string, title: string) => {
    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map(c => c.id === chapId ? { ...c, title } : c)
      };
    });
  };

  const renameSection = (chapId: string, secId: string, title: string) => {
    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map(c => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            sections: c.sections.map(s => s.id === secId ? { ...s, title } : s)
          };
        })
      };
    });
  };

  const deleteChapter = (chapId: string) => {
    if (docPackage.chapters.length <= 1) return; // Must hold at least 1
    setDocPackage(prev => {
      if (!prev) return null;
      const filtered = prev.chapters.filter(c => c.id !== chapId);
      return { ...prev, chapters: filtered };
    });
    // Auto shift selected
    const remaining = docPackage.chapters.filter(c => c.id !== chapId);
    setActiveChapterId(remaining[0].id);
    setActiveSectionId(remaining[0].sections[0]?.id || '');
  };

  const deleteSection = (chapId: string, secId: string) => {
    const chap = docPackage.chapters.find(c => c.id === chapId);
    if (!chap || chap.sections.length <= 1) return; // Keep at least one

    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map(c => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            sections: c.sections.filter(s => s.id !== secId)
          };
        })
      };
    });

    const rem = chap.sections.filter(s => s.id !== secId);
    setActiveSectionId(rem[0].id);
  };

  // Positioning movers
  const moveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= docPackage.chapters.length) return;

    setDocPackage(prev => {
      if (!prev) return null;
      const arr = [...prev.chapters];
      const temp = arr[index];
      arr[index] = arr[targetIndex];
      arr[targetIndex] = temp;
      return { ...prev, chapters: arr };
    });
  };

  const moveSection = (chapId: string, index: number, direction: 'up' | 'down') => {
    const chap = docPackage.chapters.find(c => c.id === chapId);
    if (!chap) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chap.sections.length) return;

    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chapters: prev.chapters.map(c => {
          if (c.id !== chapId) return c;
          const sArr = [...c.sections];
          const temp = sArr[index];
          sArr[index] = sArr[targetIndex];
          sArr[targetIndex] = temp;
          return { ...c, sections: sArr };
        })
      };
    });
  };

  // Library structures templates injectors
  const injectTemplate = (type: string) => {
    let content = '';
    if (type === 'api') {
      content = `# Documentação de API Técnica\n\n### 🌐 Endpoint: \`POST /api/v1/auth/sync\`\n\nRealiza a sincronização e provisionamento do workspace corporativo.\n\n#### 📥 Request Headers:\n| Header | Tipo | Obrigatório | Descrição |\n| :--- | :--- | :--- | :--- |\n| Authorization | String | Sim | Bearer Token de autenticação |\n| Content-Type | String | Sim | deve ser \`application/json\` |\n\n\n> 💡 **Nota do Arquiteto:** Verifique os limites de cotas de APIs do plano contratado antes de integrar fluxos automáticos de sincronismo.\n\n\`\`\`json\n{\n  "uid": "usr_99837aef",\n  "workspaceId": 12,\n  "timezone": "America/Sao_Paulo"\n}\n\`\`\`\n\n#### 📤 Response (200 OK):\n\`\`\`json\n{\n  "status": "synchronized",\n  "activeWorkspace": {\n    "id": 12,\n    "name": "CYZOR Headquarters",\n    "plan": "Enterprise"\n  }\n}\n\`\`\`\n`;
    } else if (type === 'guide') {
      content = `# Relatório Executivo & SWOT Organizacional\n\n## 1. Sumário Executivo\nEste documento descreve as decisões de arquitetura e mitigação operacional adotadas durante as revisões gerais de performance do sistema corporativo.\n\n### Matriz SWOT Aplicada:\n\n*   **Forças (Strengths):** Engine Postgres nativo persistente de alta velocidade.\n*   **Oportunidades (Opportunities):** Integração com modelos generativos corporativos Gemini.\n*   **Fraquezas (Weaknesses):** Latência na verificação em múltiplos brokers.\n*   **Ameaças (Threats):** Mudanças regulatórias de proteção de dados (LGPD).\n\n---\n\n### 📈 Resumo do Acordo de Nível de Serviço (SLA):\n| Serviço | SLA Garantido | Meta Interna | Status |\n| :--- | :--- | :--- | :--- |\n| API Portal | 99.9% | 99.95% | Atendido |\n| Storage Cloud | 99.99% | 100% | Atendido |\n`;
    } else if (type === 'warning') {
      content = `\n:::📌 **AVISO DE SEGURANÇA E COMPLIANCE**\n\nEste documento é de uso estritamente restrito. De acordo com os padrões da LGPD e regulamento de conformidade de informação e auditoria externa, o vazamento ou reprodução não autorizada deste conteúdo acarretará sansões severas vigentes em diretrizes internas de segurança.\n:::\n`;
    } else {
      content = `# Estrutura Geral e Checklist de Aceite\n\n- [ ] Definição clara dos objetivos estratégicos\n- [ ] Levantamento de infraestrutura provisionada\n- [ ] Aceite assinado pelo patrocinador (Sponsor)\n- [ ] Liberação da documentação pela auditoria regulatória\n`;
    }

    updateActiveSectionContent(content);
  };

  // AI Generative integrations
  const runAiService = async (mode: 'rewrite' | 'grammar' | 'summary' | 'contextual') => {
    if (!token || !activeSection) return;
    setAiLoading(true);
    setAiError('');
    
    let prompt = '';
    
    if (mode === 'grammar') {
      prompt = `Corrija e melhore gramaticalmente o seguinte conteúdo em markdown, mantendo um tom extremamente corporativo, profissional e polido. Mantenha os mesmos marcadores markdown e estrutura. Texto:\n\n${activeSection.content}`;
    } else if (mode === 'summary') {
      prompt = `Gere um sumário executivo profissional de alto impacto e metas claras (bullet-points) baseado no seguinte conteúdo em markdown:\n\n${activeSection.content}`;
    } else if (mode === 'contextual') {
      const selectedProjObj = projectsList.find(p => String(p.id) === selectedProjectId);
      const projContext = selectedProjObj ? `Nome do Projeto: ${selectedProjObj.name}. Descrição: ${selectedProjObj.description || 'N/A'}` : 'Geral';
      prompt = `Crie uma seção completa de documentação técnica/estratégica corporativa de acordo com o seguinte contexto de projeto: ${projContext}. Use markdown, inclua tabelas informativas, objetivos claros e callouts de observações relevantes. Seja profissional e detalhado.`;
    } else {
      // Custom instructions
      if (!aiPrompt.trim()) {
        setAiError('Coloque uma instrução personalizada no campo acima.');
        setAiLoading(false);
        return;
      }
      prompt = `Modifique o seguinte markdown com base na instrução fornecida. Forneça apenas o markdown resultante.\n\nInstrução: ${aiPrompt}\n\nConteúdo atual:\n\n${activeSection.content}`;
    }

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setAiResult(data.text);
          // Auto update active section
          updateActiveSectionContent(data.text);
          setAiPrompt('');
        }
      } else {
        const errData = await res.json();
        setAiError(errData.error || 'Erro na infraestrutura do Gemini');
      }
    } catch (e) {
      setAiError('Falha interna de rede ao conectar à IA.');
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
      author: user?.displayName || 'Administrador',
      notes: newVersionNotes || 'Revisão manual corporativa.',
      contentSnapshot: JSON.stringify(docPackage)
    };

    setDocPackage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        versions: [historyItem, ...prev.versions],
        cover: {
          ...prev.cover,
          version: newVersionLabel
        }
      };
    });

    setShowVersionModal(false);
    setNewVersionNotes('');
  };

  const restoreVersionSnapshot = (snapshotJson: string) => {
    try {
      const parsed = JSON.parse(snapshotJson);
      if (parsed && parsed.documentPackage) {
        setDocPackage(parsed);
        if (parsed.chapters.length > 0) {
          setActiveChapterId(parsed.chapters[0].id);
          setActiveSectionId(parsed.chapters[0].sections[0]?.id || '');
        }
      }
    } catch (e) {
      console.error('Falha ao restaurar versão:', e);
    }
  };

  // Print system handler browser trigger
  const triggerNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full h-[95vh] sm:h-[95vh] rounded-t-[24px] sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_30px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Style tag injected exclusively for beautiful, perfect native browser print behavior */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-area-only, #print-area-only * {
              visibility: visible !important;
            }
            #print-area-only {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background-color: #FFFFFF !important;
              color: #111111 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .a4-page-sheet {
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 20mm !important;
              page-break-after: always !important;
              width: 100% !important;
              height: auto !important;
              min-height: auto !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* TOP COMPREHENSIVE HEADER CONTROLS */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#0F172A0F] bg-[#FAFAFA]/95 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
          
          {/* Left info badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#111111] flex items-center justify-center text-[#FFFFFF] shadow-md flex-shrink-0">
              <FileSpreadsheet size={18} />
            </div>
            <div className="text-left overflow-hidden min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-display font-bold text-[#111111] truncate">{docPackage.cover.title}</h2>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#111111]/5 border border-[#111111]/10 px-2 py-0.5 rounded-full text-[#64748B]">v{docPackage.cover.version}</span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] truncate mt-0.5">Editor Enterprise • Categoria: {docPackage.cover.category}</p>
            </div>
          </div>

          {/* Core Central Navigation Tabs */}
          <div className="flex items-center justify-center bg-zinc-200/50 p-1 rounded-[16px] border border-[#0F172A0D] self-center">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-bold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === 'editor' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs' : 'text-[#64748B] hover:text-[#111111]'
              }`}
            >
              <Edit3 size={13} />
              <span>Conteúdo</span>
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-bold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === 'cover' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs' : 'text-[#64748B] hover:text-[#111111]'
              }`}
            >
              <Layout size={13} />
              <span>Capa</span>
            </button>
            <button
              onClick={() => setActiveTab('print')}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-bold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === 'print' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs' : 'text-[#64748B] hover:text-[#111111]'
              }`}
            >
              <FileSliders size={13} />
              <span>Layout A4</span>
            </button>
            <button
              onClick={() => setActiveTab('preview_pdf')}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-bold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === 'preview_pdf' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs animate-pulse' : 'text-[#64748B] hover:text-[#111111]'
              }`}
            >
              <Eye size={13} />
              <span>Visualizar PDF</span>
            </button>
          </div>

          {/* Active Global Save / Control functions */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button 
              onClick={handleSaveDocument}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold bg-[#111111] text-[#FFFFFF] hover:bg-black rounded-[14px] flex items-center gap-1.5 border border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.12)] disabled:opacity-50 transition-all pointer-events-auto cursor-pointer"
            >
              <Save size={13} />
              <span>{loading ? 'Salvando...' : 'Salvar Documento'}</span>
            </button>

            <button
              onClick={() => setShowVersionModal(true)}
              className="p-2 bg-white hover:bg-neutral-50 rounded-[14px] border border-[#DEE2E6] text-neutral-600 transition-colors"
              title="Gerenciar Versão"
            >
              <History size={14} />
            </button>

            <button
              onClick={triggerNativePrint}
              className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-[14px] text-white transition-colors"
              title="Imprimir / Exportar PDF"
            >
              <Printer size={14} />
            </button>

            <div className="w-px h-6 bg-[#0F172A0D] mx-1"></div>

            <button 
              onClick={onClose} 
              className="w-10 h-10 bg-white hover:bg-[#E2E8F0]/40 rounded-[14px] flex items-center justify-center text-[#111111] border border-[#DEE2E6] transition-all"
            >
              <X size={16} />
            </button>
          </div>

        </div>

        {/* WORKSPACE CONTENT AREA WITH INTEGRATED MULTI-TABS */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* TAB 1: ADVANCED HIERARCHICAL DOCUMENT CONTENT WRITER */}
          {activeTab === 'editor' && (
            <>
              {/* LEFT PART: COMPREHENSIVE STRUCTURAL TREE HIERARCHY */}
              <div className="w-full lg:w-[280px] bg-[#FAFAFA] border-r border-[#0F172A0F] flex flex-col flex-shrink-0 max-h-[30vh] lg:max-h-full">
                
                {/* Structure Header */}
                <div className="p-4 border-b border-[#0F172A0D] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Hierarquia Documental</span>
                  <button 
                    onClick={addChapter}
                    className="p-1 px-2 text-[10px] font-bold bg-[#111111] text-[#FFFFFF] hover:bg-black rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} /> Novo Cap.
                  </button>
                </div>

                {/* Tree Body list */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar text-left text-xs">
                  {docPackage.chapters.map((chap, cIndex) => {
                    const isPassedChap = activeChapterId === chap.id;
                    return (
                      <div key={chap.id} className="flex flex-col gap-1 border-b border-black/5 pb-2 last:border-none">
                        
                        {/* Chapter Headline bar */}
                        <div className={`p-2 rounded-[10px] flex items-center justify-between gap-1.5 transition-colors ${
                          isPassedChap ? 'bg-[#111111]/5 border border-[#111111]/10' : 'hover:bg-neutral-100'
                        }`}>
                          <div className="flex items-center gap-1 overflow-hidden flex-1">
                            <ChevronDown size={12} className="text-[#64748B] shrink-0" />
                            <input
                              value={chap.title}
                              onChange={e => renameChapter(chap.id, e.target.value)}
                              className="font-bold text-[#111111] bg-transparent outline-none w-full border-none p-0 text-xs truncate cursor-text"
                            />
                          </div>

                          {/* Move arrows and delete */}
                          <div className="flex items-center gap-0.5 shrink-0 select-none">
                            <button onClick={() => moveChapter(cIndex, 'up')} className="p-0.5 hover:bg-[#FFFFFF]/80 text-[#64748B] rounded" title="Subir Capítulo">
                              <ArrowUp size={11} />
                            </button>
                            <button onClick={() => moveChapter(cIndex, 'down')} className="p-0.5 hover:bg-[#FFFFFF]/80 text-[#64748B] rounded" title="Descer Capítulo">
                              <ArrowDown size={11} />
                            </button>
                            <button onClick={() => deleteChapter(chap.id)} className="p-0.5 text-rose-500 hover:bg-[#FFFFFF]/80 rounded" title="Excluir">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Chapter Sections inner list */}
                        <div className="pl-4 flex flex-col gap-1 mt-1">
                          {chap.sections.map((sec, sIndex) => {
                            const isPassedSec = activeSectionId === sec.id;
                            return (
                              <div
                                key={sec.id}
                                onClick={() => {
                                  setActiveChapterId(chap.id);
                                  setActiveSectionId(sec.id);
                                }}
                                className={`group p-2 rounded-[8px] flex items-center justify-between transition-all cursor-pointer ${
                                  isPassedSec 
                                    ? 'bg-[#111111] text-[#FFFFFF]' 
                                    : 'hover:bg-neutral-100 text-[#111111]/80 font-medium'
                                }`}
                              >
                                <input
                                  value={sec.title}
                                  onChange={e => renameSection(chap.id, sec.id, e.target.value)}
                                  className={`p-0 border-none bg-transparent outline-none text-xs w-full flex-1 truncate cursor-pointer ${
                                    isPassedSec ? 'text-white' : 'text-[#111111]'
                                  }`}
                                />

                                {/* Section control buttons */}
                                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 select-none ml-1">
                                  <button onClick={(e) => { e.stopPropagation(); moveSection(chap.id, sIndex, 'up'); }} className="p-0.5 hover:bg-[#FFFFFF]/25 text-[#FFFFFA]/60 rounded">
                                    <ArrowUp size={10} />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); moveSection(chap.id, sIndex, 'down'); }} className="p-0.5 hover:bg-[#FFFFFF]/25 text-[#FFFFFA]/60 rounded">
                                    <ArrowDown size={10} />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteSection(chap.id, sec.id); }} className="p-0.5 text-rose-400 hover:bg-[#FFFFFF]/25 rounded">
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add section button inside chapter */}
                          <button
                            onClick={() => addSection(chap.id)}
                            className="p-1 text-[10px] font-bold text-neutral-500 text-left hover:text-[#111111] transition-colors flex items-center gap-1 w-full pl-2 cursor-pointer mt-0.5"
                          >
                            <Plus size={10} /> Adicionar Subseção
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

              {/* CENTER PART: INTEGRATED VISUAL/MARKDOWN WYSIWYG EDITOR */}
              <div className="flex-1 flex flex-col bg-[#FFFFFF] overflow-hidden">
                {activeSection ? (
                  <>
                    {/* Rich Formatted Formatting Control Bar */}
                    <div className="border-b border-[#0F172A0D] p-2 bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-1 shrink-0">
                      
                      <div className="flex items-center flex-wrap gap-1">
                        {/* Heading tags selectors */}
                        <div className="flex rounded-lg border border-[#DEE2E6] bg-white p-0.5">
                          <button onClick={() => injectFormatting('# ', '\n')} className="p-1 px-1.5 text-[10px] font-bold hover:bg-neutral-100 rounded text-neutral-700" title="H1">H1</button>
                          <button onClick={() => injectFormatting('## ', '\n')} className="p-1 px-1.5 text-[10px] font-bold hover:bg-neutral-100 rounded text-neutral-700" title="H2">H2</button>
                          <button onClick={() => injectFormatting('### ', '\n')} className="p-1 px-1.5 text-[10px] font-bold hover:bg-neutral-100 rounded text-neutral-700" title="H3">H3</button>
                          <button onClick={() => injectFormatting('#### ', '\n')} className="p-1 px-1.5 text-[10px] font-bold hover:bg-neutral-100 rounded text-neutral-700" title="H4">H4</button>
                        </div>

                        {/* Traditional formatting buttons */}
                        <button onClick={() => injectFormatting('**', '**')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Negrito"><Bold size={13} /></button>
                        <button onClick={() => injectFormatting('*', '*')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Itálico"><Italic size={13} /></button>
                        <button onClick={() => injectFormatting('<u>', '</u>')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Sublinhado"><Underline size={13} /></button>
                        <button onClick={() => injectFormatting('~~', '~~')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Tachado"><Strikethrough size={13} /></button>

                        <div className="w-px h-5 bg-[#DEE2E6] mx-0.5"></div>

                        {/* List operators */}
                        <button onClick={() => injectFormatting('- ', '\n')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Itemizada"><List size={13} /></button>
                        <button onClick={() => injectFormatting('1. ', '\n')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Numerada"><span className="text-[10px] font-bold">123</span></button>
                        <button onClick={() => injectFormatting('- [ ] ', '\n')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Checklist"><CheckSquare size={13} /></button>

                        <div className="w-px h-5 bg-[#DEE2E6] mx-0.5"></div>

                        {/* Advanced structures blocks */}
                        <button onClick={() => injectFormatting('```javascript\n', '\n```')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Código"><Code size={13} /></button>
                        <button onClick={() => injectFormatting('> ', '\n')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Citação"><Quote size={13} /></button>
                        <button onClick={() => injectFormatting('\n| Coluna 1 | Coluna 2 |\n| :--- | :--- |\n| Dado 1 | Dado 2 |\n')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Tabela"><FileSpreadsheet size={13} /></button>
                        <button onClick={() => injectFormatting(':::📌 **OBSERVAÇÃO E CALLOUT**\n', '\n:::')} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Notificação Callout"><AlertCircle size={13} /></button>
                        <button onClick={() => injectFormatting('[Link](', ')') } className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 border border-[#DEE2E6] bg-white" title="Link de referência"><LinkIcon size={13} /></button>
                      </div>

                      {/* Right Switch View */}
                      <div className="flex items-center gap-1.5">
                        {!isEditing ? (
                          <button onClick={() => setIsEditing(true)} className="p-1 px-3 text-[11px] font-bold bg-[#111111] text-[#FFFFFF] rounded-lg">Foco Edição</button>
                        ) : (
                          <button onClick={() => setIsEditing(false)} className="p-1 px-3 text-[11px] font-bold bg-white border border-[#DEE2E6] text-neutral-800 rounded-lg">Foco Visualização</button>
                        )}
                      </div>

                    </div>

                    {/* Side-by-Side Dual Pane Editor */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                      
                      {/* Left: Input Textarea */}
                      <div className={`flex-1 h-full flex flex-col p-4 border-r border-[#0F172A0D] ${!isEditing && 'hidden md:flex'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Edição Markdown</label>
                        </div>
                        <textarea
                          ref={textareaRef}
                          value={activeSection.content}
                          onChange={e => updateActiveSectionContent(e.target.value)}
                          className="w-full flex-1 resize-none outline-none text-[#111111] font-mono text-sm leading-loose bg-[#FAFBFD] p-3 rounded-xl border border-black/5"
                          placeholder="Digite ou injete templates de documentação..."
                        />
                      </div>

                      {/* Right: Markdown parser Live Render */}
                      <div className={`flex-1 h-full flex flex-col p-4 bg-white overflow-y-auto custom-scrollbar ${isEditing && 'hidden md:flex'}`}>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 text-left">Preview Formatado</span>
                        <div className="prose prose-slate max-w-none text-left prose-h1:text-2xl prose-h1:font-display prose-h1:font-bold prose-h1:text-[#111111] prose-h2:text-lg prose-h2:font-bold prose-h2:text-[#111111] prose-a:text-indigo-600 prose-code:bg-[#FAFAFA] prose-code:text-[#ef4444] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-[#111111] prose-pre:text-white prose-pre:p-4 prose-pre:rounded-xl">
                          <Markdown>{activeSection.content}</Markdown>
                        </div>
                      </div>

                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400">
                    <FileText size={48} className="stroke-1 animate-bounce" />
                    <p className="mt-4 font-medium text-sm">Selecione ou crie um capítulo na árvore documental ao lado.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: ADVANCED COVER BUILDER & PREVIEW DESIGNER */}
          {activeTab === 'cover' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-[#FFFFFF]">
              
              {/* Cover config options list */}
              <div className="w-full md:w-[380px] p-6 border-r border-[#0F172A0F] overflow-y-auto custom-scrollbar flex flex-col gap-5 text-left shrink-0">
                <div className="border-b pb-3 mb-1">
                  <h3 className="font-display font-bold text-sm text-[#111111]">Metadados da Capa</h3>
                  <p className="text-[11px] font-medium text-[#64748B]">Personalize os dados de apresentação editorial.</p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Título Principal</label>
                  <input
                    value={docPackage.cover.title}
                    onChange={e => setDocPackage({
                      ...docPackage,
                      cover: { ...docPackage.cover, title: e.target.value }
                    })}
                    className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111] font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Subtítulo do Documento</label>
                  <input
                    value={docPackage.cover.subtitle}
                    onChange={e => setDocPackage({
                      ...docPackage,
                      cover: { ...docPackage.cover, subtitle: e.target.value }
                    })}
                    className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Autor</label>
                    <input
                      value={docPackage.cover.author}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, author: e.target.value }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111] font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Organização</label>
                    <input
                      value={docPackage.cover.company}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, company: e.target.value }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Cliente</label>
                    <input
                      value={docPackage.cover.client}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, client: e.target.value }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Categoria</label>
                    <input
                      value={docPackage.cover.category}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, category: e.target.value }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Criado Em</label>
                    <input
                      type="date"
                      value={docPackage.cover.createdDate}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, createdDate: e.target.value }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Revisado Em</label>
                    <input
                      type="date"
                      value={docPackage.cover.revisedDate}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, revisedDate: e.target.value }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Resumo / Descrição (Capa)</label>
                  <textarea
                    value={docPackage.cover.description}
                    onChange={e => setDocPackage({
                      ...docPackage,
                      cover: { ...docPackage.cover, description: e.target.value }
                    })}
                    className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-[#111111] h-16 resize-none"
                  />
                </div>

                <div className="border-t pt-3 flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase">Customização Visual da Capa</h4>
                  
                  {/* Theme coloring options */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-neutral-500">Cor Temática de Destaque</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={docPackage.cover.layout.themeColor}
                        onChange={e => setDocPackage({
                          ...docPackage,
                          cover: {
                            ...docPackage.cover,
                            layout: { ...docPackage.cover.layout, themeColor: e.target.value }
                          }
                        })}
                        className="w-10 h-8 rounded border p-0 cursor-pointer"
                      />
                      <span className="text-xs font-mono font-medium text-neutral-600">{docPackage.cover.layout.themeColor}</span>
                    </div>
                  </div>

                  {/* Watermark text */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Marca d'água no Rodapé</label>
                    <input
                      value={docPackage.cover.layout.watermark}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: {
                          ...docPackage.cover,
                          layout: { ...docPackage.cover.layout, watermark: e.target.value }
                        }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-neutral-700 font-bold uppercase tracking-widest"
                      placeholder="CONFIDENCIAL, DRAFT ou RESTRITO"
                    />
                  </div>

                  {/* Banner background main image */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">URL Imagem Banners / Capa</label>
                    <input
                      value={docPackage.cover.bgImage}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, bgImage: e.target.value }
                      })}
                      className="p-2 border rounded-xl text-xs bg-[#FFFFFF] outline-none text-neutral-600 truncate"
                      placeholder="Cole link de imagem para background..."
                    />
                  </div>

                  {/* QR Code toggler */}
                  <div className="flex items-center justify-between border bg-neutral-50 p-3 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-[#111111] block">QR Code na Capa</span>
                      <span className="text-[10px] text-neutral-500 block">Link de assinatura externa</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={docPackage.cover.showQrCode}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        cover: { ...docPackage.cover, showQrCode: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* Cover Live Screen Representation / Mock A4 Cover Sheet */}
              <div className="flex-1 bg-[#F1F3F5] p-6 overflow-y-auto flex items-center justify-center custom-scrollbar">
                
                <div 
                  className="bg-white border rounded shadow-xl p-12 flex flex-col justify-between text-center relative overflow-hidden"
                  style={{
                    width: '390px',
                    height: '550px',
                    fontFamily: docPackage.cover.layout.fontFamily === 'serif' ? 'Georgia, serif' : docPackage.cover.layout.fontFamily === 'mono' ? 'monospace' : 'sans-serif'
                  }}
                >
                  {/* Color strip accent bar */}
                  <div className="absolute top-0 left-0 w-full h-2.5" style={{ backgroundColor: docPackage.cover.layout.themeColor }}></div>

                  {/* Watermark diagonal overlay text */}
                  {docPackage.cover.layout.watermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
                      <span className="text-5xl font-black tracking-widest uppercase -rotate-45">{docPackage.cover.layout.watermark}</span>
                    </div>
                  )}

                  {/* Top layout organization */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] block mb-2">{docPackage.cover.company || 'CYZOR HUB'}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest border border-dashed rounded px-2.5 py-0.5">{docPackage.cover.category || 'Especificação'}</span>
                  </div>

                  {/* Center main Title & subtitle */}
                  <div className="my-auto flex flex-col gap-3 py-6 px-4">
                    
                    {/* Visual mockup background cover picture if present */}
                    {docPackage.cover.bgImage && (
                      <div className="w-full h-16 rounded-xl overflow-hidden mb-4 bg-muted relative border">
                        <img src={docPackage.cover.bgImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>
                    )}

                    <h1 className="text-xl font-bold tracking-tight text-[#111111]" style={{ color: docPackage.cover.layout.themeColor }}>
                      {docPackage.cover.title || 'Documento sem Título'}
                    </h1>
                    
                    <div className="w-8 h-1 mx-auto" style={{ backgroundColor: docPackage.cover.layout.themeColor }}></div>
                    
                    <p className="text-[11px] text-neutral-500 font-medium leading-relaxed italic max-w-xs mx-auto">
                      {docPackage.cover.subtitle}
                    </p>
                  </div>

                  {/* Footer metadata description block */}
                  <div className="flex flex-col gap-4 border-t pt-4 text-xs">
                    <p className="text-[10px] text-neutral-400 font-medium italic text-left leading-normal">{docPackage.cover.description}</p>
                    
                    <div className="grid grid-cols-2 text-left text-[9px] gap-2 font-medium bg-neutral-50 p-2.5 rounded-lg">
                      <div>
                        <span className="text-neutral-400 block uppercase">Elaborado por:</span>
                        <span className="text-neutral-700 font-bold">{docPackage.cover.author || 'Administração'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase">Versão:</span>
                        <span className="text-neutral-700 font-bold">V.{docPackage.cover.version}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase">Atendido para:</span>
                        <span className="text-neutral-700 font-bold">{docPackage.cover.client || 'Cliente'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase">Revisado em:</span>
                        <span className="text-neutral-400">{docPackage.cover.revisedDate}</span>
                      </div>
                    </div>

                    {/* QR Code small model representation */}
                    {docPackage.cover.showQrCode && (
                      <div className="flex items-center justify-between bg-white border border-[#DEE2E6] p-1.5 rounded-lg mt-1 gap-2 self-center">
                        <div className="w-8 h-8 bg-zinc-200 flex items-center justify-center font-mono text-[6px] text-neutral-600 font-bold select-none border">QR MODEL</div>
                        <span className="text-[7.5px] font-mono text-neutral-400 truncate max-w-[120px]">{docPackage.cover.qrUrl}</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM A4 MARGINS LAYOUT CONFIGURATION */}
          {activeTab === 'print' && (
            <div className="flex-1 flex flex-col md:flex-row bg-white overflow-y-auto">
              
              <div className="w-full md:w-[380px] p-6 border-r border-[#0F172A0F] text-left flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-bold text-sm text-[#111111]">Configuração Editorial de Impressão</h3>
                  <p className="text-[11px] text-neutral-500 font-medium">Assegure a total formatação na geração do PDF.</p>
                </div>

                {/* Margins controller */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Margens das Páginas A4 (em mm)</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-neutral-500">Superior (Top)</span>
                      <input 
                        type="number"
                        value={docPackage.print.marginTop}
                        onChange={e => setDocPackage({
                          ...docPackage,
                          print: { ...docPackage.print, marginTop: Number(e.target.value) }
                        })}
                        className="border p-2 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-neutral-500">Inferior (Bottom)</span>
                      <input 
                        type="number"
                        value={docPackage.print.marginBottom}
                        onChange={e => setDocPackage({
                          ...docPackage,
                          print: { ...docPackage.print, marginBottom: Number(e.target.value) }
                        })}
                        className="border p-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-neutral-500">Esquerda (Left)</span>
                      <input 
                        type="number"
                        value={docPackage.print.marginLeft}
                        onChange={e => setDocPackage({
                          ...docPackage,
                          print: { ...docPackage.print, marginLeft: Number(e.target.value) }
                        })}
                        className="border p-2 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-neutral-500">Direita (Right)</span>
                      <input 
                        type="number"
                        value={docPackage.print.marginRight}
                        onChange={e => setDocPackage({
                          ...docPackage,
                          print: { ...docPackage.print, marginRight: Number(e.target.value) }
                        })}
                        className="border p-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Headers configuration */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Texto Fixo do Cabeçalho (Header)</label>
                  <input
                    value={docPackage.print.headerText}
                    onChange={e => setDocPackage({
                      ...docPackage,
                      print: { ...docPackage.print, headerText: e.target.value }
                    })}
                    className="p-2 border rounded-xl text-xs bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Texto Fixo do Rodapé (Footer)</label>
                  <input
                    value={docPackage.print.footerText}
                    onChange={e => setDocPackage({
                      ...docPackage,
                      print: { ...docPackage.print, footerText: e.target.value }
                    })}
                    className="p-2 border rounded-xl text-xs bg-white"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border p-3 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-[#111111] block">Sumário Automático</span>
                      <span className="text-[10px] text-neutral-500 block">Gera índices clicáveis dinamicamente</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={docPackage.print.autoTOC}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        print: { ...docPackage.print, autoTOC: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border p-3 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-[#111111] block">Rastrear Numeração</span>
                      <span className="text-[10px] text-neutral-500 block">Exibe paginação Inteligente</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={docPackage.print.showPageNumbers}
                      onChange={e => setDocPackage({
                        ...docPackage,
                        print: { ...docPackage.print, showPageNumbers: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* Graphical explanations */}
              <div className="flex-1 bg-neutral-50 p-6 flex flex-col items-center justify-center">
                <div className="max-w-md text-left bg-white p-6 rounded-[20px] border shadow-sm flex flex-col gap-4">
                  <span className="p-1 px-3 text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-700 rounded-full inline-block self-start">Qualidade Gráfica A4</span>
                  
                  <h4 className="text-sm font-bold text-neutral-900 leading-tight">Como funciona o layout de impressão corporativo CYZOR?</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                    Nosso sistema de vetorização inteligente associa o conteúdo markdown criado, a folha de capa customizada e os metadados gerando um HTML pronto para impressão.
                  </p>
                  <ul className="text-xs text-neutral-500 space-y-2 leading-relaxed">
                    <li>• **Quebras de Página Nativas:** Títulos de capítulos sempre começam na página imediata seguinte.</li>
                    <li>• **Vetores puros:** Fontes do Google e links permanecem escalonáveis para qualquer dispositivo.</li>
                    <li>• **Configuração Rápida:** Sliders e dados dinâmicos controlam a compilação do arquivo.</li>
                  </ul>
                  
                  <button 
                    onClick={() => setActiveTab('preview_pdf')} 
                    className="mt-2 p-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-colors block text-center"
                  >
                    Visualizar Preview Completo de Folhas
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: HIGH-FIDELITY VECTOR A4 LIVE SHEETS VIEW */}
          {activeTab === 'preview_pdf' && (
            <div className="flex-1 bg-[#4A4E57] p-8 overflow-y-auto flex flex-col items-center gap-10 custom-scrollbar relative">
              
              {/* Direct A4 download assist notification banner */}
              <div className="w-full max-w-[800px] bg-[#111111] rounded-[16px] p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <SparklingActionBadge />
                  <div>
                    <span className="text-xs font-extrabold text-white block">Documento Compilado & Preparado!</span>
                    <span className="text-[11px] text-[#94A3B8] block font-semibold">Tire vantagem da exportação vetorial via botão "Imprimir / Exportar PDF" no topo.</span>
                  </div>
                </div>
                <button 
                  onClick={triggerNativePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow transition-colors"
                >
                  <Printer size={13} />
                  <span>Gerar PDF Agora</span>
                </button>
              </div>

              {/* RENDER MODEL ZONE: Hidden/Print targeted container */}
              <div id="print-area-only" className="flex flex-col items-center gap-10">
                
                {/* PAGE 1: BEAUTIFUL VIRTUAL CAPA */}
                {docPackage.cover.hasCover && (
                  <div 
                    className="a4-page-sheet bg-[#FFFFFF] shadow-2xl relative flex flex-col justify-between text-center overflow-hidden border p-16"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      paddingTop: `${docPackage.print.marginTop}mm`,
                      paddingBottom: `${docPackage.print.marginBottom}mm`,
                      paddingLeft: `${docPackage.print.marginLeft}mm`,
                      paddingRight: `${docPackage.print.marginRight}mm`,
                      fontFamily: docPackage.cover.layout.fontFamily === 'serif' ? 'Georgia, serif' : docPackage.cover.layout.fontFamily === 'mono' ? 'monospace' : 'sans-serif'
                    }}
                  >
                    {/* ACCENT COLORED ROW */}
                    <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: docPackage.cover.layout.themeColor }}></div>

                    {/* WATERMARK BACKGROUND EFFECT */}
                    {docPackage.cover.layout.watermark && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
                        <span className="text-8xl font-black tracking-widest uppercase -rotate-45">{docPackage.cover.layout.watermark}</span>
                      </div>
                    )}

                    {/* Organization Banner Cover */}
                    <div className="flex flex-col items-center mt-4">
                      <span className="text-xs font-black tracking-widest text-[#64748B] block mb-2">{docPackage.cover.company || 'ORGANIZAÇÃO CORPORATIVA'}</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-dashed rounded px-3 py-1 bg-neutral-50">{docPackage.cover.category || 'Especificação'}</span>
                    </div>

                    {/* Main Core Cover title */}
                    <div className="my-auto py-10 flex flex-col gap-6">
                      
                      {/* Optional Primary Layout Banner Graphic */}
                      {docPackage.cover.bgImage && (
                        <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 bg-muted relative shadow-sm">
                          <img src={docPackage.cover.bgImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                      )}

                      <h1 className="text-3xl font-bold tracking-tight text-[#111111] leading-tight" style={{ color: docPackage.cover.layout.themeColor }}>
                        {docPackage.cover.title || 'Manual Operacional'}
                      </h1>

                      <div className="w-16 h-1 mx-auto" style={{ backgroundColor: docPackage.cover.layout.themeColor }}></div>

                      <p className="text-sm text-neutral-500 font-medium italic max-w-lg mx-auto leading-relaxed">
                        {docPackage.cover.subtitle}
                      </p>
                    </div>

                    {/* Metadados block */}
                    <div className="flex flex-col gap-6 border-t pt-8 text-xs">
                      
                      <div className="text-left leading-relaxed">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Resumo Executivo Informativo:</span>
                        <p className="text-neutral-500 leading-relaxed font-semibold italic">{docPackage.cover.description || 'Nenhum resumo fornecido.'}</p>
                      </div>

                      <div className="grid grid-cols-2 text-left text-xs gap-4 font-semibold bg-neutral-50 p-4 rounded-xl border border-black/5">
                        <div className="flex flex-col">
                          <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Autor Do Documento:</span>
                          <span className="text-neutral-700 font-extrabold mt-0.5">{docPackage.cover.author || 'Administrador'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Versão Registrada:</span>
                          <span className="text-neutral-700 font-extrabold mt-0.5">Módulo Geral V.{docPackage.cover.version}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Receptor do Trabalho:</span>
                          <span className="text-neutral-700 font-extrabold mt-0.5">{docPackage.cover.client || 'Mercado Geral'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Data de Revisão Final:</span>
                          <span className="text-neutral-500 mt-0.5">{docPackage.cover.revisedDate}</span>
                        </div>
                      </div>

                      {/* Header and Qr component */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-neutral-400 font-mono tracking-widest">{docPackage.print.footerText}</span>
                        {docPackage.cover.showQrCode && (
                          <div className="flex items-center gap-3 bg-white border p-1 px-3 rounded-lg">
                            <span className="text-[8px] font-mono text-neutral-400 text-right">Acesse o portal para assinar:<br /><span className="text-neutral-600 font-bold">{docPackage.cover.qrUrl}</span></span>
                            <div className="w-10 h-10 bg-zinc-200 border flex items-center justify-center font-mono text-[6px] font-black pointer-events-none">QR MODEL</div>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* PAGE 2: AUTOMATIC TABLE OF CONTENTS (SUMÁRIO) */}
                {docPackage.print.autoTOC && (
                  <div 
                    className="a4-page-sheet bg-[#FFFFFF] shadow-2xl relative flex flex-col justify-between text-left border p-16"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      paddingTop: `${docPackage.print.marginTop}mm`,
                      paddingBottom: `${docPackage.print.marginBottom}mm`,
                      paddingLeft: `${docPackage.print.marginLeft}mm`,
                      paddingRight: `${docPackage.print.marginRight}mm`
                    }}
                  >
                    
                    {/* Header bar layout representation */}
                    <div className="flex items-center justify-between border-b pb-3 mb-6">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">{docPackage.print.headerText}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Sumário Geral</span>
                    </div>

                    <div className="flex-1 py-4">
                      <h2 className="text-2xl font-bold text-neutral-900 mb-8 font-display">Sumário de Conteúdo</h2>
                      
                      <div className="flex flex-col gap-5 text-sm">
                        {docPackage.chapters.map((chap, cIdx) => {
                          return (
                            <div key={chap.id} className="flex flex-col gap-2">
                              
                              <div className="flex items-end justify-between font-bold">
                                <span className="text-neutral-900">{chap.title}</span>
                                <span className="bg-repeat-x border-b border-dotted flex-1 mx-2 mb-1.5 opacity-40"></span>
                                <span className="text-neutral-900 font-mono font-bold">pág. {3 + cIdx}</span>
                              </div>

                              <div className="pl-6 flex flex-col gap-1.5 text-neutral-600 font-medium">
                                {chap.sections.map((sec) => (
                                  <div key={sec.id} className="flex items-end justify-between text-xs">
                                    <span>{sec.title}</span>
                                    <span className="bg-repeat-x border-b border-dotted flex-1 mx-2 mb-1 opacity-20"></span>
                                    <span className="text-neutral-400 font-mono text-[10px]">pág. {3 + cIdx}</span>
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
                      <span className="text-[9px] tracking-tight text-neutral-400 font-mono">{docPackage.print.footerText}</span>
                      <span className="text-[10px] font-mono font-bold text-neutral-600">Pág. ii</span>
                    </div>

                  </div>
                )}

                {/* FLOWING CONTENT GENERATION CHAPTERS (1 PAGE PER CHAPTER MODEL) */}
                {docPackage.chapters.map((chap, cIdx) => {
                  return (
                    <div 
                      key={chap.id}
                      className="a4-page-sheet bg-[#FFFFFF] shadow-2xl relative flex flex-col justify-between text-left border p-16"
                      style={{
                        width: '210mm',
                        height: '297mm',
                        paddingTop: `${docPackage.print.marginTop}mm`,
                        paddingBottom: `${docPackage.print.marginBottom}mm`,
                        paddingLeft: `${docPackage.print.marginLeft}mm`,
                        paddingRight: `${docPackage.print.marginRight}mm`
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b pb-3 mb-6 text-neutral-400">
                        <span className="text-[9px] font-bold uppercase tracking-wider">{docPackage.print.headerText}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider">{chap.title}</span>
                      </div>

                      {/* Content parsing zone */}
                      <div className="flex-1 overflow-hidden leading-relaxed text-sm">
                        
                        <div className="prose prose-slate max-w-none text-left select-text scroll-smooth prose-h1:text-2xl prose-h1:font-display prose-h1:font-bold prose-h1:text-[#111111] prose-h2:text-lg prose-h2:font-bold prose-h2:text-[#111111] prose-a:text-indigo-600 prose-code:bg-[#FAFAFA] prose-code:text-[#ef4444] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-[#111111] prose-pre:text-white prose-pre:p-4 prose-pre:rounded-xl">
                          {chap.sections.map((sec, sIdx) => (
                            <div key={sec.id} className="mb-8 border-b pb-6 last:border-none last:pb-0">
                              <h3 className="text-base font-bold text-neutral-800 mb-3 border-l-4 pl-3.5" style={{ borderColor: docPackage.cover.layout.themeColor }}>
                                {sec.title}
                              </h3>
                              <Markdown>{sec.content}</Markdown>
                            </div>
                          ))}
                        </div>

                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t pt-3 mt-6 text-neutral-400 text-xs">
                        <span className="text-[9px] tracking-tight text-neutral-400 font-mono">{docPackage.print.footerText}</span>
                        <span className="text-[10px] font-mono font-bold text-neutral-600">
                          Pág. {3 + cIdx}
                        </span>
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          )}

          {/* INTEGRATED RIGTH SIDEBAR: METADATA, VERSION RESTORE, ELEMENT LIBRARY & GEMINI IA */}
          <div className="w-full lg:w-[320px] bg-[#FAFAFA] border-t lg:border-t-0 lg:border-l border-[#0F172A0F] p-4 sm:p-5 overflow-y-auto flex flex-col gap-6 flex-shrink-0 custom-scrollbar text-left text-xs pb-16 lg:pb-6">
            
            {/* 1. RELATIONSHIPS & INFO PANEL */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Metadados & Vínculos</span>
                <Info size={11} className="text-neutral-400" />
              </div>
              <div className="bg-white border rounded-xl p-3 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase">Vincular a Projeto da Plataforma:</span>
                  <div className="flex items-center gap-2 bg-neutral-50 border p-2 rounded-xl">
                    <GitBranch size={13} className="text-[#64748B]" />
                    <select
                      value={selectedProjectId}
                      onChange={e => setSelectedProjectId(e.target.value)}
                      className="bg-transparent border-none outline-none text-[#111111] font-bold flex-1 cursor-pointer"
                    >
                      <option value="">Sem Projeto Relacionado</option>
                      {projectsList.map(proj => (
                        <option key={proj.id} value={proj.id}>{proj.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. REAL GEMINI GENERATIVE SERVICE MODULE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-1"><Sparkles size={11} className="text-indigo-500 fill-indigo-500" /> Copiloto IA (Gemini)</span>
                <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Ativo</span>
              </div>
              <div className="bg-white border rounded-xl p-3 flex flex-col gap-3">
                <span className="text-[9.5px] text-neutral-500 font-medium leading-relaxed block">
                  Selecione uma seção e peça para reescrever, formatar ou crie com contexto de projetos selecionados.
                </span>

                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full border p-2 text-xs rounded-xl h-16 outline-none resize-none focus:border-indigo-500 bg-neutral-50"
                  placeholder="Instrução personalizada: ex: 'Adicione termos de LGPD' ou 'Deixe mais formal' ou 'Crie SLA'..."
                />

                {aiError && (
                  <div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg text-[10px] font-bold flex items-start gap-1">
                    <AlertOctagon size={12} className="shrink-0 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => runAiService('grammar')}
                    disabled={aiLoading || !activeSection}
                    className="p-2 border rounded-xl text-[10px] font-bold hover:bg-neutral-50 flex items-center justify-center gap-1 text-neutral-800 disabled:opacity-50 cursor-pointer"
                  >
                    <Check size={11} /> Corrigir Gramática
                  </button>
                  <button
                    onClick={() => runAiService('summary')}
                    disabled={aiLoading || !activeSection}
                    className="p-2 border rounded-xl text-[10px] font-bold hover:bg-neutral-50 flex items-center justify-center gap-1 text-neutral-800 disabled:opacity-50 cursor-pointer"
                  >
                    <Layers size={11} /> Criar Resumo
                  </button>
                  <button
                    onClick={() => runAiService('contextual')}
                    disabled={aiLoading || !selectedProjectId}
                    className="p-2 border rounded-xl text-[10px] font-bold hover:bg-neutral-50 flex items-center justify-center gap-1 text-neutral-800 disabled:opacity-50 cursor-pointer col-span-2"
                  >
                    <Wand2 size={11} className="text-indigo-500" /> Escrever pelo Projeto Relatado
                  </button>
                  <button
                    onClick={() => runAiService('rewrite')}
                    disabled={aiLoading || !activeSection || !aiPrompt.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold col-span-2 hover:bg-indigo-700 flex items-center justify-center gap-1 disabled:opacity-55 cursor-pointer shadow-sm"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw size={11} className="animate-spin" />
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkle size={11} className="fill-white" />
                        <span>Aplicar Instrução</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. ELEMENT TEMPLATE LIBRARY SECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Biblioteca Corporativa de Blocos</span>
                <Compass size={11} className="text-neutral-400" />
              </div>
              <div className="bg-white border rounded-xl p-2.5 flex flex-col gap-2">
                <span className="text-[9px] text-neutral-400 font-medium">Injete modelos e seções com 1 clique:</span>
                
                <button
                  type="button"
                  onClick={() => injectTemplate('api')}
                  disabled={!activeSection}
                  className="p-2 border text-left rounded-lg hover:border-indigo-500 hover:bg-indigo-50/10 flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="font-bold text-neutral-700 block text-[10px]">Modelo de API de Integração</span>
                  <Plus size={11} className="text-neutral-400 group-hover:text-indigo-600" />
                </button>

                <button
                  type="button"
                  onClick={() => injectTemplate('guide')}
                  disabled={!activeSection}
                  className="p-2 border text-left rounded-lg hover:border-indigo-500 hover:bg-indigo-50/10 flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="font-bold text-neutral-700 block text-[10px]">Manual / Análise SWOT</span>
                  <Plus size={11} className="text-neutral-400 group-hover:text-indigo-600" />
                </button>

                <button
                  type="button"
                  onClick={() => injectTemplate('warning')}
                  disabled={!activeSection}
                  className="p-2 border text-left rounded-lg hover:border-indigo-500 hover:bg-indigo-50/10 flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="font-bold text-neutral-700 block text-[10px]">Callout de Aviso de Compliance</span>
                  <Plus size={11} className="text-neutral-400 group-hover:text-indigo-600" />
                </button>

                <button
                  type="button"
                  onClick={() => injectTemplate('checklist')}
                  disabled={!activeSection}
                  className="p-2 border text-left rounded-lg hover:border-indigo-500 hover:bg-indigo-50/10 flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="font-bold text-neutral-700 block text-[10px]">Checklist de Auditoria Geral</span>
                  <Plus size={11} className="text-neutral-400 group-hover:text-indigo-600" />
                </button>
              </div>
            </div>

            {/* 4. HISTORICAL REVISIONS TIMELINE FLOW */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Histórico de Revisões</span>
                <History size={11} className="text-neutral-400" />
              </div>
              <div className="bg-white border rounded-xl p-3 flex flex-col gap-3">
                <div className="flex flex-col relative border-l border-zinc-200 ml-1.5 pl-3 gap-3 text-[10.5px]">
                  {docPackage.versions.map((ver, vIdx) => {
                    return (
                      <div key={ver.id} className="flex flex-col relative">
                        <div className={`absolute w-2 h-2 rounded-full -left-[17.5px] top-1 border ${
                          vIdx === 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-neutral-200 border-neutral-300'
                        }`} />
                        
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#111111]">Versão {ver.version}</span>
                          {vIdx > 0 && ver.contentSnapshot && (
                            <button
                              onClick={() => restoreVersionSnapshot(ver.contentSnapshot)}
                              className="text-indigo-600 hover:underline font-bold text-[9px] uppercase tracking-wider"
                            >
                              Restaurar
                            </button>
                          )}
                        </div>
                        <span className="text-[9.5px] text-neutral-400 font-medium">{ver.notes}</span>
                        <span className="text-[8.5px] text-neutral-400 font-mono italic mt-0.5">{ver.date} • {ver.author}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* VERSION MODAL tagger popup */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] border border-[#DEE2E6] p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-left">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Salvar Marco de Versão</h3>
              <p className="text-[10px] font-medium text-neutral-500 mt-1">Crie um marco de snapshot estável de revisão.</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Identificador da Versão</span>
              <input
                value={newVersionLabel}
                onChange={e => setNewVersionLabel(e.target.value)}
                className="border p-2 rounded-xl text-xs"
                placeholder="Exemplo: 1.1 ou 2.0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">Notas de Alteração (Changelog)</span>
              <textarea
                value={newVersionNotes}
                onChange={e => setNewVersionNotes(e.target.value)}
                className="border p-2 rounded-xl text-xs h-16 resize-none"
                placeholder="Exemplo: Adicionado capítulo de regulamentação..."
              />
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              <button 
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancelar
              </button>
              <button 
                onClick={saveMilestoneVersion}
                className="px-5 py-2 text-xs font-bold bg-[#111111] text-white rounded-xl shadow hover:bg-black"
              >
                Salvar Marco
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sparkle animated decoration icon helper representing cutting-edge AI features
function SparklingActionBadge() {
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
      <Sparkles size={14} className="animate-pulse" />
    </div>
  );
}
