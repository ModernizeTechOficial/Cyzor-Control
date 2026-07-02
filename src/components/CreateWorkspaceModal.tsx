import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { fetchWithAuth, syncSaaSState, updateSaaSBackend } = useAuth();
  const [newWsName, setNewWsName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const res = await fetchWithAuth('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWsName.trim() })
      });
      
      if (res.ok) {
        const newWs = await res.json();
        await syncSaaSState(); // Refresh workspaces list
        updateSaaSBackend(undefined, newWs.id); // Switch to new workspace
        onClose();
        setNewWsName('');
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[28px] w-full max-w-md p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-[#111111]">Novo Workspace</h3>
            <p className="text-xs text-[#64748B]">Crie um ambiente separado para seus projetos.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-[#FAFAFA] flex items-center justify-center text-[#64748B] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Nome do Workspace</label>
            <input 
              autoFocus
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Ex: Minha Agência, Projeto Alpha..."
              className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-4 text-sm font-bold text-[#111111] outline-none focus:border-[#111111]/20 focus:bg-white transition-all shadow-sm"
              required
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl bg-white border border-[#0F172A0F] text-xs font-bold text-[#64748B] hover:bg-[#FAFAFA] transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={!newWsName.trim() || isCreating}
              className="flex-1 px-6 py-4 rounded-2xl bg-[#111111] text-xs font-bold text-white hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Criar Workspace <Plus size={14} /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
