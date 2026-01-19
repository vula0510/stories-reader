import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useLocalStorage';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import BookRow from '../components/BookRow';
import Pagination from '../components/Pagination';
import type { Book } from '../types';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 600);

  useEffect(() => {
    fetchBooks(1, debouncedSearch);
  }, [debouncedSearch]);

  const fetchBooks = async (page: number, search: string) => {
    setLoading(true);
    const data = await api.getBooks(page, 1000, search);
    setLoading(false);

    if (data && data.data.length > 0) {
      setBooks(data.data);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
    } else {
      setBooks([]);
      setTotalPages(1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBooks(page, debouncedSearch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[90vh]">
      {/* Search Area */}
      <div className="sticky top-[60px] z-[80] px-3 py-2 bg-bg-app/95 backdrop-blur-sm transition-transform pb-4">
        <div className="relative max-w-[800px] mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none text-lg">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm truyện..."
            className="w-full bg-[var(--color-bg-surface)]/80 border border-white/5 py-3.5 px-4 pl-12 rounded-2xl text-[var(--color-text-main)] font-sans text-[16px] outline-none transition-all focus:border-[var(--color-accent)]/50 focus:bg-[var(--color-bg-surface-active)] shadow-sm placeholder-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Book List */}
      <div className="max-w-[800px] mx-auto px-3 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-sub gap-3">
             <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
             <span className="text-sm font-medium">Đang tải thư viện...</span>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-sub gap-4">
             <span className="text-4xl">📚</span>
             <span>Không tìm thấy truyện nào.</span>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3 mt-2"
          >
            {books.map((book) => (
              <motion.div key={book.bookId} variants={item}>
                <BookRow book={book} />
              </motion.div>
            ))}
            
            <div className="mt-4 pb-12">
               <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
