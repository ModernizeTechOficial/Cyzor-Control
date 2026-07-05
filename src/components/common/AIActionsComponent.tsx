import React, { useState } from 'react';
import { Sparkles, Loader2, Bot, ChevronDown } from 'lucide-react';
import { AIActions } from '../../ai/AIEngine';
import { useAuth } from '../../context/AuthContext';

interface AIActionButtonProps {
  actionId: keyof typeof AIActions;
  entityId: string;
  variant?: 'button' | 'icon' | 'dropdown-item';
  onSuccess?: (result: string) => void;
  onError?: (error: any) => void;
  className?: string;
}

export const AIActionButton: React.FC<AIActionButtonProps> = ({ 
  actionId, 
  entityId, 
  variant = 'button',
  onSuccess,
  onError,
  className = ''
}) => {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const action = AIActions[actionId];

  if (!action) return null;

  const handleExecute = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: actionId as string,
          entityId
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao executar ação de IA');
      }

      const data = await response.json();
      const result = data.text;
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Fallback simple alert or modal (in a real app, use toast)
        console.log('AI Result:', result);
      }
    } catch (err) {
      console.error('AI Action error:', err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'dropdown-item') {
    return (
      <button 
        onClick={handleExecute}
        disabled={loading}
        className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 ${className}`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-purple-500" /> : <Sparkles className="w-4 h-4 text-purple-500" />}
        {action.label}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleExecute}
        disabled={loading}
        title={action.label}
        className={`p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors ${className}`}
      >
         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleExecute}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      <span>{action.label}</span>
    </button>
  );
};

export const AIActionDropdown: React.FC<{ entityId: string, actions: (keyof typeof AIActions)[], className?: string }> = ({ entityId, actions, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
      >
        <Bot className="w-4 h-4" />
        <span>Ações com IA</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              {actions.map((actionId) => (
                <AIActionButton 
                  key={String(actionId)} 
                  actionId={actionId} 
                  entityId={entityId} 
                  variant="dropdown-item" 
                  onSuccess={(res) => {
                    alert('Resultado da IA:\n\n' + res); // Substituir por toast/modal real
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
