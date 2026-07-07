import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioLines } from 'lucide-react';
import { showSuccess, showError } from '../lib/alerts';
import { useAuth } from '../context/AuthContext';

export default function GlobalVoiceActivator() {
  const [isActive, setIsActive] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const isWakeWordMode = useRef(true);
  const spokenTextRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const { activeWorkspace, dbUser } = useAuth();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const currentTranscript = (finalTranscript + interimTranscript).toLowerCase();
      
      let remainder = currentTranscript;
      // Check for variations of the pronunciation "cybot"
      const wakeWords = ['cybot', 'saibot', 'cibot', 'cy bot', 'sai bot', 'seibot'];
      let lastIdx = -1;
      let wakeWord = '';
      
      for (const word of wakeWords) {
        const idx = currentTranscript.lastIndexOf(word);
        if (idx > lastIdx) {
          lastIdx = idx;
          wakeWord = word;
        }
      }
      
      if (lastIdx !== -1) {
         remainder = currentTranscript.substring(lastIdx + wakeWord.length).trim();
      }

      if (isWakeWordMode.current) {
        if (lastIdx !== -1) {
          isWakeWordMode.current = false;
          setIsActive(true);
          
          setSpokenText(remainder);
          spokenTextRef.current = remainder;
          
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (spokenTextRef.current.trim()) {
              recognition.stop();
            } else {
               isWakeWordMode.current = true;
               setIsActive(false);
               recognition.stop(); // to clear buffer
            }
          }, 3500); // 3.5s to start speaking command
        }
      } else {
         setSpokenText(remainder);
         spokenTextRef.current = remainder;
         
         // Silence detection for end of command
         if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
         
         silenceTimerRef.current = setTimeout(() => {
           if (spokenTextRef.current.trim()) {
             recognition.stop(); 
           } else {
             isWakeWordMode.current = true;
             setIsActive(false);
             recognition.stop();
           }
         }, 2500); // 2.5s of silence means command is done
      }
    };

    let hasPermissionError = false;

    recognition.onerror = (event: any) => {
       if (event.error === 'not-allowed') {
          hasPermissionError = true;
          console.error("Microphone access denied for wake word.");
       }
    };

    recognition.onend = () => {
      if (!isWakeWordMode.current) {
        // We were recording a command and it ended
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (spokenTextRef.current.trim()) {
           handleCommand(spokenTextRef.current);
        }
        isWakeWordMode.current = true;
        setIsActive(false);
      }
      
      // Auto restart to keep listening for wake word or next command
      if (!hasPermissionError) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {}
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {}

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleCommand = async (text: string) => {
    if (!text.trim()) return;
    showSuccess(`Comando reconhecido...`);
    
    // Dispara evento para abrir o chat se estiver fechado
    window.dispatchEvent(new CustomEvent('open-cyzor-chat'));
    
    // Espera um instante para o chat renderizar e se inscrever
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('voice-command-received', { detail: { text } }));
    }, 500);
  };

  if (!isSupported) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 scale-150 duration-1000"></div>
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-40 scale-110"></div>
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_60px_rgba(37,99,235,0.5)]">
                <AudioLines size={64} className="text-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3 max-w-2xl text-center px-6">
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">Cyzor está ouvindo...</h2>
              <p className="text-xl sm:text-2xl text-blue-200 font-medium min-h-12 mt-4 italic">
                {spokenText ? `"${spokenText}"` : "Diga o que você precisa..."}
              </p>
            </div>
            
            <button 
              onClick={() => {
                isWakeWordMode.current = true;
                setIsActive(false);
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                if (recognitionRef.current) recognitionRef.current.stop();
              }}
              className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold tracking-widest uppercase transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
