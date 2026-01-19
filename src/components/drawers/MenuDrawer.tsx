import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function MenuDrawer() {
  const { activeSheet, setActiveSheet } = useApp();
  const navigate = useNavigate();
  const isOpen = activeSheet === 'menu';

  const handleNav = (path: string) => {
    navigate(path);
    setActiveSheet(null);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSheet(null)}
            className="fixed inset-0 bg-black/60 z-[2100] backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-bg-surface z-[5501] border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="h-[200px] bg-gradient-to-br from-[#1a2a40] to-[#0b1121] flex flex-col items-center justify-center border-b border-white/5 relative overflow-hidden">
              <div className="w-[80px] h-[80px] rounded-full bg-white/10 flex items-center justify-center text-4xl mb-3 shadow-inner border border-white/5">
                📚
              </div>
              <div className="font-serif font-bold text-xl text-white">NovelReader</div>
              <div className="text-xs text-[#94a3b8] mt-1">v3.0.0 • Mobile First</div>
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <div onClick={() => handleNav('/')} className="flex items-center gap-4 px-6 py-4 text-[#e2e8f0] hover:bg-white/5 cursor-pointer border-l-4 border-transparent hover:border-accent transition-colors">
                <span className="text-xl">🏠</span>
                <span className="font-semibold">Trang chủ</span>
              </div>
              
              <div onClick={() => setActiveSheet('history')} className="flex items-center gap-4 px-6 py-4 text-[#e2e8f0] hover:bg-white/5 cursor-pointer border-l-4 border-transparent hover:border-accent transition-colors">
                <span className="text-xl">🕘</span>
                <span className="font-semibold">Lịch sử đọc</span>
              </div>

              <div onClick={() => setActiveSheet('settings')} className="flex items-center gap-4 px-6 py-4 text-[#e2e8f0] hover:bg-white/5 cursor-pointer border-l-4 border-transparent hover:border-accent transition-colors">
                <span className="text-xl">⚙️</span>
                <span className="font-semibold">Cài đặt</span>
              </div>

              <div onClick={handleReload} className="flex items-center gap-4 px-6 py-4 text-[#e2e8f0] hover:bg-white/5 cursor-pointer border-l-4 border-transparent hover:border-accent transition-colors">
                <span className="text-xl">🔄</span>
                <span className="font-semibold">Tải lại trang</span>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 text-center text-xs text-[#64748b]">
              &copy; 2024 NovelReader
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
