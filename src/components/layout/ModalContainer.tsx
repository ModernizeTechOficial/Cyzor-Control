import { motion, AnimatePresence } from 'motion/react';
import React from 'react';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

export default function ModalContainer({ isOpen, onClose, children, maxWidth = "max-w-xl", maxHeight = "max-h-[90vh]" }: ModalContainerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111111]/30 backdrop-blur-xs"
          />

          {/* Modal Box */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className={`bg-white border border-[#0F172A0F] rounded-[24px] shadow-2xl ${maxWidth} w-full z-10 overflow-hidden flex flex-col ${maxHeight}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
