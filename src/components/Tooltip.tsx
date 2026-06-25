import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ children, content, position = 'bottom', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: position === 'bottom' ? 5 : -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'bottom' ? 2 : -2, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${position === 'bottom' ? 'top-full mt-2.5' : 'bottom-full mb-2.5'} left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl`}
          >
            {content}
            <div className={`absolute ${position === 'bottom' ? 'bottom-full border-b-slate-800' : 'top-full border-t-slate-800'} left-1/2 -translate-x-1/2 border-4 border-transparent`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
