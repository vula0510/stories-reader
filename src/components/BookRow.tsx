import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '../types';

interface BookRowProps {
  book: Book;
}

export default function BookRow({ book }: BookRowProps) {
  return (
    <Link
      to={`/books/${book.bookId}/chapters`}
      className="block no-underline"
    >
      <motion.div 
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-4 bg-[var(--color-bg-surface)] p-4 rounded-2xl mb-3 shadow-lg border border-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/30 hover:shadow-xl"
        style={{ transition: 'all var(--transition-base)' }}
      >
        {/* Book Cover with Gradient */}
        <motion.div 
          whileHover={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 0.5 }}
          className="w-[68px] h-[96px] bg-gradient-to-br from-[var(--color-bg-highlight)] via-[var(--color-bg-surface-active)] to-[var(--color-bg-surface)] rounded-xl flex items-center justify-center text-4xl font-serif text-[var(--color-accent)] flex-shrink-0 shadow-md border border-[var(--color-accent)]/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--color-accent)]/5 to-[var(--color-accent)]/10" />
          <span className="relative z-10 drop-shadow-lg">{book.bookName.charAt(0)}</span>
        </motion.div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col justify-center py-1">
          <div className="font-bold text-[17px] text-[var(--color-text-main)] mb-2 leading-snug line-clamp-2 tracking-tight">
            {book.bookName}
          </div>
          
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-3 text-[13px] text-[var(--color-text-sub)] font-medium">
                <span className="flex items-center gap-1.5 bg-[var(--color-bg-highlight)]/50 px-2 py-1 rounded-lg">
                  <span className="opacity-80">📖</span> {book.chapterCount || 0}
                </span>
                <span className="flex items-center gap-1.5 bg-[var(--color-success)]/20 text-[var(--color-success)] px-2 py-1 rounded-lg">
                  <span>✓</span> {book.totalTranslated || 0}
                </span>
             </div>
             
             {book.createdAt && (
               <div className="text-[12px] text-[var(--color-text-muted)]">
                 Cập nhật: {new Date(book.createdAt).toLocaleDateString('vi-VN')}
               </div>
             )}
          </div>
        </div>
        
        {/* Chevron with Animation */}
        <motion.div 
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-[var(--color-accent)]/60 pl-1"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
        </motion.div>
      </motion.div>
    </Link>
  );
}
