import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            {/* Backdrop */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            {/* Content Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <DialogPrimitive.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative w-full max-w-lg rounded-2xl border border-border-primary bg-bg-card p-6 shadow-2xl focus:outline-none glass-panel"
                >
                  {/* Close Button */}
                  <DialogPrimitive.Close asChild>
                    <button
                      className="absolute right-4 top-4 rounded-full p-1 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DialogPrimitive.Close>

                  {/* Header */}
                  {(title || description) && (
                    <div className="flex flex-col space-y-1.5 text-left mb-4 pr-6">
                      {title && (
                        <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-text-primary">
                          {title}
                        </DialogPrimitive.Title>
                      )}
                      {description && (
                        <DialogPrimitive.Description className="text-sm text-text-secondary">
                          {description}
                        </DialogPrimitive.Description>
                      )}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="mt-2">{children}</div>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};
