import { useApp } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] bg-[rgba(30,41,59,0.95)] border border-white/10 px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-lg pointer-events-none whitespace-nowrap"
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
