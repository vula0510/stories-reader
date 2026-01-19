import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function HistoryDrawer() {
  const { activeSheet, setActiveSheet, history, clearHistory } = useApp();
  const navigate = useNavigate();
  const isOpen = activeSheet === 'history';

  const handleItemClick = (bookId: string, chapterId: string) => {
    navigate(`/books/${bookId}/chapters/${chapterId}`);
    setActiveSheet(null);
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
            className="fixed top-0 left-0 bottom-0 w-[300px] bg-bg-surface z-[5501] border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#151e32]">
              <div className="text-lg font-bold pl-2">Lịch sử đọc</div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-accent border border-accent/30 px-2 py-1 rounded hover:bg-accent hover:text-white transition-colors"
                >
                  Xóa hết
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {history.length === 0 ? (
                <div className="text-center text-[#888] py-8">Chưa có lịch sử đọc.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map((item, index) => (
                    <div 
                      key={`${item.bid}-${item.cid}-${index}`}
                      onClick={() => handleItemClick(item.bid, item.cid)}
                      className="bg-bg-app border border-[#2e3a52] p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-all hover:border-white/20"
                    >
                       <div className="font-bold text-[#e2e8f0] text-sm mb-1 line-clamp-2">{item.bname}</div>
                       <div className="text-xs text-accent">Đang đọc: Chương {item.cnum}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
