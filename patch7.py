with open('src/components/home/HomeIntelligence.tsx', 'r') as f:
    content = f.read()

import_target = "import { Sparkles, Mic, Paperclip, Globe, Send, ArrowRight, User, Bot, AlertCircle } from 'lucide-react';"
import_replacement = "import { Sparkles, Mic, Paperclip, Globe, Send, ArrowRight, User, Bot, AlertCircle, Volume2, VolumeX } from 'lucide-react';"

if import_target in content:
    content = content.replace(import_target, import_replacement)

state_target = "  const [messages, setMessages] = useState<Message[]>([]);"
state_replacement = """  const [messages, setMessages] = useState<Message[]>([]);
  const [isMuted, setIsMuted] = useState(false);"""

if state_target in content:
    content = content.replace(state_target, state_replacement)

speak_target = """  const handleSend = async (textToSend: string) => {"""
speak_replacement = """  const speakText = (text: string) => {
    if (isMuted) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Remove markdown symbols for better speech
    const cleanText = text.replace(/[#*_~`]/g, '').replace(/\\[(.*?)\\]\\(.*?\\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; // Slightly faster for natural feel
    
    // Attempt to select a better Portuguese voice if available (e.g., Google PT-BR)
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-BR' && v.name.includes('Google')) || 
                    voices.find(v => v.lang === 'pt-BR');
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded (Chrome sometimes needs a trigger)
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const handleSend = async (textToSend: string) => {"""

if speak_target in content:
    content = content.replace(speak_target, speak_replacement)

send_target = """        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {"""
send_replacement = """        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        speakText(data.message);
      } else {"""

if send_target in content:
    content = content.replace(send_target, send_replacement)


ui_target = """<div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Copilot</span>"""
ui_replacement = """<div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) window.speechSynthesis.cancel();
            }}
            className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-slate-100 transition-all"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <span className="hidden sm:inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Copilot</span>"""

if ui_target in content:
    content = content.replace(ui_target, ui_replacement)


with open('src/components/home/HomeIntelligence.tsx', 'w') as f:
    f.write(content)
