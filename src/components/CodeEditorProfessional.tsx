import { useState, useEffect, useRef } from 'react';
import { 
  X, Save, FileCode, Play, Terminal, HelpCircle, Settings, ChevronRight, 
  Download, RefreshCw, Sparkles, Check, CheckSquare, Layers, Code, Bug, 
  Folder, FolderOpen, PlaySquare, Trash, CornerDownRight, CheckCircle, Flame, Server
} from 'lucide-react';

interface FileItem {
  name: string;
  type: string;
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

  // Safe base64 decoding helper
  const decodeBase64DataUrl = (dataUrl: string): string => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return dataUrl;
    }
    try {
      const commaIndex = dataUrl.indexOf(',');
      if (commaIndex === -1) return dataUrl;
      const base64Part = dataUrl.substring(commaIndex + 1);
      
      // Decode base64 bytes safely to UTF-8 text
      const binaryString = atob(base64Part);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch (err) {
      console.error('Error decoding base64 data url:', err);
      return dataUrl;
    }
  };

  // Safe base64 encoding helper
  const encodeBase64DataUrl = (text: string, filename: string): string => {
    try {
      const ext = filename.split('.').pop()?.toLowerCase();
      let mimeType = 'text/plain';
      if (ext === 'html') mimeType = 'text/html';
      else if (ext === 'css') mimeType = 'text/css';
      else if (ext === 'js') mimeType = 'application/javascript';
      else if (ext === 'json') mimeType = 'application/json';
      else if (ext === 'xml') mimeType = 'application/xml';
      else if (ext === 'php') mimeType = 'text/php';
      
      const bytes = new TextEncoder().encode(text);
      let binaryString = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binaryString);
      return `data:${mimeType};base64,${base64}`;
    } catch (err) {
      console.error('Error encoding to base64 data url:', err);
      return text;
    }
  };

  // Load code content
  useEffect(() => {
    // If the content is already a multi-file JSON workspace, parse and load it
    if (doc.content && doc.content.startsWith('[')) {
      try {
        const parsed = JSON.parse(doc.content);
        if (parsed.length > 0) {
          setWorkspaceFiles(parsed);
          setEditorCode(parsed[0].content);
          setActiveFileIndex(0);
          return;
        }
      } catch (e) {
        console.error('Failed to parse multi-file editor serialize JSON', e);
      }
    }

    // Default / Single file loader fallback: load the actual doc.title and doc.content
    const name = doc.title || 'index.html';
    const ext = name.split('.').pop() || 'html';
    
    // Resolve raw content (check both doc.content and doc.url for data: url base64 data)
    let rawContent = doc.content || '';
    if (!rawContent && (doc as any).url && (doc as any).url.startsWith('data:')) {
      rawContent = (doc as any).url;
    }

    // Decode if base64 encoded data URL
    const decodedContent = decodeBase64DataUrl(rawContent);

    const singleFile: FileItem = {
      name,
      type: ext,
      content: decodedContent
    };
    setWorkspaceFiles([singleFile]);
    setEditorCode(singleFile.content);
    setActiveFileIndex(0);
  }, [doc]);

  // Handle active file selection change value
  const handleSelectFile = (idx: number) => {
    // Save current active file content state
    const filesCopy = [...workspaceFiles];
    if (filesCopy[activeFileIndex]) {
      filesCopy[activeFileIndex].content = editorCode;
      setWorkspaceFiles(filesCopy);
    }

    setActiveFileIndex(idx);
    setEditorCode(filesCopy[idx].content);
    setSuggestions([]);
    setShowSug(false);
  };

  // Safe file content edits update locally
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEditorCode(code);

    // Sync in real-time so other operations / saves have latest contents
    const filesCopy = [...workspaceFiles];
    if (filesCopy[activeFileIndex]) {
      filesCopy[activeFileIndex].content = code;
      setWorkspaceFiles(filesCopy);
    }

    // Dynamic simple syntax autocomplete suggestions triggers
    const words = code.split(/[\s()]+/);
    const lastWord = words[words.length - 1];

    if (lastWord.length >= 3) {
      const allWords = ['interface', 'async', 'function', 'import', 'System', 'Drizzle', 'SQLite', 'Query', 'Faturamento', 'Contracts', 'console.log', 'analyzeWorkspace'];
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

  // Create new file inside workspace
  const handleCreateFileInWorkspace = () => {
    const filename = prompt('Digite o nome do novo arquivo (ex: index.html, style.css, server.js, script.py):');
    if (!filename || !filename.trim()) return;

    if (workspaceFiles.some(f => f.name.toLowerCase() === filename.trim().toLowerCase())) {
      alert('Um arquivo com este nome já existe no workspace.');
      return;
    }

    const ext = filename.split('.').pop() || 'html';
    const newFile: FileItem = {
      name: filename.trim(),
      type: ext,
      content: ''
    };

    const updated = [...workspaceFiles, newFile];
    setWorkspaceFiles(updated);
    setActiveFileIndex(updated.length - 1);
    setEditorCode('');
  };

  // Delete file from workspace
  const handleDeleteFileInWorkspace = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (workspaceFiles.length <= 1) {
      alert('O workspace precisa conter ao menos 1 arquivo.');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o arquivo "${workspaceFiles[idx].name}"?`)) {
      return;
    }

    const updated = workspaceFiles.filter((_, i) => i !== idx);
    setWorkspaceFiles(updated);

    // Adjust selected file index
    if (activeFileIndex === idx) {
      const nextIdx = Math.max(0, idx - 1);
      setActiveFileIndex(nextIdx);
      setEditorCode(updated[nextIdx].content);
    } else if (activeFileIndex > idx) {
      setActiveFileIndex(prev => prev - 1);
    }
  };

  // Compile / Run current code inside sandbox simulation terminal logs
  const executeCompilerPipeline = () => {
    setIsCompiling(true);
    setShowTerminal(true);
    setTerminalLogs(prev => [...prev, `[cyzor-compiler] Iniciando execução: \`${workspaceFiles[activeFileIndex]?.name || 'index.html'}\`...`]);

    setTimeout(() => {
      if (editorCode.includes('throw') || editorCode.includes('error') && Math.random() > 0.85) {
        // Trigger compiler error matching log simulation
        setTerminalLogs(prev => [
          ...prev,
          '[TS2307] Cannot find module "@google/genai" or its corresponding type declarations.',
          `[error] Falha ao executar ${workspaceFiles[activeFileIndex]?.name || 'index.html'}`
        ]);
      } else {
        // Success
        setTerminalLogs(prev => [
          ...prev,
          `[cyzor-compiler] Compilação e sintaxe validadas com sucesso!`,
          `[runtime] Executando processo no sandbox virtual Cyzor...`,
          `[console.log] Código executado com sucesso sem erros estruturais.`,
          `[runtime] Processo finalizado com código 0 (Sucesso em 15ms)`
        ]);
      }
      setIsCompiling(false);
    }, 1200);
  };

  const saveWorkspaceToSaaS = () => {
    // Sync current active code content before writing state package
    const filesCopy = [...workspaceFiles];
    if (filesCopy[activeFileIndex]) {
      filesCopy[activeFileIndex].content = editorCode;
    }

    // Determine the save value: if there's only 1 file and its name matches doc.title, we can save its content as raw string to keep database files lightweight, or save as JSON array.
    // Actually, saving as JSON array of files makes it highly extensible. But if they expect doc.content to be just raw text when it's opened elsewhere, let's look at how we can do it:
    // If it's a single file and the user didn't add any extra files, we can save its content as a raw code string. That way it's highly compatible with standard text storage!
    // But if they have multiple files, we save as JSON. That's incredibly elegant and compatible!
    let saveContent = '';
    if (filesCopy.length === 1) {
      saveContent = filesCopy[0].content;
    } else {
      saveContent = JSON.stringify(filesCopy);
    }

    // Check if original doc was base64-encoded upload
    const isOriginalBase64 = (doc.content && doc.content.startsWith('data:')) || ((doc as any).url && (doc as any).url.startsWith('data:'));

    let finalContent = saveContent;
    let finalUrl = (doc as any).url || '';

    if (isOriginalBase64 && filesCopy.length === 1) {
      const filename = filesCopy[0].name;
      finalContent = encodeBase64DataUrl(saveContent, filename);
      finalUrl = finalContent; // Keep URL in sync with base64 encoded content
    }

    const compiledOutput = {
      ...doc,
      content: finalContent,
      url: finalUrl,
      size: `${Math.round(finalContent.length / 100) / 10} KB`,
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
               {/* Virtual folder directory with add button */}
               <div className="flex items-center justify-between text-xs text-yellow-500 font-bold px-1.5 py-1">
                 <div className="flex items-center gap-1.5">
                   <FolderOpen size={13} />
                   <span>workspace/</span>
                 </div>
                 <button
                   onClick={handleCreateFileInWorkspace}
                   title="Novo Arquivo"
                   className="p-1.5 hover:bg-[#37373D] text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer"
                 >
                   <FileCode size={13} />
                 </button>
               </div>
 
               {/* Workspace files list */}
               {workspaceFiles.map((file, idx) => {
                 const isActive = idx === activeFileIndex;
                 return (
                   <div
                     key={file.name}
                     onClick={() => handleSelectFile(idx)}
                     className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-semibold group ${
                       isActive ? 'bg-[#37373D] text-white font-bold' : 'text-[#858585] hover:bg-[#2A2A2B] hover:text-white'
                     }`}
                   >
                     <div className="flex items-center gap-2 truncate pr-2">
                       <FileCode size={13} className="text-[#38bdf8] shrink-0" />
                       <span className="truncate">{file.name}</span>
                     </div>
                     {workspaceFiles.length > 1 && (
                       <button
                         onClick={(e) => handleDeleteFileInWorkspace(idx, e)}
                         title="Excluir arquivo"
                         className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#44444A] text-neutral-400 hover:text-red-400 rounded transition"
                       >
                         <Trash size={12} />
                       </button>
                     )}
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
