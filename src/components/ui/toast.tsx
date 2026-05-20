"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  visible: boolean;
  message: string;
}

export function Toast({ visible, message }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex justify-center px-4"
        >
          <div className="max-w-[min(100%,24rem)] rounded-2xl bg-stone-800/95 px-4 py-3 text-center text-sm text-white shadow-lg backdrop-blur">
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
