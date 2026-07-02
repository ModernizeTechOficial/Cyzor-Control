import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, XCircle, AlertCircle, Clock, Send, ShieldAlert } from 'lucide-react';

interface ApprovalSectionProps {
  entityType: string;
  entityId: number;
}

export const ApprovalSection: React.FC<ApprovalSectionProps> = ({ entityType, entityId }) => {
  const { fetchWithAuth, user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionComment, setActionComment] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, [entityType, entityId]);

  const fetchApprovals = async () => {
    try {
      const res = await fetchWithAuth(`/api/approvals/${entityType}/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      }
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    }
  };

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          title: newTitle,
          approvers: [], // can be assigned later or left global
          dueDate: null
        })
      });

      if (res.ok) {
        setNewTitle('');
        fetchApprovals();
      }
    } catch (err) {
      console.error("Failed to request approval:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (approvalId: number, status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/approvals/${approvalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          comment: actionComment
        })
      });

      if (res.ok) {
        setActionComment('');
        fetchApprovals();
      }
    } catch (err) {
      console.error("Failed to process approval action:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={12} /> Aprovado
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            <XCircle size={12} /> Rejeitado
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertCircle size={12} /> Solicitações de Ajuste
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            <Clock size={12} /> Pendente
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl text-[#111111]">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#111111]">Sistema de Aprovações</h3>
          <p className="text-[11px] text-[#64748B]">Controle de qualidade e validação de entregas</p>
        </div>
      </div>

      {/* Solicitar aprovação */}
      <form onSubmit={handleRequestApproval} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ex: Aprovação de orçamento, design final, etc."
          className="flex-1 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl py-3 px-4 text-xs text-[#111111] focus:outline-none focus:border-[#111111]/30 font-semibold"
        />
        <button
          type="submit"
          disabled={loading || !newTitle.trim()}
          className="bg-[#111111] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-[#111111]/90 flex items-center gap-1.5 transition-all"
        >
          <Send size={13} /> Solicitar
        </button>
      </form>

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {approvals.map((app) => (
          <div key={app.id} className="p-4 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#111111]">{app.title}</h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">Solicitado por {app.requesterName} em {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
              {getStatusBadge(app.status)}
            </div>

            {/* Ações de Aprovador se estiver pendente */}
            {app.status === 'PENDING' && (
              <div className="border-t border-[#0F172A05] pt-3 flex flex-col gap-2">
                <input
                  type="text"
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder="Deixe um comentário/observação para a decisão..."
                  className="w-full bg-white border border-[#0F172A0F] rounded-lg py-2 px-3 text-[11px] text-[#111111] focus:outline-none focus:border-[#111111]/30 font-medium"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleAction(app.id, 'CHANGES_REQUESTED')}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white hover:bg-[#FAFAFA] border border-[#0F172A0F] text-amber-600 rounded-lg text-[10px] font-bold transition-all"
                  >
                    Pedir Ajustes
                  </button>
                  <button
                    onClick={() => handleAction(app.id, 'REJECTED')}
                    disabled={loading}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-all"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleAction(app.id, 'APPROVED')}
                    disabled={loading}
                    className="px-3 py-1.5 bg-[#111111] hover:bg-[#111111]/90 text-white rounded-lg text-[10px] font-bold transition-all"
                  >
                    Aprovar
                  </button>
                </div>
              </div>
            )}

            {/* Histórico */}
            {app.history && app.history.length > 0 && (
              <div className="border-t border-[#0F172A05] pt-3 space-y-2">
                <span className="text-[9px] font-bold tracking-wider text-[#64748B] uppercase">Histórico de Decisões</span>
                {app.history.map((hist: any, index: number) => (
                  <div key={index} className="text-[10px] text-[#334155] bg-white p-2 rounded-lg border border-[#0F172A05] flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{hist.name}</span>
                      <span className="font-mono text-[9px] text-[#64748B]">{hist.status}</span>
                    </div>
                    {hist.comment && <p className="italic text-[#64748B]">"{hist.comment}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {approvals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-[#64748B]">
            <p className="text-xs">Nenhuma aprovação requerida ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
