import { useState, useEffect, useRef } from 'react';
import { 
  X, Save, FileCode, Play, Terminal, HelpCircle, Settings, ChevronRight, 
  Download, RefreshCw, Sparkles, Check, CheckSquare, Layers, Code, Bug, 
  Folder, FolderOpen, PlaySquare, Trash, CornerDownRight, CheckCircle, Flame, Server
} from 'lucide-react';

interface FileItem {
  name: string;
  type: 'ts' | 'js' | 'json' | 'sql' | 'css';
  content: string;
  isOpen?: boolean;
}

interface CodeEditorProps {
  doc: {
    id?: number;
    title: string;
    content?: string; // code serialization OR text content
    size?: string;
    folder?: string;
  };
  onSave: (updatedDoc: any) => void;
  onClose: () => void;
}

export default function CodeEditorProfessional({ doc, onSave, onClose }: CodeEditorProps) {
  // Multi-file Workspace tree state
  const [workspaceFiles, setWorkspaceFiles] = useState<FileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [editorCode, setEditorCode] = useState<string>('');
  
  // Custom theme option: 'dracula' | 'monokai' | 'github-dark' | 'synthwave'
  const [activeTheme, setActiveTheme] = useState<'dracula' | 'monokai' | 'github-dark' | 'synthwave'>('dracula');

  // Terminal active console logs state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Iniciando compilador offline Cyzor-TSC v4.2.1...',
    'Cluster de depuração alocado na porta local sandbox.',
    'Pronto para analisar gatilhos analíticos e linguagens TypeScript/SQL.'
  ]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);

  // Autocomplete popup suggestions mapping
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 });

  // Load code content
  useEffect(() => {
    // Generate beautiful corporate developer files in workspace tree
    const initialFiles: FileItem[] = [
      {
        name: 'briefing_analytics.ts',
        type: 'ts',
        content: `// Cyzor Analytics Integration script\nimport { GoogleGenAI } from '@google/genai';\n\ninterface DocumentMetada {\n  id: string;\n  status: 'draft' | 'approved' | 'signed';\n  author: string;\n}\n\nasync function analyzeWorkspace(docId: string, author: string) {\n  console.log("Iniciando auditoria para documento ID: " + docId);\n  \n  const docMeta: DocumentMetada = {\n    id: docId,\n    status: 'draft',\n    author: author\n  };\n  \n  if (!docId) {\n    throw new Error("UUID do documento e obrigatorio");\n  }\n  \n  return {\n    verified: true,\n    timestamp: Date.now() \n  };\n}\n`
      },
      {
        name: 'database_schema.sql',
        type: 'sql',
        content: `-- PostgreSQL schema setup\nCREATE TABLE IF NOT EXISTS system_contracts (\n  id SERIAL PRIMARY KEY,\n  contract_uuid VARCHAR(120) NOT NULL UNIQUE,\n  client_name VARCHAR(255) NOT NULL,\n  total_faturamento NUMERIC(12, 2) DEFAULT 0.00,\n  status_rubrica VARCHAR(45) NOT NULL DEFAULT 'PENDING',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Create index for performance searches\nCREATE INDEX idx_contracts_uuid ON system_contracts (contract_uuid);\n`
      },
      {
        name: 'package_saas.json',
        type: 'json',
        content: `{\n  "name": "cyzor-analytics-batch",\n  "version": "1.0.4",\n  "description": "Integration pipeline of SaaS",\n  "dependencies": {\n    "express": "^4.21.0",\n    "tsx": "^4.10.0",\n    "pg": "^8.12.0",\n    "drizzle-orm": "^0.32.0"\n  }\n}`
      }
    ];

    if (doc.content && doc.content.startsWith('[')) {
      try {
        const parsed = JSON.parse(doc.content);
        if (parsed.length > 0) {
          setWorkspaceFiles(parsed);
          setEditorCode(parsed[0].content);
          return;
        }
      } catch (e) {
        console.error('Failed to parse multi-file editor serialize JSON', e);
      }
    }

    setWorkspaceFiles(initialFiles);
    setEditorCode(initialFiles[0].content);
  }, [doc]);

  // Handle active file selection change value
  const handleSelectFile = (idx: number) => {
    // Save current active file content state
    const filesCopy = [...workspaceFiles];
    filesCopy[activeFileIndex].content = editorCode;
    setWorkspaceFiles(filesCopy);

    setActiveFileIndex(idx);
    setEditorCode(filesCopy[idx].content);
    setSuggestions([]);
    setShowSug(false);
  };

  // Safe file content edits update locally
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEditorCode(code);

    // Dynamic simple syntax autocomplete suggestions triggers
    const words = code.split(/[\s()]+/);
    const lastWord = words[words.length - 1];

    if (lastWord.length >= 3) {
      const allWords = ['interface', 'async', 'function', 'import', 'System', 'Drizzle', 'PostgreSQL', 'Query', 'Faturamento', 'Contracts', 'console.log', 'analyzeWorkspace'];
      const filtered = allWords.filter(w => w.toLowerCase().startsWith(lastWord.toLowerCase()) && w !== lastWord);
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setShowSug(true);
        // Position mockup popups near cursors
        setCursorPos({ top: 180, left: 210 });
      } else {
        setShowSug(false);
      }
    } else {
      setShowSug(false);
    }
  };

  // Compile / Run current code inside sandbox simulation terminal logs
  const executeCompilerPipeline = () => {
    setIsCompiling(true);
    setShowTerminal(true);
    setTerminalLogs(prev => [...prev, `[cyzor-compiler] Iniciando transpilacao: \`${workspaceFiles[activeFileIndex].name}\`...`]);

    setTimeout(() => {
      if (editorCode.includes('throw') || editorCode.includes('error') && Math.random() > 0.85) {
        // Trigger compiler error matching log simulation
        setTerminalLogs(prev => [
          ...prev,
          '[TS2307] Cannot find module "@google/genai" or its corresponding type declarations.',
          '[TS425] Compilation failed: 1 error detected in briefing_analytics.ts'
        ]);
      } else {
        // Success
        setTerminalLogs(prev => [
          ...prev,
          `[cyzor-compiler] Transpilacao ESNext concluida sem erros!`,
          `[runtime] Executando processo na maquina de teste virtual...`,
          `[console.log] "Iniciando auditoria para documento ID: Doc-0123"`,
          `[runtime] Processo finalizado com codigo 0 (Sucesso em 22ms)`
        ]);
      }
      setIsCompiling(false);
    }, 1500);
  };

  const saveWorkspaceToSaaS = () => {
    // Sync current active code content before writing state package
    const filesCopy = [...workspaceFiles];
    filesCopy[activeFileIndex].content = editorCode;

    const compiledOutput = {
      ...doc,
      content: JSON.stringify(filesCopy),
      size: `${Math.round(JSON.stringify(filesCopy).length / 100) / 10} KB`,
      folder: doc.folder || 'Código',
      updatedAt: new Date().toISOString()
    };
    onSave(compiledOutput);
  };

  const currentFile = workspaceFiles[activeFileIndex] || workspaceFiles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/90 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] text-[#D4D4D4] border border-white/10 w-full h-[95vh] sm:rounded-[28px] max-w-7xl shadow-2xl flex flex-col overflow-hidden relative text-left font-sans">
        
        {/* Top Header navbar of compiler */}
        <header className="h-16 px-6 border-b border-white/10 bg-[#252526] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-850 flex items-center justify-center">
              <Code size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs">{doc.title}</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
                Editor de Código & Compilador Avançado (IDE Cloud Run)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme picker */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-400">Tema:</span>
              <select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value as any)}
                className="bg-[#1E1E1E] border border-white/10 p-1.5 rounded-lg text-xs outline-none text-white font-medium"
              >
                <option value="dracula">Dracula Dark (SaaS)</option>
                <option value="monokai">Retro Monokai</option>
                <option value="github-dark">GitHub Dark Premium</option>
                <option value="synthwave">Synthwave Glowing</option>
              </select>
            </div>

            <button
              onClick={executeCompilerPipeline}
              disabled={isCompiling}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {isCompiling ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Play size={13} className="fill-white" />
              )}
              <span>{isCompiling ? 'Compilando...' : 'Compilar & Testar'}</span>
            </button>

            <button 
              onClick={saveWorkspaceToSaaS}
              className="bg-[#111111] hover:bg-black border border-white/5 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
            >
              <Save size={14} />
              Salvar IDE
            </button>

            <button onClick={onClose} className="p-2 hover:bg-[#333333] rounded-lg text-white">
              <X size={15} />
            </button>
          </div>
        </header>

        {/* IDE Split main workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* S1. Left Files Explorer column */}
          <aside className="w-56 bg-[#252526] border-r border-white/10 flex flex-col pt-3 shrink-0">
            <div className="px-4 pb-2 border-b border-white/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#808080]">
              <span>Explorador de Arquivos</span>
            </div>

            <div className="p-3 flex flex-col gap-1.5 overflow-y-auto">
              {/* Virtual folder directory */}
              <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold px-1.5 py-1">
                <FolderOpen size={13} />
                <span>workspace/</span>
              </div>

              {/* Workspace files list */}
              {workspaceFiles.map((file, idx) => {
                const isActive = idx === activeFileIndex;
                return (
                  <div
                    key={file.name}
                    onClick={() => handleSelectFile(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-semibold ${
                      isActive ? 'bg-[#37373D] text-white font-bold' : 'text-[#858585] hover:bg-[#2A2A2B] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode size={13} className="text-[#38bdf8] shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Server endpoint stats */}
            <div className="mt-auto p-4 border-t border-white/5 bg-[#1E1E1E]/40 text-left">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Cloud Engine</span>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-neutral-400">Node Cluster Ativo</span>
              </div>
            </div>
          </aside>

          {/* S2. Center coding and compilation output editor panel */}
          <main className="flex-1 flex flex-col bg-[#1E1E1E] relative overflow-hidden">
            
            {/* Header tab detail */}
            <div className="h-9 bg-[#2D2D2D] border-b border-[#252526] flex items-center px-4 justify-between shrink-0">
              <span className="text-[11px] font-mono text-neutral-450 font-bold uppercase tracking-wider">
                {currentFile?.name} &mdash; editando
              </span>
              <span className="px-2 py-0.5 bg-[#1E1E1E] text-yellow-500 text-[9px] font-mono rounded">
                ESNext / TS
              </span>
            </div>

            {/* Standard rich code typing interface field with lines indices */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs relative">
              {/* Fake line numbers column */}
              <div className="w-12 bg-[#1E1E1E] text-[#858585] py-4 text-right pr-3 select-none border-r border-[#252526] flex flex-col gap-1 leading-normal">
                {Array.from({ length: editorCode.split('\n').length + 5 }, (_, i) => i + 1).map(num => (
                  <span key={num}>{num}</span>
                ))}
              </div>

              {/* Actually textarea coding layer */}
              <textarea
                value={editorCode}
                onChange={handleTextareaChange}
                className={`flex-1 bg-transparent p-4 outline-none resize-none font-mono text-xs leading-normal font-semibold ${
                  activeTheme === 'dracula' ? 'text-[#e2e8f0]' : 
                  activeTheme === 'monokai' ? 'text-[#FFE792]' : 
                  activeTheme === 'github-dark' ? 'text-[#c9d1d9]' : 'text-[#ff7edb]'
                }`}
                spellCheck={false}
                placeholder="// Escreva scripts, schemas ou Jsons premium de integracoes..."
              />

              {/* Dynamic Suggestions Hover Autocomplete overlay card */}
              {showSug && (
                <div 
                  className="absolute bg-[#252526] border border-white/10 rounded-xl shadow-2xl p-2.5 z-40 min-w-[200px]"
                  style={{ top: `${cursorPos.top}px`, left: `${cursorPos.left}px` }}
                >
                  <p className="text-[8.5px] font-bold text-neutral-400 uppercase mb-1.5">IntelliSense Sugestões</p>
                  <div className="flex flex-col gap-1">
                    {suggestions.map(sugItem => (
                      <button
                        key={sugItem}
                        onClick={() => {
                          // inject autocomplete
                          const words = editorCode.split(/[\s()]+/);
                          words[words.length - 1] = sugItem;
                          setEditorCode(words.join(' '));
                          setShowSug(false);
                        }}
                        className="p-1 px-1.5 hover:bg-indigo-600 text-white text-[11.5px] rounded text-left font-bold"
                      >
                        {sugItem}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* S3. Terminal panel drawer */}
            {showTerminal && (
              <section className="h-44 bg-[#18181B] border-t border-white/10 flex flex-col shrink-0">
                <div className="h-8 bg-[#202023] border-b border-white/5 px-4 flex items-center justify-between text-[11px] tracking-wide shrink-0">
                  <div className="flex items-center gap-2 font-bold text-neutral-400">
                    <Terminal size={12} className="text-cyan-400" />
                    <span>Terminal de Execução Offline Cyzor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setTerminalLogs([])} className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold">Limpar Logs</button>
                    <button onClick={() => setShowTerminal(false)} className="text-zinc-500 hover:text-white font-bold">X</button>
                  </div>
                </div>

                {/* Console logs contents output */}
                <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] text-[#A5F3FC]/90 leading-relaxed text-left">
                  {terminalLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <span className="text-cyan-500 shrink-0">$</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {isCompiling && (
                    <div className="flex items-center gap-1.5 text-cyan-400 animate-pulse">
                      <span>$</span>
                      <span>Sincronizando modulos de seguranca local...</span>
                    </div>
                  )}
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
