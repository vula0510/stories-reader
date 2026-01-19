import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Chapter } from '../types';

interface ChapterRowProps {
  chapter: Chapter;
  bookId: string;
}

export default function ChapterRow({ chapter, bookId }: ChapterRowProps) {
  const navigate = useNavigate();
  const isPending = chapter.state === 'PENDING';

  const handleClick = () => {
    navigate(`/books/${bookId}/chapters/${chapter.chapterId}`);
  };

  return (
    <motion.div
      whileHover={{ x: 4, backgroundColor: 'var(--color-bg-surface-active)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`relative flex justify-between items-center p-4 rounded-xl mb-2 cursor-pointer overflow-hidden border ${
        isPending 
          ? 'bg-[var(--color-bg-surface)] border-[var(--color-warning)]/30 shadow-md' 
          : 'bg-[var(--color-bg-surface)] border-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/30'
      }`}
      style={{ transition: 'all var(--transition-base)' }}
    >
      {/* Accent indicator for pending */}
      {isPending && (
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-warning)]" 
        />
      )}
      
      <div className="flex-1 pr-4 relative z-10">
        <div className={`font-semibold text-[16px] leading-snug mb-1 ${isPending ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-main)]'}`}>
            {chapter.title}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[13px] font-medium text-[var(--color-text-sub)] bg-[var(--color-bg-highlight)]/50 px-2 py-0.5 rounded-lg">
            Chương {chapter.chapterNumber}
          </span>
          
          {chapter.updatedAt && (
             <span className="text-[12px] text-[var(--color-text-muted)]">• {new Date(chapter.updatedAt).toLocaleDateString('vi-VN')}</span>
          )}

          {isPending && (
            <motion.span 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-[10px] text-[var(--color-warning)] bg-[var(--color-warning)]/15 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-[var(--color-warning)]/30"
            >
              Chờ dịch
            </motion.span>
          )}
        </div>
      </div>

      <motion.div 
        animate={{ x: [0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className={`z-10 ${isPending ? 'text-[var(--color-warning)]' : 'text-[var(--color-accent)]/60'}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}
