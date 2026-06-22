import { useState } from "react";
import { ProjectExtended, ProjectDoc } from "../../types/project";
import {
  FileText,
  FolderOpen,
  Search,
  Trash2,
  Download,
  UploadCloud,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError, confirmAction } from "../../lib/alerts";
import { motion, AnimatePresence } from "framer-motion";

interface AbaDocumentosProps {
  project: ProjectExtended;
  onUpdateProject: (updated: ProjectExtended) => void;
  onOpenDoc?: (docId?: number) => void;
}

export default function AbaDocumentos({
  project,
  onUpdateProject,
  onOpenDoc,
}: AbaDocumentosProps) {
  const { fetchWithAuth } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadedDocId, setDownloadedDocId] = useState<number | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);

  // Drag and drop upload simulation feedback
  const [isDragging, setIsDragging] = useState(false);

  const docs = project.docs || [];

  const handleUpload = async (file: File) => {
    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const cleanCategory: string = selectedCategory || "Planejamento";
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    if (file.size > 5 * 1024 * 1024) {
      showError(`O arquivo ${file.name} é muito grande. O limite máximo é 5MB.`);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const response = await fetchWithAuth("/api/documents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projectId: project.id,
              title: file.name,
              folder: cleanCategory,
              type: extension === "URL" || extension === "FIGMA" ? "URL" : "FILE",
              url: base64Data, // Save base64 Data URL
              size: sizeMB,
            }),
          });

          if (response.ok) {
            const savedDoc = await response.json();
            const newDoc: ProjectDoc = {
              id: savedDoc.id,
              title: savedDoc.title,
              category: savedDoc.folder as any,
              size: savedDoc.size || sizeMB,
              uploadedBy: "Sistema",
              date: "Hoje",
              url: savedDoc.url,
              content: savedDoc.content
            };

            const updatedDocs = [...(project.docs || []), newDoc];
            const log = {
              id: Date.now(),
              user: "Usuário",
              action: `carregou o documento "${file.name}" na pasta ${cleanCategory}`,
              time: "Agora",
            };

            onUpdateProject({
              ...project,
              docs: updatedDocs,
              history: [log, ...(project.history || [])],
            });
            resolve(true);
          } else {
             resolve(false);
          }
        } catch (error) {
          console.error("Error uploading document:", error);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
    });
  };

  const handleFilesUpload = async (files: FileList) => {
     setUploadingFiles(true);
     const fileArray = Array.from(files);
     let successCount = 0;
     for (const file of fileArray) {
        const success = await handleUpload(file);
        if (success) successCount++;
     }
     setUploadingFiles(false);
     if (successCount > 0) {
        showSuccess(`${successCount} arquivo(s) enviado(s) com sucesso!`);
     } else if (fileArray.length > 0 && successCount === 0) {
        showError("Falha ao enviar os arquivos.");
     }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleManualUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFilesUpload(files);
      }
    };
    input.click();
  };

  const handleDownloadDoc = (doc: any) => {
    setDownloadedDocId(doc.id);
    
    try {
        let content = doc.url;
        let filename = doc.title;
        let mimeType = 'text/plain';

        if (!content && doc.content) {
            // It's a markdown doc
            content = "data:text/markdown;charset=utf-8," + encodeURIComponent(doc.content);
            if (!filename.endsWith('.md')) filename += '.md';
        }

        if (content && content.startsWith('data:')) {
            const a = document.createElement('a');
            a.href = content;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            showError("Não foi possível transferir este arquivo.");
        }
    } catch (e) {
        console.error("Download fail:", e);
        showError("Falha ao preparar download.");
    }

    setTimeout(() => setDownloadedDocId(null), 1500);
  };

  const handleDeleteDoc = async (id: number) => {
    if (!await confirmAction("Excluir Documento", "Tem certeza que deseja apagar este documento? Esta ação não pode ser desfeita.")) return;

    try {
      const response = await fetchWithAuth(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updated = docs.filter((d) => d.id !== id);
        onUpdateProject({ ...project, docs: updated });
        showSuccess("Documento excluído com sucesso!");
      } else {
        showError("Erro ao apagar documento.");
      }
    } catch (error) {
      console.error(error);
      showError("Conexão falhou ao tentar apagar documento.");
    }
  };

  const filteredDocs = docs.filter((d) => {
    const matchesSearch = d.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? d.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const categoriesStr: string[] = [
    "Planejamento",
    "Contratos",
    "Processos",
    "Design",
    "Reuniões",
    "Técnicos",
    "Comercial",
  ];

  return (
    <div className="p-8 flex flex-col gap-8 h-full animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Categories list filter */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest px-3 mb-1">
            Pastas
          </h4>

          <button
            onClick={() => setSelectedCategory("")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === ""
                ? "bg-[#111111] text-white shadow-sm"
                : "text-[#64748B] hover:bg-slate-50 hover:text-[#111111]"
            }`}
          >
            <span className="flex items-center gap-2">
              <FolderOpen size={14} /> Todos os Documentos
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-1.5 rounded ${selectedCategory === "" ? "bg-white/20" : "bg-slate-100 border border-[#0F172A0F]"}`}
            >
              {docs.length}
            </span>
          </button>

          {categoriesStr.map((cat) => {
            const count = docs.filter(
              (d) => (d as any).category === cat || (d as any).folder === cat,
            ).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#111111] text-white shadow-sm"
                    : "text-[#64748B] hover:bg-slate-50 hover:text-[#111111]"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <div
                    className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-slate-300"}`}
                  />
                  {cat}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 rounded ${isSelected ? "bg-white/20" : "bg-[#FAFAFA] border border-[#0F172A0F]"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Columns: Main docs view */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Uploader DropZone simulated */}
          <div className="flex gap-4 items-stretch mb-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!uploadingFiles) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { if (!uploadingFiles) handleFileDrop(e); }}
              onClick={() => { if (!uploadingFiles) handleManualUpload(); }}
              className={`flex-1 border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
                isDragging
                  ? "border-[#111111] bg-[#FAFAFA]"
                  : uploadingFiles
                  ? "border-emerald-200 bg-emerald-50 cursor-progress"
                  : "border-[#0F172A0F] hover:border-[#111111]/30 hover:bg-[#FAFAFA]"
              }`}
            >
              <div className={`w-12 h-12 bg-white rounded-[16px] border border-[#0F172A0F] flex items-center justify-center shadow-sm ${uploadingFiles ? 'text-emerald-500' : 'text-[#64748B]'}`}>
                {uploadingFiles ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#111111]">
                  {uploadingFiles ? "Fazendo upload..." : "Arraste arquivos aqui ou clique para fazer upload"}
                </span>
                <span className={`text-[10px] font-semibold ${uploadingFiles ? 'text-emerald-600' : 'text-[#64748B]'}`}>
                  {uploadingFiles ? "Por favor aguarde enquanto o arquivo é carregado." : "Tamanho máximo de arquivo: 5MB"}
                </span>
              </div>
            </div>

            <div
              onClick={() => onOpenDoc?.()}
              className="w-48 bg-[#FAFAFA] border border-[#0F172A0F] hover:border-[#111111]/30 hover:bg-[#F8FAFC] rounded-[24px] p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-3 transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-[16px] border border-[#0F172A0F] flex items-center justify-center text-[#111111] shadow-sm">
                <FileText size={20} />
              </div>
              <span className="text-xs font-bold text-[#111111]">
                Criar Documento
              </span>
              <span className="text-[10px] text-[#64748B] font-semibold">
                Editor Markdown
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Search filter row */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                size={15}
              />
              <input
                type="text"
                placeholder="Pesquisar nos arquivos da pasta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] py-3 pl-10 pr-4 text-xs outline-none focus:border-[#111111]/30 text-[#111111] font-medium"
              />
            </div>

            {/* List and Cards of Documents */}
            <div className="flex flex-col gap-3">
              {filteredDocs.length > 0 ? (
                <AnimatePresence>
                {filteredDocs.map((doc) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={doc.id}
                    className="bg-white border border-[#0F172A0F] rounded-[16px] p-4 flex items-center justify-between group shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[12px] bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-[#111111] shadow-sm">
                        <FileText size={18} />
                      </div>

                      <div className="flex flex-col">
                        <h4 className="text-xs font-bold text-[#111111]">
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-bold mt-1">
                          <span className="bg-[#FAFAFA] border border-[#0F172A0F] px-1.5 py-0.5 rounded text-[8px] uppercase">
                            {doc.category}
                          </span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>
                            Enviado por: {doc.uploadedBy} ({doc.date})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenDoc?.(doc.id)}
                        className="p-2 hover:bg-slate-50 text-[#64748B] hover:text-[#111111] border border-[#0F172A0F] rounded-[8px]"
                        title="Ver / Editar Documento"
                      >
                        <FileText size={14} />
                      </button>

                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className={`p-2 rounded-[8px] border transition-all flex items-center justify-center ${
                          downloadedDocId === doc.id
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "hover:bg-slate-50 text-[#64748B] border-[#0F172A0F] hover:text-[#111111]"
                        }`}
                        title={
                          downloadedDocId === doc.id
                            ? "Concluído!"
                            : "Download arquivo"
                        }
                      >
                        {downloadedDocId === doc.id ? (
                          <span className="text-[10px] font-bold px-1">
                            ✓ Baixado
                          </span>
                        ) : (
                          <Download size={14} />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-2 hover:bg-red-50 text-[#64748B] hover:text-red-500 rounded-[8px]"
                        title="Deletar arquivo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-12 bg-[#FAFAFA] rounded-[16px] border border-dashed border-[#0F172A0F]/60">
                  <AlertCircle
                    className="mx-auto text-[#64748B] mb-2"
                    size={20}
                  />
                  <p className="text-xs text-[#64748B] font-semibold">
                    Nenhum documento nesta pasta no momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
