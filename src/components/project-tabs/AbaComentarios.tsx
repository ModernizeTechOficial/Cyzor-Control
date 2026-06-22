import { useState, useRef, useEffect } from 'react';
import { ProjectExtended, Comment } from '../../types/project';
import { Send, FileText, Paperclip, MessageSquare, AtSign, Smile } from 'lucide-react';

interface AbaComentariosProps {
  project: ProjectExtended;
  onUpdateProject: (updated: ProjectExtended) => void;
}

export default function AbaComentarios({ project, onUpdateProject }: AbaComentariosProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  
  const comments = project.comments || [];
  const team = project.team || [];
  const listEndRef = useRef<HTMLDivElement>(null);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    let formattedText = newCommentText.trim();
    // Re-check mentioning
    if (replyingToId) {
      const parentComment = comments.find(c => c.id === replyingToId);
      formattedText = `Repondo a @${parentComment?.author}: ${formattedText}`;
    }

    const newComment: Comment = {
      id: Date.now(),
      author: 'Usuário',
      text: formattedText,
      time: 'Agora'
    };

    const updatedComments = [...comments, newComment];
    
    // Log Activity
    const log = {
      id: Date.now(),
      user: 'Usuário',
      action: replyingToId ? `respondeu a um comentário no projeto` : `adicionou um comentário no projeto`,
      time: 'Agora'
    };

    onUpdateProject({
      ...project,
      comments: updatedComments,
      history: [log, ...(project.history || [])]
    });

    setNewCommentText('');
    setReplyingToId(null);
    
    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleMentionClick = (name: string) => {
    setNewCommentText(prev => `${prev}@${name} `);
  };

  return (
    <div className="p-8 flex flex-col gap-8 h-full max-w-4xl mx-auto animate-in fade-in duration-200">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Feed of comments */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-[#111111]" /> Canal de Discussão da Iniciativa
          </h3>

          <div className="flex flex-col gap-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm uppercase">
                  {comment.author?.charAt(0) || 'U'}
                </div>

                <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-tr-[20px] rounded-b-[20px] p-4 flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#111111]">{comment.author || 'Usuário'}</span>
                    <span className="text-[10px] text-[#64748B] font-semibold">{comment.time}</span>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-wrap">
                    {/* Render mentioned labels with slightly darker font */}
                    {comment.text}
                  </p>

                  <div className="flex justify-end mt-1">
                    <button 
                      onClick={() => setReplyingToId(comment.id)} 
                      className="text-[9px] font-bold text-[#64748B] hover:text-[#111111]"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={listEndRef} />
            
            {comments.length === 0 && (
              <div className="text-center py-10 text-xs text-[#64748B] font-semibold italic">Nenhum debate neste projeto. Digite abaixo para iniciar.</div>
            )}
          </div>

          {/* Form Composer */}
          <form onSubmit={handlePostComment} className="flex flex-col gap-4 border-t border-[#0F172A0F] pt-4">
            
            {replyingToId && (
              <div className="flex justify-between items-center bg-slate-50 border border-[#0F172A0F]/60 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#64748B]">
                <span>Repondo comentário de de @{comments.find(c => c.id === replyingToId)?.author}</span>
                <button type="button" onClick={() => setReplyingToId(null)} className="text-[#111111]">Cancelar</button>
              </div>
            )}

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#0F172A0F] text-[#475569] flex items-center justify-center text-xs font-bold shrink-0 uppercase shadow-sm">
                U
              </div>

              <div className="flex-grow flex flex-col bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px]">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Escreva algo ou debata com o time... (@Sarah, @Mike)"
                  className="w-full bg-transparent border-none py-3.5 px-4 outline-none resize-none text-xs text-[#111111] h-20 leading-relaxed font-semibold placeholder:text-[#64748B]/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment(e);
                    }
                  }}
                />

                <div className="px-4 py-2 flex justify-between items-center border-t border-[#0F172A0F]/50">
                  <div className="flex gap-2 text-[#64748B]">
                    <button type="button" className="p-1 hover:text-black hover:bg-white rounded" title="Anexar arquivos">
                      <Paperclip size={14} />
                    </button>
                    <button type="button" className="p-1 hover:text-black hover:bg-white rounded" title="Emoji">
                      <Smile size={14} />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="bg-[#111111] text-white p-2 rounded-full hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right column: Mentions lists */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
              <AtSign size={14} /> Membros Citáveis
            </h4>

            <p className="text-[10px] text-[#64748B] leading-relaxed">
              Clique em um colaborador abaixo para adicioná-lo de forma simplificada nas mensagens.
            </p>

            <div className="flex flex-col gap-2">
              {team.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => handleMentionClick(member.name)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-[#0F172A0F]/60 bg-white hover:bg-slate-50 text-left cursor-pointer text-xs font-bold transition-all text-[#111111] shadow-sm"
                >
                  <div className="w-5 h-5 rounded bg-black/10 text-black flex items-center justify-center text-[9px] font-bold shrink-0 uppercase">
                    {member.avatar}
                  </div>
                  <span>@{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
