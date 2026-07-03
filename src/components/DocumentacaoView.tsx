import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Folder, 
  FileText, 
  Star, 
  Clock, 
  Plus, 
  Building2, 
  Package, 
  GitBranch, 
  Terminal, 
  Server, 
  GitMerge, 
  DollarSign, 
  ChevronRight,
  Cloud,
  FileSpreadsheet,
  FileUp,
  FileDown,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Check,
  Copy,
  PlusCircle,
  ArrowUpRight,
  Loader2,
  Lock,
  Files,
  FileCode,
  FileImage,
  Video,
  FileArchive,
  MoreVertical,
  Sliders,
  Sparkles,
  Link2,
  Edit3,
  ClipboardCheck,
  Settings,
  Palette,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import DocEditorModal from './DocEditorModal';
import DriveFileViewerModal from './DriveFileViewerModal';
import NewCategoryModal, { SELECTABLE_ICONS } from './NewCategoryModal';
import ImageEditorProfessional from './ImageEditorProfessional';
import SpreadsheetProfessional from './SpreadsheetProfessional';
import PresentationProfessional from './PresentationProfessional';
import PdfViewerProfessional from './PdfViewerProfessional';
import CodeEditorProfessional from './CodeEditorProfessional';
import LocalPdfViewerModal from './LocalPdfViewerModal';
import LocalImageViewerModal from './LocalImageViewerModal';
import { 
  getDocTypeConfig, 
  DOCUMENT_TYPES, 
  CORPORATE_TEMPLATES 
} from '../lib/documentRegistry';
import { useAuth } from '../context/AuthContext';
import { useDocuments, useProjects } from '../hooks/useCyzorQueries';
import { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import StandardHeader from './layout/StandardHeader';
import { 
  fetchGoogleDriveFiles, 
  uploadFileToGoogleDrive, 
  createGoogleDriveDoc, 
  deleteGoogleDriveFile, 
  formatBytes, 
  GoogleDriveFile 
} from '../utils/googleDrive';

const resolveIcon = (icon: any) => {
  if (typeof icon === 'string') {
    const matched = SELECTABLE_ICONS.find(i => i.id === icon);
    return matched ? matched.icon : Folder;
  }
  return icon || Folder;
};

export default function DocumentacaoView() {
  const { data: documentsData, isLoading: isDocumentsLoading } = useDocuments();
  const { data: projectsData } = useProjects();

  const [documents, setDocuments] = useState<any[]>([]);
  useEffect(() => { if (documentsData) setDocuments(documentsData); }, [documentsData]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const { fetchWithAuth, activeWorkspace, googleDriveToken, connectGoogleDrive } = useAuth();

  const fetchDocuments = async () => {
    if (!activeWorkspace) return;
    try {
      const [docsRes, projRes] = await Promise.all([
        fetchWithAuth('/api/documents'),
        fetchWithAuth('/api/projects')
      ]);
      
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data);
      }
      if (projRes.ok) {
        const data = await projRes.json();
        setProjectsList(data);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchWithAuth, activeWorkspace]);

  const [categories, setCategories] = useState<Array<{ id: string; label: string; icon: any }>>([
    { id: 'Planejamento', label: 'Planejamento', icon: FileText },
    { id: 'Contratos', label: 'Contratos', icon: ClipboardCheck },
    { id: 'Processos', label: 'Processos', icon: Settings },
    { id: 'Design', label: 'Design', icon: Palette },
    { id: 'Reuniões', label: 'Reuniões', icon: Users },
    { id: 'Técnicos', label: 'Técnicos', icon: Terminal },
    { id: 'Comercial', label: 'Comercial', icon: DollarSign },
    { id: 'Projetos', label: 'Projetos', icon: GitBranch },
  ]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const handleDeleteDoc = async (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    
    const { confirmAction } = await import('../lib/alerts');
    const confirmed = await confirmAction('Excluir Documento', 'Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.');
    
    if (!confirmed) return;

    try {
      const res = await fetchWithAuth(`/api/documents/${docId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const { showSuccess } = await import('../lib/alerts');
        showSuccess('Documento excluído com sucesso');
        fetchDocuments();
      } else {
        const { showError } = await import('../lib/alerts');
        showError('Erro ao excluir documento');
      }
    } catch (err) {
      console.error(err);
      const { showError } = await import('../lib/alerts');
      showError('Erro de conexão ao excluir documento');
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCustomCreatorOpen, setIsCustomCreatorOpen] = useState(false);
  const [customCreatorName, setCustomCreatorName] = useState('');
  const [customCreatorFolder, setCustomCreatorFolder] = useState('Geral');
  const [selectedType, setSelectedType] = useState<string>('rich-text');
  
  // photoshop .psd blocker states
  const [psdErrorModalOpen, setPsdErrorModalOpen] = useState(false);
  const [attemptedPsdName, setAttemptedPsdName] = useState('');

  // Tabs state: 'local' (Workspace Docs) or 'gdrive' (Google Drive Integration)
  const [activeTab, setActiveTab] = useState<'local' | 'gdrive'>('local');

  // Google Drive integration
  const [gdriveFiles, setGdriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSearch, setDriveSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingGDoc, setIsCreatingGDoc] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocType, setNewDocType] = useState<'document' | 'spreadsheet' | 'presentation'>('document');
  const [newDocName, setNewDocName] = useState('');
  
  // Quick notice feedback flags
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [fileDeletingId, setFileDeletingId] = useState<string | null>(null);
  const [isDeletingActive, setIsDeletingActive] = useState(false);
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const localFileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive File Viewer Integration Modal States
  const [selectedDriveFile, setSelectedDriveFile] = useState<GoogleDriveFile | null>(null);
  const [isDriveViewerOpen, setIsDriveViewerOpen] = useState(false);

  // Google Drive File Local Metadata (favorite and category mappings)
  const [driveMeta, setDriveMeta] = useState<Record<string, { category?: string; isFavorite?: boolean }>>({});

  useEffect(() => {
    const saved = localStorage.getItem('gdrive_file_metadata');
    if (saved) {
      try {
        setDriveMeta(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading Google Drive local metadata:', err);
      }
    }
  }, []);

  const saveDriveMeta = (newMeta: Record<string, { category?: string; isFavorite?: boolean }>) => {
    setDriveMeta(newMeta);
    localStorage.setItem('gdrive_file_metadata', JSON.stringify(newMeta));
  };

  const toggleFavoriteDriveFile = (fileId: string) => {
    const fileMeta = driveMeta[fileId] || {};
    const newMeta = {
      ...driveMeta,
      [fileId]: {
        ...fileMeta,
        isFavorite: !fileMeta.isFavorite
      }
    };
    saveDriveMeta(newMeta);
  };

  const assignCategoryToDriveFile = (fileId: string, catId: string) => {
    const fileMeta = driveMeta[fileId] || {};
    const newMeta = {
      ...driveMeta,
      [fileId]: {
        ...fileMeta,
        category: catId === 'none' ? undefined : catId
      }
    };
    saveDriveMeta(newMeta);
  };

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Google Drive files if token is verified
  const loadGdriveFiles = async (queryText?: string) => {
    if (!googleDriveToken) return;
    setIsSyncingDrive(true);
    setDriveError(null);
    try {
      const files = await fetchGoogleDriveFiles(googleDriveToken, queryText);
      setGdriveFiles(files);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('has not been used') || msg.toLowerCase().includes('disabled') || msg.toLowerCase().includes('not used in project')) {
        setDriveError(msg);
      } else if (msg.includes('403')) {
        setDriveError(
          'Acesso de API Negado (Erro 403): O serviço Google Drive API não está ativado no seu projeto Google Cloud. Visite o Google Cloud Console, ative a "Google Drive API" para o seu projeto, e aguarde alguns minutos.'
        );
      } else {
        setDriveError(`Erro ao buscar arquivos do Google Drive: ${msg || 'Reconecte ou verifique suas permissões.'}`);
      }
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Sync Google Drive when tab shifts or token loads
  useEffect(() => {
    if (activeTab === 'gdrive' && googleDriveToken) {
      loadGdriveFiles(driveSearch);
    }
  }, [activeTab, googleDriveToken, driveSearch]);

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeWorkspace) return;
    
    const file = e.target.files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    
    if (file.size > 10 * 1024 * 1024) {
      const { showError } = await import('../lib/alerts');
      showError(`O arquivo ${file.name} é muito grande. O limite máximo é 10MB.`);
      return;
    }

    setIsUploadingLocal(true);
    
    try {
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
              title: file.name,
              folder: activeCategory || "Geral",
              url: base64Data,
              size: sizeMB,
            }),
          });

          if (response.ok) {
            const { showSuccess } = await import('../lib/alerts');
            showSuccess(`Arquivo ${file.name} enviado com sucesso!`);
            fetchDocuments();
          } else {
             const { showError } = await import('../lib/alerts');
             showError("Falha ao enviar arquivo.");
          }
        } catch (error) {
          console.error(error);
          const { showError } = await import('../lib/alerts');
          showError("Erro de conexão ao enviar arquivo.");
        } finally {
          setIsUploadingLocal(false);
          if (localFileInputRef.current) localFileInputRef.current.value = '';
        }
      };
    } catch (err) {
      console.error(err);
      setIsUploadingLocal(false);
    }
  };

  const handleConnectGDrive = async () => {
    setDriveError(null);
    try {
      await connectGoogleDrive();
    } catch (err: any) {
      console.error(err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user');
      const isPopupBlocked = err?.code === 'auth/popup-blocked' || err?.message?.includes('popup-blocked');
      
      if (isPopupClosed || isPopupBlocked) {
        setDriveError(
          'A janela de autenticação foi fechada ou bloqueada pelo navegador. Se você estiver usando o aplicativo dentro de um painel de visualização (iframe), o navegador costuma restringir popups de login automáticos por segurança. Abra o aplicativo em uma aba externa para conectar instantaneamente do Google.'
        );
      } else {
        setDriveError('Conexão ao Google Drive foi cancelada ou falhou.');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !googleDriveToken) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setDriveError(null);
    try {
      await uploadFileToGoogleDrive(googleDriveToken, file);
      await loadGdriveFiles(driveSearch);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('403')) {
        setDriveError('Erro 403: O serviço Google Drive API não está ativado no seu projeto Google Cloud.');
      } else {
        setDriveError(`Falha no upload do arquivo: ${msg}`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !googleDriveToken) return;
    setIsCreatingGDoc(true);
    setDriveError(null);
    try {
      await createGoogleDriveDoc(googleDriveToken, newDocType, newDocName);
      setNewDocName('');
      setShowNewDocModal(false);
      await loadGdriveFiles(driveSearch);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('403')) {
        setDriveError('Erro 403: O serviço Google Drive API não está ativado no seu projeto Google Cloud.');
      } else {
        setDriveError(`Falha ao criar o arquivo no Google Drive: ${msg}`);
      }
    } finally {
      setIsCreatingGDoc(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!googleDriveToken) return;
    setIsDeletingActive(true);
    try {
      await deleteGoogleDriveFile(googleDriveToken, id);
      setGdriveFiles(prev => prev.filter(f => f.id !== id));
      setFileDeletingId(null);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('403')) {
        setDriveError('Erro 403: O serviço Google Drive API não está ativado no seu projeto Google Cloud.');
      } else {
        setDriveError(`Erro ao deletar o arquivo: ${msg}`);
      }
    } finally {
      setIsDeletingActive(false);
    }
  };

  const copyToClipboard = (link?: string, id?: string) => {
    if (!link || !id) return;
    navigator.clipboard.writeText(link);
    setCopiedFileId(id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!googleDriveToken || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setIsUploading(true);
      setDriveError(null);
      try {
        await uploadFileToGoogleDrive(googleDriveToken, file);
        await loadGdriveFiles(driveSearch);
      } catch (err: any) {
        console.error(err);
        setDriveError('Falha no upload do arquivo recebido.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Local filtered documents logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'Projetos') {
      return matchesSearch && (doc.projectId !== null || doc.folder === 'Projetos');
    }
    return (activeCategory ? doc.folder === activeCategory : true) && matchesSearch;
  });

  const favorites = filteredDocs.filter(d => d.isFavorite);
  const recents = [...filteredDocs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const getDocSpecialistType = (docObj: any): 'image' | 'spreadsheet' | 'presentation' | 'pdf' | 'code' | 'rich-text' => {
    const config = getDocTypeConfig(docObj);
    return config.editorId as any;
  };

  const handleSaveCustomDoc = async (updatedDoc: any) => {
    try {
      const dbPayload = {
        title: updatedDoc.title,
        content: typeof updatedDoc.content === 'object' ? JSON.stringify(updatedDoc.content) : updatedDoc.content,
        folder: updatedDoc.folder || 'Geral',
        projectId: updatedDoc.projectId ? Number(updatedDoc.projectId) : null,
        isFavorite: updatedDoc.isFavorite || false,
        url: updatedDoc.url || '',
        type: updatedDoc.type || getDocTypeConfig(updatedDoc).id
      };

      let res;
      if (updatedDoc.id) {
        res = await fetchWithAuth(`/api/documents/${updatedDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbPayload)
        });
      } else {
        res = await fetchWithAuth('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbPayload)
        });
      }

      if (res.ok) {
        setIsEditorOpen(false);
        setIsCustomCreatorOpen(false);
        setSelectedDoc(null);
        fetchDocuments();
      }
    } catch (e) {
      console.error('Erro ao salvar documento customizado:', e);
    }
  };

  const handleOpenDoc = (doc: any) => {
    const title = (doc.title || '').toLowerCase();
    if (title.endsWith('.psd')) {
      setAttemptedPsdName(doc.title);
      setPsdErrorModalOpen(true);
      return;
    }
    setSelectedDoc(doc);
    setIsEditorOpen(true);
  };

  const handleNewDoc = () => {
    setSelectedDoc(null);
    setSelectedType('rich-text');
    setCustomCreatorFolder('Geral');
    setCustomCreatorName('');
    (window as any)._activeTemplateContent = '';
    setIsCustomCreatorOpen(true);
  };

  const handleCreateAndOpenDoc = async () => {
    if (!customCreatorName.trim()) return;
    if (customCreatorName.toLowerCase().endsWith('.psd')) {
      setAttemptedPsdName(customCreatorName);
      setPsdErrorModalOpen(true);
      setIsCustomCreatorOpen(false);
      setCustomCreatorName('');
      return;
    }

    try {
      const selectedConfig = DOCUMENT_TYPES[selectedType];
      const defaultContent = (window as any)._activeTemplateContent || '';
      
      const dbPayload = {
        title: customCreatorName,
        content: defaultContent,
        folder: customCreatorFolder || selectedConfig.defaultFolder,
        projectId: null,
        isFavorite: false,
        url: '',
        type: selectedType
      };

      const res = await fetchWithAuth('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });

      if (res.ok) {
        const createdDoc = await res.json();
        setCustomCreatorName('');
        (window as any)._activeTemplateContent = '';
        setIsCustomCreatorOpen(false);
        setSelectedDoc(createdDoc);
        setIsEditorOpen(true);
        fetchDocuments();
      } else {
        const { showError } = await import('../lib/alerts');
        showError('Falha ao criar o documento.');
      }
    } catch (err) {
      console.error('Error creating document:', err);
      const { showError } = await import('../lib/alerts');
      showError('Erro de conexão ao criar o documento.');
    }
  };

  const handleAddCategory = (categoryName: string, iconId: string) => {
    const newId = categoryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    if (categories.find(c => c.id === newId)) {
      return;
    }
    setCategories([...categories, { id: newId, label: categoryName, icon: iconId }]);
  };

  // Helper to format/render drive errors beautifully with clickable direct enable GCP URLs
  const renderDriveErrorHtml = (errorMsg: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = errorMsg.match(urlRegex);
    
    if (urls && urls.length > 0) {
      const rawUrl = urls[0];
      const cleanUrl = rawUrl.replace(/[.,;)]+$/, "");
      
      return (
        <div className="flex flex-col gap-3 bg-rose-50/70 border border-rose-200 text-rose-950 p-5 rounded-2xl text-sm shadow-xs max-w-2xl mx-auto text-left w-full my-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="font-bold text-[#111111]">Ativação da Google Drive API Necessária</span>
              <span className="text-xs text-neutral-600 leading-relaxed font-medium">
                Antes de usar o serviço Google Drive, você precisa ativar a Google Drive API no console GCP para o projeto correspondente.
              </span>
              <span className="text-[11px] font-mono text-neutral-500 break-all p-2.5 bg-[#FAFBF9] border border-[#DEE2E6]/50 rounded-lg select-all">
                {errorMsg}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-1.5 justify-end">
            <a
              href={cleanUrl}
              target="_blank"
              rel="noreferrer referrer"
              className="bg-[#111111] text-white hover:bg-black px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              Ativar no Console do Google Cloud
              <ArrowUpRight size={14} className="text-white/85" />
            </a>
            <button
              type="button"
              onClick={() => loadGdriveFiles(driveSearch)}
              className="bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <RefreshCw size={13} />
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-xl text-xs font-semibold w-full my-4 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
        
        {(errorMsg.includes('externa') || errorMsg.includes('nova aba')) && (
          <a 
            href={window.location.href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors no-underline cursor-pointer"
          >
            <Sparkles size={11} className="text-amber-200" />
            Nova Aba
          </a>
        )}
      </div>
    );
  };

  // Resolve matching Google Drive File Icon & Colors
  const getFileStyleAndIcon = (mime?: string) => {
    if (!mime) return { icon: FileText, color: 'text-neutral-600', bg: 'bg-neutral-50', border: 'border-neutral-200' };
    
    if (mime.includes('document') || mime.includes('word')) {
      return { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-150' };
    }
    if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('sheet')) {
      return { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-150' };
    }
    if (mime.includes('presentation') || mime.includes('powerpoint') || mime.includes('slides')) {
      return { icon: SlidesIcon, color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-150' };
    }
    if (mime.includes('pdf')) {
      return { icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-150' };
    }
    if (mime.includes('image')) {
      return { icon: FileImage, color: 'text-cyan-600', bg: 'bg-cyan-50/50', border: 'border-cyan-150' };
    }
    if (mime.includes('video')) {
      return { icon: Video, color: 'text-violet-600', bg: 'bg-violet-50/50', border: 'border-violet-150' };
    }
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('compressed')) {
      return { icon: FileArchive, color: 'text-amber-800', bg: 'bg-amber-50/20', border: 'border-amber-200' };
    }
    if (mime.includes('json') || mime.includes('javascript') || mime.includes('css') || mime.includes('html')) {
      return { icon: FileCode, color: 'text-teal-600', bg: 'bg-teal-50/40', border: 'border-teal-150' };
    }
    return { icon: FileText, color: 'text-neutral-600', bg: 'bg-neutral-50', border: 'border-[#DEE2E6]/60' };
  };

  const SlidesIcon = (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-10 h-full animate-in fade-in duration-500 px-4 sm:px-6 lg:px-10">
      {/* Header, Switcher Tabs and Primary Actions */}
      <div className="flex flex-col gap-8">
        <StandardHeader 
          title="Documentação"
          subtitle="Central de conhecimento híbrido: Workspace SaaS e Google Drive Cloud."
        />

        {/* Tab Switcher - Match System Visual Theme */}
        <div className="flex bg-[#F1F3F5]/50 p-1 rounded-2xl border border-[#0F172A05] shrink-0 self-start w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'local' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Folder size={14} />
            Workspace
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('gdrive')}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'gdrive' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Cloud size={14} className="text-indigo-600" />
            Google Drive
          </button>
        </div>
      </div>

      {/* 1. DOCUMENTOS DO WORKSPACE (LOCAL SAAS MODE) */}
      {activeTab === 'local' && (
        <>
          {/* Header & Search */}
          <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#111111] flex items-center gap-2">
              <Folder size={20} className="text-neutral-700" />
              Documentos de Procedimentos
            </h2>
            
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-1 lg:max-w-xl w-full">
                <div className="relative group flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} />
                  <input 
                      type="text"
                      placeholder="Pesquisar documentos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#DEE2E6] rounded-[16px] py-3 pl-11 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] text-sm font-medium placeholder:text-[#64748B]/50"
                  />
                </div>
                
                <input
                  type="file"
                  ref={localFileInputRef}
                  onChange={handleLocalFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => localFileInputRef.current?.click()}
                  disabled={isUploadingLocal}
                  className="w-full sm:w-auto bg-white text-[#111111] border border-[#DEE2E6] hover:bg-slate-50 px-4 py-3 rounded-[16px] font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
                >
                  {isUploadingLocal ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileUp size={16} />
                  )}
                  Subir
                </button>

                <button 
                  onClick={handleNewDoc}
                  className="w-full sm:w-auto bg-[#111111] text-white px-5 py-3 rounded-[16px] font-bold text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer shadow-md"
                >
                  <Plus size={16} />
                  Novo
                </button>
              </div>
          </section>
          
          {/* Main Content Layout */}
          <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 items-start min-h-0">
            
            {/* Categories Sidebar */}
            <div className="w-full lg:w-[260px] flex-shrink-0 flex flex-row lg:flex-col gap-2 bg-[#FAFAFA]/50 border border-[#DEE2E6]/60 rounded-[24px] p-2 sm:p-4 lg:sticky lg:top-0 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-3 lg:pb-4">
              <h3 className="hidden lg:block text-[11px] font-bold uppercase text-[#64748B] tracking-widest px-4 mb-2">Estrutura</h3>
              
              <CategoryItem 
                label="Início" 
                icon={Folder} 
                active={activeCategory === null} 
                onClick={() => setActiveCategory(null)} 
                count={activeTab === 'local' ? documents.length : gdriveFiles.length}
              />
              
              <div className="hidden lg:block w-full h-px bg-[#0F172A0F] my-2"></div>
              
              {categories.map(cat => (
                <CategoryItem 
                  key={cat.id}
                  label={cat.label} 
                  icon={resolveIcon(cat.icon)} 
                  active={activeCategory === cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  count={
                    activeTab === 'local' 
                      ? documents.filter(d => d.folder === cat.id).length 
                      : gdriveFiles.filter(f => driveMeta[f.id]?.category === cat.id).length
                  }
                />
              ))}

              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex-shrink-0 lg:w-[calc(100%-8px)] lg:mx-auto flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-[14px] text-xs font-bold text-[#64748B] hover:text-[#111111] hover:bg-[#E2E8F0]/30 transition-all border border-dashed border-[#DEE2E6]/80 hover:border-[#111111]/25 lg:mt-3 cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Nova</span>
              </button>
            </div>

            {/* Documents Content */}
            <div className="flex-1 flex flex-col gap-10 w-full">
              
              {!activeCategory && !searchQuery && (
                <>
                  {/* Favorites row */}
                  {favorites.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest flex items-center gap-2">
                        <Star size={16} className="text-yellow-500 fill-yellow-500/20" /> Favoritos
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {favorites.map(doc => (
                          <DocCard 
                            key={doc.id} 
                            doc={doc} 
                            onClick={() => handleOpenDoc(doc)} 
                            onDelete={(e) => handleDeleteDoc(e, doc.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recents row */}
                  {recents.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest flex items-center gap-2">
                        <Clock size={16} className="text-[#64748B]" /> Recentes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {recents.map(doc => (
                          <DocCard 
                            key={doc.id} 
                            doc={doc} 
                            onClick={() => handleOpenDoc(doc)} 
                            onDelete={(e) => handleDeleteDoc(e, doc.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* List of documents */}
              <div className="flex flex-col gap-4 pb-10">
                <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest flex items-center justify-between border-b border-[#DEE2E6]/60 pb-3">
                  {activeCategory ? categories.find(c => c.id === activeCategory)?.label : 'Todos os Documentos'}
                  <span className="bg-[#FAFAFA] border border-[#DEE2E6]/60 px-2.5 py-0.5 rounded text-[10px] text-[#64748B]">{filteredDocs.length}</span>
                </h3>
                
                <div className="flex flex-col gap-3">
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map(doc => (
                      <DocListItem 
                        key={doc.id} 
                        doc={doc} 
                        onClick={() => handleOpenDoc(doc)} 
                        onDelete={(e) => handleDeleteDoc(e, doc.id)}
                        categories={categories} 
                        projects={projectsList}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 bg-[#FAFAFA] rounded-[16px] border border-dashed border-[#DEE2E6]">
                      <p className="text-[#64748B] text-sm font-medium">Nenhum documento encontrado.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </section>
        </>
      )}

      {/* 2. GOOGLE DRIVE INTEGRATION (CLOUD REALTIME MODE) */}
      {activeTab === 'gdrive' && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Connection Wall */}
          {!googleDriveToken ? (
            <div className="bg-[#FAFBF9] border border-[#DEE2E6] rounded-[24px] p-8 max-w-3xl mx-auto text-center flex flex-col items-center gap-5 my-8">
              <div className="bg-indigo-50 p-4 rounded-full text-indigo-600">
                <Cloud size={42} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Conecte sua conta do Google Drive</h3>
                <p className="text-sm text-[#64748B] mt-2 max-w-md mx-auto">
                  Visualize seus arquivos, sincronize documentos corporativos, realize uploads arrastando arquivos e crie slides ou planilhas compartilhadas em tempo real.
                </p>
              </div>

              {driveError && renderDriveErrorHtml(driveError)}

              <button
                type="button"
                onClick={handleConnectGDrive}
                className="bg-[#111111] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-md hover:bg-black transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#ffffff" fillOpacity="0.85" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#ffffff" fillOpacity="0.75" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#ffffff" fillOpacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Conectar com Google Drive
              </button>
            </div>
          ) : (
            <>
              {/* Controls and Active Integration Panel */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Drive Input */}
                <div className="relative flex-1 max-w-lg group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="text"
                    value={driveSearch}
                    onChange={(e) => setDriveSearch(e.target.value)}
                    placeholder="Pesquisar arquivos e pastas no seu Google Drive..."
                    className="w-full bg-[#FFFFFF] border border-[#DEE2E6] rounded-[16px] py-3 pl-11 pr-4 outline-none focus:border-indigo-600/30 transition-all text-neutral-900 text-sm font-medium"
                  />
                  {driveSearch && (
                    <button 
                      onClick={() => setDriveSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Operations Actions & Uploaders */}
                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  {/* File Uploader Target Trigger */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50/50 hover:border-indigo-300 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-55 cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <FileUp size={14} />
                    )}
                    {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNewDocModal(true)}
                    className="bg-[#111111] hover:bg-neutral-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    Criar Novo Doc
                  </button>

                  <button
                    type="button"
                    onClick={() => loadGdriveFiles(driveSearch)}
                    disabled={isSyncingDrive}
                    className="p-3 text-neutral-500 hover:text-neutral-900 bg-[#FAFBF9] border border-[#DEE2E6] rounded-xl transition-colors disabled:opacity-50"
                    title="Atualizar arquivos"
                  >
                    <RefreshCw size={14} className={isSyncingDrive ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Feedback States & Notices */}
              {driveError && renderDriveErrorHtml(driveError)}

              {/* Drag and Drop Container Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-[24px] p-8 transition-all min-h-[380px] flex flex-col justify-between ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/20 scale-[0.995]' 
                    : 'border-[#DEE2E6] bg-[#FFFFFF]'
                }`}
              >
                {/* Drag-over indicator flag */}
                {isDragging && (
                  <div className="absolute inset-0 bg-indigo-500/15 rounded-[22px] pointer-events-none flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-indigo-200 flex items-center gap-3">
                      <FileUp size={24} className="text-indigo-600 animate-bounce" />
                      <span className="font-bold text-sm text-neutral-800">Solte o arquivo para enviar ao Google Drive</span>
                    </div>
                  </div>
                )}

                {/* Main Content Grid or Loaders */}
                {isSyncingDrive ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 my-auto mx-auto">
                    <Loader2 size={36} className="text-indigo-600 animate-spin" />
                    <span className="text-sm font-bold text-[#64748B]">Sincronizando arquivos do Google Drive...</span>
                  </div>
                ) : (() => {
                  const filteredGDriveFiles = gdriveFiles.filter(file => {
                    const meta = driveMeta[file.id] || {};
                    return activeCategory ? meta.category === activeCategory : true;
                  });

                  const driveFavorites = filteredGDriveFiles.filter(file => !!driveMeta[file.id]?.isFavorite);
                  const otherDriveFiles = filteredGDriveFiles.filter(file => !driveMeta[file.id]?.isFavorite);

                  const renderDriveFileCard = (file: GoogleDriveFile) => {
                    const style = getFileStyleAndIcon(file.mimeType);
                    const IconComponent = style.icon;
                    const isFav = !!driveMeta[file.id]?.isFavorite;
                    const fileCategory = driveMeta[file.id]?.category || 'none';

                    return (
                      <div
                        key={file.id}
                        className="bg-white border border-[#DEE2E6]/60 rounded-2xl p-4.5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer relative"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('button') || target.closest('a') || target.closest('select')) return;
                          
                          const title = (file.name || '').toLowerCase();
                          if (title.endsWith('.psd')) {
                            setAttemptedPsdName(file.name);
                            setPsdErrorModalOpen(true);
                            return;
                          }
                          
                          setSelectedDriveFile(file);
                          setIsDriveViewerOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.color} ${style.bg} border ${style.border}`}>
                            <IconComponent size={20} />
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Favorite Toggler element */}
                            <button
                              type="button"
                              onClick={() => toggleFavoriteDriveFile(file.id)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isFav 
                                  ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50/50' 
                                  : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-50'
                              }`}
                              title={isFav ? "Remover dos Favoritos" : "Marcar como Favorito"}
                            >
                              <Star size={14} className={isFav ? 'fill-yellow-500' : ''} />
                            </button>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(file.webViewLink, file.id)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-750 hover:bg-neutral-50 rounded-md transition-colors cursor-pointer"
                                title="Copiar link oficial"
                              >
                                {copiedFileId === file.id ? (
                                  <Check size={13} className="text-emerald-500" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => setFileDeletingId(file.id)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Excluir arquivo do Drive"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={file.name}>
                            {file.name}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-neutral-500 mt-1.5 font-medium">
                            <span>{formatBytes(file.size)}</span>
                            <span>•</span>
                            <span>{file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('pt-BR') : 'Sem data'}</span>
                          </div>
                        </div>

                        {/* Interactive Category Tag Selector drop-down */}
                        <div className="flex items-center justify-between gap-1.5 border-t border-dashed border-[#DEE2E6]/60 pt-2.5 mt-0.5">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                            <Folder size={10} className="text-neutral-400 shrink-0" />
                            Espaço:
                          </span>
                          <select
                            value={fileCategory}
                            onChange={(e) => assignCategoryToDriveFile(file.id, e.target.value)}
                            className="bg-[#FAFBF9] border border-[#DEE2E6] hover:border-[#111111]/25 rounded-lg text-[10px] font-bold text-neutral-700 px-2 py-1 outline-none transition-all max-w-[145px] cursor-pointer"
                          >
                            <option value="none">Organizar em...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const title = (file.name || '').toLowerCase();
                              if (title.endsWith('.psd')) {
                                setAttemptedPsdName(file.name);
                                setPsdErrorModalOpen(true);
                                return;
                              }
                              
                              setSelectedDriveFile(file);
                              setIsDriveViewerOpen(true);
                            }}
                            className="bg-[#111111] hover:bg-black text-white rounded-xl py-2 px-3 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-xs"
                          >
                            <Edit3 size={11} />
                            Abrir Aqui
                          </button>

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="border border-[#DEE2E6] hover:bg-neutral-50/50 text-neutral-850 rounded-xl py-2 px-3 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
                            >
                              Nova Aba
                              <ExternalLink size={11} className="text-neutral-400" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  };

                  if (filteredGDriveFiles.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center my-auto mx-auto max-w-sm">
                        <div className="bg-neutral-100 p-4 rounded-full text-neutral-400">
                          <Files size={32} />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-sm">Nenhum arquivo no Google Drive</p>
                          <p className="text-xs text-neutral-500 mt-1.5">
                            {activeCategory 
                              ? 'Não encontramos nenhum documento do Drive nesta categoria.' 
                              : 'Sua pasta principal está vazia ou os filtros de pesquisa não retornaram resultados correspondentes.'}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-8 w-full">
                      {/* Sub-favorite row rendered if no specific category or search active */}
                      {!activeCategory && !driveSearch && driveFavorites.length > 0 && (
                        <div className="flex flex-col gap-4">
                          <h3 className="text-xs font-bold uppercase text-[#111111] tracking-widest flex items-center gap-2 border-b border-[#DEE2E6]/60 pb-2.5">
                            <Star size={14} className="text-yellow-500 fill-yellow-500/20 animate-pulse" /> Favoritos do Google Drive
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {driveFavorites.map(file => renderDriveFileCard(file))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                        {!activeCategory && !driveSearch && driveFavorites.length > 0 && (
                          <h3 className="text-xs font-bold uppercase text-neutral-400 tracking-widest border-b border-[#DEE2E6]/40 pb-2.5">
                            Outros Arquivos
                          </h3>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {!activeCategory && !driveSearch && driveFavorites.length > 0
                            ? otherDriveFiles.map(file => renderDriveFileCard(file))
                            : filteredGDriveFiles.map(file => renderDriveFileCard(file))
                          }
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Drag-Drop notice */}
                {!isSyncingDrive && (
                  <p className="text-[11px] font-bold text-neutral-400 text-center uppercase tracking-wider mt-8">
                    Dica: Arraste e solte arquivos do seu computador em qualquer lugar desta caixa para realizar o upload instantâneo.
                  </p>
                )}
              </div>
            </>
          )}

        </div>
      )}

      {/* Editor & Configuration Modals */}
      {isEditorOpen && selectedDoc && (() => {
        const docType = getDocSpecialistType(selectedDoc);
        const fileName = (selectedDoc.title || '').toLowerCase();
        
        // Prefer local viewer if it has a URL (uploaded files)
        if (selectedDoc.url) {
          if (docType === 'image') {
            return (
              <LocalImageViewerModal 
                doc={selectedDoc}
                isOpen={isEditorOpen}
                onClose={() => {
                  setIsEditorOpen(false);
                  setSelectedDoc(null);
                }}
              />
            );
          }
          if (docType === 'pdf') {
            return (
              <LocalPdfViewerModal 
                doc={selectedDoc}
                isOpen={isEditorOpen}
                onClose={() => {
                  setIsEditorOpen(false);
                  setSelectedDoc(null);
                }}
              />
            );
          }
        }

        if (docType === 'image') {
          return (
            <ImageEditorProfessional
              doc={selectedDoc}
              onSave={handleSaveCustomDoc}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedDoc(null);
              }}
            />
          );
        }
        if (docType === 'spreadsheet') {
          return (
            <SpreadsheetProfessional
              doc={selectedDoc}
              onSave={handleSaveCustomDoc}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedDoc(null);
              }}
            />
          );
        }
        if (docType === 'presentation') {
          return (
            <PresentationProfessional
              doc={selectedDoc}
              onSave={handleSaveCustomDoc}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedDoc(null);
              }}
            />
          );
        }
        if (docType === 'pdf') {
          return (
            <PdfViewerProfessional
              doc={selectedDoc}
              onSave={handleSaveCustomDoc}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedDoc(null);
              }}
            />
          );
        }
        if (docType === 'code') {
          return (
            <CodeEditorProfessional
              doc={selectedDoc}
              onSave={handleSaveCustomDoc}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedDoc(null);
              }}
            />
          );
        }
        // Fallback to standard standard Rich Text DocEditorModal
        return (
          <DocEditorModal 
            doc={selectedDoc} 
            isOpen={isEditorOpen} 
            onClose={() => {
              setIsEditorOpen(false);
              setSelectedDoc(null);
              fetchDocuments();
            }}
            onSave={(updatedDoc) => {
              // setIsEditorOpen(false); // Commented out to keep modal open
              // setSelectedDoc(null); // Commented out to keep modal open
              fetchDocuments();
            }}
          />
        );
      })()}

      {/* Premium Professional Creator Preset Selector Modal */}
      {/* Premium Professional Creator Preset Selector Modal */}
      {isCustomCreatorOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-left overflow-y-auto">
          <div className="bg-white rounded-[28px] border border-slate-200 p-8 max-w-2xl w-full shadow-[0_30px_90px_rgba(0,0,0,0.15)] flex flex-col gap-6 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-xl font-body font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="text-amber-500 animate-pulse animate-duration-1000" size={20} />
                Criar Novo Documento Profissional
              </h3>
              <p className="text-xs text-neutral-500 font-semibold mt-1">Selecione o formato inteligente ou utilize um modelo corporativo da biblioteca abaixo.</p>
            </div>

            {/* Template Library Selection */}
            <div className="flex flex-col gap-2 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">Central de Modelos Corporativos (1-Clique)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {CORPORATE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setCustomCreatorName(tmpl.title);
                      setCustomCreatorFolder(tmpl.folder);
                      setSelectedType(tmpl.documentType);
                      (window as any)._activeTemplateContent = tmpl.content;
                    }}
                    className="p-3 bg-white border border-slate-200 hover:border-amber-500 rounded-xl text-left transition-all hover:bg-amber-500/5 group"
                  >
                    <span className="text-xs font-bold text-neutral-800 block group-hover:text-amber-800">{tmpl.title}</span>
                    <span className="text-[9px] text-neutral-400 block mt-0.5">{tmpl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
              {[
                { id: 'rich-text', name: 'Procedimento', folder: 'Geral', desc: 'Rich Text & Capa', color: 'bg-indigo-50 border-indigo-200 text-indigo-650', icon: FileText },
                { id: 'spreadsheet', name: 'Planilha', folder: 'Comercial', desc: 'Fórmulas & Gráficos', color: 'bg-emerald-50 border-emerald-200 text-emerald-650', icon: FileSpreadsheet },
                { id: 'presentation', name: 'Pitch Slide', folder: 'Planejamento', desc: 'Marketing Deck', color: 'bg-indigo-50/50 border-indigo-200/60 text-indigo-600', icon: Sliders },
                { id: 'code', name: 'Script Código', folder: 'Código', desc: 'TypeScript & SQL', color: 'bg-teal-50 border-teal-200 text-teal-650', icon: FileCode },
                { id: 'image', name: 'Editor Imagem', folder: 'Design', desc: 'Ajuste IA & Brush', color: 'bg-cyan-50 border-cyan-200 text-cyan-650', icon: FileImage },
                { id: 'pdf', name: 'Leitor PDF', folder: 'Contratos', desc: 'Assinar & Rubricas', color: 'bg-rose-50 border-rose-200 text-rose-650', icon: FileText },
              ].map(formatItem => {
                const IconComp = formatItem.icon;
                const isSelected = selectedType === formatItem.id;
                return (
                  <button
                    key={formatItem.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(formatItem.id);
                      setCustomCreatorFolder(formatItem.folder);
                    }}
                    className={`p-3.5 border rounded-2xl text-left flex flex-col gap-2 transition-all ${
                      isSelected 
                        ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800/10' 
                        : 'border-[#DEE2E6]/60 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${formatItem.color}`}>
                      <IconComp size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 tracking-tight">{formatItem.name}</h4>
                      <p className="text-[9.5px] text-neutral-400 font-semibold mt-0.5">{formatItem.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 border-t border-neutral-100 pt-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Título do Documento</label>
                <input
                  type="text"
                  required
                  value={customCreatorName}
                  onChange={(e) => setCustomCreatorName(e.target.value)}
                  placeholder="Ex: Contrato Anual Cyzor, Briefing de Design UI..."
                  className="w-full bg-[#FAFAFA] border border-[#DEE2E6] rounded-xl py-3 px-4 outline-none focus:border-slate-800/30 font-medium text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCreatorOpen(false);
                    setCustomCreatorName('');
                    (window as any)._activeTemplateContent = '';
                  }}
                  className="text-center bg-white border border-[#DEE2E6] hover:bg-neutral-50 text-neutral-700 text-xs uppercase tracking-wider font-bold px-4 py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!customCreatorName.trim()}
                  onClick={handleCreateAndOpenDoc}
                  className="bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-wider font-bold px-5 py-3 rounded-xl shadow-sm transition-all disabled:opacity-40"
                >
                  Criar & Abrir Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DriveFileViewerModal
        file={selectedDriveFile}
        isOpen={isDriveViewerOpen}
        onClose={() => {
          setIsDriveViewerOpen(false);
          setSelectedDriveFile(null);
        }}
      />

      <NewCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      {/* Photoshop .psd blocker Warning Modal */}
      {psdErrorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-[28px] border border-slate-200 p-8 max-w-md w-full shadow-[0_30px_90px_rgba(0,0,0,0.15)] flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Formato Não Suportado</h3>
                <span className="text-xs text-slate-500 font-medium">Arquivo do Adobe Photoshop (.PSD)</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              O arquivo <span className="font-mono text-slate-905 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{attemptedPsdName}</span> não pode ser aberto diretamente por ser de autoria proprietária do Photoshop.
            </p>
            
            <p className="text-[11px] text-slate-550 leading-relaxed font-medium">
              Por favor, realize o download do arquivo para editá-lo localmente utilizando o Adobe Photoshop ou softwares de design compatíveis em sua máquina de trabalho.
            </p>

            <div className="flex justify-end gap-3.5 border-t border-slate-100 pt-4 mt-1">
              <button
                type="button"
                onClick={() => {
                  setPsdErrorModalOpen(false);
                  setAttemptedPsdName('');
                }}
                className="w-full bg-slate-900 hover:bg-black text-white text-xs uppercase tracking-wider font-bold py-3 rounded-xl transition-all shadow-xs cursor-pointer text-center select-none"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Google Doc popup modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in dynamic-duration">
          <div className="bg-white rounded-t-[24px] sm:rounded-[24px] border border-[#DEE2E6] p-6 max-w-md w-full shadow-xl flex flex-col gap-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 pb-10 sm:pb-6 text-left">
            <div>
              <h3 className="text-lg font-bold text-[#111111]">Criar Documento em Nuvem</h3>
              <p className="text-xs text-[#64748B] mt-1 font-medium">Isso criará uma página oficial editável diretamente na sua conta do Google.</p>
            </div>

            <form onSubmit={handleCreateNewDoc} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Tipo de Documento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDocType('document')}
                    className={`py-2 px-2 sm:px-3 border rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                      newDocType === 'document' ? 'border-indigo-600 bg-indigo-50/25 text-indigo-700' : 'border-[#DEE2E6] hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <FileText size={18} />
                    Docs
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDocType('spreadsheet')}
                    className={`py-2 px-2 sm:px-3 border rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                      newDocType === 'spreadsheet' ? 'border-emerald-600 bg-emerald-50/25 text-emerald-700' : 'border-[#DEE2E6] hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <FileSpreadsheet size={18} />
                    Planilha
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDocType('presentation')}
                    className={`py-2 px-2 sm:px-3 border rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                      newDocType === 'presentation' ? 'border-amber-600 bg-amber-50/25 text-amber-700' : 'border-[#DEE2E6] hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <SlidesIcon size={18} />
                    Apres.
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Título do Documento</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Ex: Briefing de Campanha Q3, Metas de Venda"
                  className="w-full bg-[#FFFFFF] border border-[#DEE2E6] rounded-xl py-3 px-4 outline-none focus:border-indigo-600/30 transition-all text-sm font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2 pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDocModal(false);
                    setNewDocName('');
                  }}
                  className="flex-1 sm:flex-initial text-center bg-white border border-[#DEE2E6] hover:bg-neutral-50 text-neutral-700 text-xs uppercase tracking-wider font-bold px-4 py-3 sm:py-2.5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGDoc || !newDocName.trim()}
                  className="flex-1 sm:flex-initial text-center justify-center bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-wider font-bold px-4 py-3 sm:py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-55"
                >
                  {isCreatingGDoc && <Loader2 size={13} className="animate-spin" />}
                  {isCreatingGDoc ? 'Criando...' : 'Criar Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileDeletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in dynamic-duration">
          <div className="bg-white rounded-t-[24px] sm:rounded-[24px] border border-[#DEE2E6] p-6 max-w-sm w-full shadow-xl flex flex-col gap-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 pb-10 sm:pb-6 text-left">
            <div>
              <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2 text-rose-600">
                <Trash2 size={18} />
                Excluir do Google Drive?
              </h3>
              <p className="text-xs text-[#64748B] mt-2 font-medium leading-relaxed">
                Você tem certeza que deseja excluir permanentemente este arquivo? Essa ação é imediata e não poderá ser desfeita na lixeira do Google Drive local.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2 pr-1">
              <button
                type="button"
                disabled={isDeletingActive}
                onClick={() => setFileDeletingId(null)}
                className="flex-1 sm:flex-initial text-center bg-white border border-[#DEE2E6] hover:bg-neutral-50 text-neutral-700 text-xs uppercase tracking-wider font-bold px-4 py-3 sm:py-2.5 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingActive}
                onClick={() => handleDeleteFile(fileDeletingId)}
                className="flex-1 sm:flex-initial text-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase tracking-wider font-bold px-4 py-3 sm:py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-55"
              >
                {isDeletingActive && <Loader2 size={13} className="animate-spin" />}
                {isDeletingActive ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function CategoryItem({ label, icon: Icon, active, onClick, count }: { label: string, icon: any, active: boolean, onClick: () => void, count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-shrink-0 lg:w-full flex items-center justify-between px-4 py-2.5 rounded-[14px] transition-colors cursor-pointer whitespace-nowrap ${active ? 'bg-[#111111] text-white shadow-sm' : 'text-[#64748B] hover:bg-[#E2E8F0]/50 hover:text-[#111111]'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-white' : 'text-[#64748B]'} />
        <span className="text-sm font-bold">{label}</span>
      </div>
      {count !== undefined && (
         <span className={`hidden lg:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-[#FFFFFF] border border-[#DEE2E6]/60 text-[#64748B]'}`}>{count}</span>
      )}
    </button>
  );
}

function DocCard({ doc, onClick, onDelete }: { doc: any, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#FFFFFF] border border-[#DEE2E6]/60 rounded-[20px] p-5 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer group hover:border-[#111111]/20 animate-in fade-in dynamic-duration animate-duration-300 relative"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm border ${
          (doc.title || '').toLowerCase().endsWith('.pdf') 
            ? 'bg-rose-50 text-rose-600 border-rose-100' 
            : (doc.title || '').toLowerCase().match(/\.(png|jpg|jpeg|svg|webp)$/)
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-[#FAFAFA] border-[#DEE2E6]/60 text-[#111111]'
        }`}>
          {(doc.title || '').toLowerCase().match(/\.(png|jpg|jpeg|svg|webp)$/) ? <ImageIcon size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex items-center gap-2">
          {doc.isFavorite && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
            title="Excluir documento"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-[#111111] line-clamp-1">{doc.title}</h4>
        <span className="text-xs text-[#64748B]">{doc.updated || new Date(doc.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function DocListItem({ doc, onClick, onDelete, categories, projects }: { doc: any, onClick: () => void, onDelete: (e: React.MouseEvent) => void, categories: any[], projects: any[] }) {
  const matchedCat = categories.find(c => c.id === doc.category) || categories.find(c => c.id === doc.folder);
  const CatIcon = resolveIcon(matchedCat ? matchedCat.icon : Folder);
  const project = projects.find(p => p.id === doc.projectId);

  const fileName = (doc.title || '').toLowerCase();
  const isPdf = fileName.endsWith('.pdf');
  const isImage = fileName.match(/\.(png|jpg|jpeg|svg|webp)$/);

  return (
    <div 
      onClick={onClick}
      className="bg-[#FFFFFF] border border-[#DEE2E6]/60 rounded-[16px] p-3 sm:p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer group hover:bg-[#FAFAFA]"
    >
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm border ${
          isPdf 
            ? 'bg-rose-50 text-rose-600 border-rose-100' 
            : isImage 
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-[#FAFAFA] border-[#DEE2E6]/60 text-[#64748B]'
        }`}>
          {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="font-semibold text-[#111111] group-hover:text-black transition-colors truncate text-sm sm:text-base">{doc.title}</h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-[#64748B]">
            <span className="flex items-center gap-1 font-bold text-[#111111]/70"><CatIcon size={12} /> {matchedCat?.label || doc.folder || 'Geral'}</span>
            <span className="hidden sm:inline">•</span>
            {project && (
                <>
                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-[4px] font-bold text-[9px] uppercase border border-indigo-100 truncate max-w-[120px]">
                        <GitBranch size={10} /> {project.name}
                    </span>
                    <span className="hidden sm:inline">•</span>
                </>
            )}
            <span className="truncate">Editado: {doc.updated || new Date(doc.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {doc.isFavorite && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-all sm:opacity-0 group-hover:opacity-100"
          title="Excluir documento"
        >
          <Trash2 size={16} />
        </button>
        <ChevronRight size={18} className="text-[#64748B] sm:opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </div>
    </div>
  );
}
