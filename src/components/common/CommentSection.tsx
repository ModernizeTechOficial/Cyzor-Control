import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ThumbsUp, Send, Trash2, Reply, Paperclip } from 'lucide-react';

interface CommentSectionProps {
  entityType: string;
  entityId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ entityType, entityId }) => {
  const { fetchWithAuth, user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    try {
      const res = await fetchWithAuth(`/api/comments/${entityType}/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
    const content = parentId ? (e.target as any).replyText.value : newComment;
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          content,
          parentId
        })
      });

      if (res.ok) {
        if (parentId) {
          (e.target as any).replyText.value = '';
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir este comentário?")) return;
    try {
      const res = await fetchWithAuth(`/api/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleReaction = async (commentId: number) => {
    // For simplicity, we just toggle thumbs up locally or through a quick endpoint
    // To make it instant and high fidelity, we show client-side feedback immediately
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const currentReactions = c.reactions || [];
        const existing = currentReactions.find((r: any) => r.emoji === '👍');
        if (existing) {
          if (existing.users.includes(user?.uid)) {
            existing.users = existing.users.filter((u: string) => u !== user?.uid);
            existing.count = Math.max(0, existing.count - 1);
          } else {
            existing.users.push(user?.uid);
            existing.count += 1;
          }
        } else {
          currentReactions.push({ emoji: '👍', count: 1, users: [user?.uid] });
        }
        return { ...c, reactions: [...currentReactions] };
      }
      return c;
    }));
  };

  return (
    <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl text-[#111111]">
          <MessageSquare size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#111111]">Feed de Discussão</h3>
          <p className="text-[11px] text-[#64748B]">Comentários, atualizações e anotações da equipe</p>
        </div>
      </div>

      {/* Main Comment Input */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3 items-end">
        <div className="flex-1 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] p-3 focus-within:border-[#111111]/30 transition-all">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário ou atualize o status..."
            rows={2}
            className="w-full bg-transparent border-none outline-none text-xs text-[#111111] placeholder-[#64748B] resize-none"
          />
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#0F172A0F]/50">
            <button type="button" className="text-[#64748B] hover:text-[#111111] transition-colors">
              <Paperclip size={14} />
            </button>
            <span className="text-[10px] text-[#64748B]">Suporta @menções</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-[#111111] text-white p-3.5 rounded-[16px] hover:bg-[#111111]/90 transition-all hover:scale-102 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send size={16} />
        </button>
      </form>

      {/* List of Comments */}
      <div className="space-y-4">
        {comments.filter(c => !c.parentId).map((c) => {
          const replies = comments.filter(r => r.parentId === c.id);
          const likesCount = (c.reactions?.find((r: any) => r.emoji === '👍')?.count) || 0;
          const userLiked = (c.reactions?.find((r: any) => r.emoji === '👍')?.users?.includes(user?.uid)) || false;

          return (
            <div key={c.id} className="border-b border-[#0F172A05] pb-4 last:border-b-0 last:pb-0 flex flex-col gap-2.5">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold">
                  {c.authorName ? c.authorName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111111]">{c.authorName}</span>
                    <span className="text-[10px] text-[#64748B]">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#334155] mt-1 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                  
                  {/* Actions Bar */}
                  <div className="flex items-center gap-3 mt-2.5">
                    <button
                      onClick={() => handleReaction(c.id)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                        userLiked ? 'bg-[#111111] border-transparent text-white' : 'bg-transparent border-[#0F172A0F] text-[#64748B] hover:text-[#111111]'
                      }`}
                    >
                      <ThumbsUp size={11} /> {likesCount}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                      className="text-[10px] font-bold text-[#64748B] hover:text-[#111111] flex items-center gap-1"
                    >
                      <Reply size={11} /> Responder
                    </button>
                    {c.userId === user?.uid && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies Thread */}
              {replies.length > 0 && (
                <div className="ml-11 pl-4 border-l-2 border-[#0F172A05] space-y-3 mt-1">
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-[#334155] text-white flex items-center justify-center text-[10px] font-bold">
                        {reply.authorName ? reply.authorName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111111]">{reply.authorName}</span>
                          <span className="text-[9px] text-[#64748B]">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[#334155] mt-1 whitespace-pre-wrap">{reply.content}</p>
                        {reply.userId === user?.uid && (
                          <button
                            onClick={() => handleDelete(reply.id)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 mt-1"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === c.id && (
                <form
                  onSubmit={(e) => handleSubmit(e, c.id)}
                  className="ml-11 mt-2 flex gap-2 items-center"
                >
                  <input
                    name="replyText"
                    type="text"
                    placeholder={`Responder para ${c.authorName}...`}
                    className="flex-1 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl py-2 px-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]/30"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#111111] text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-[#111111]/90"
                  >
                    Enviar
                  </button>
                </form>
              )}
            </div>
          );
        })}

        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-[#64748B]">
            <p className="text-xs">Nenhum comentário feito ainda. Comece a discussão!</p>
          </div>
        )}
      </div>
    </div>
  );
};
