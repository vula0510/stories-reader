import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import ChapterRow from '../components/ChapterRow';
import Pagination from '../components/Pagination';
import type { Chapter } from '../types';

export default function ChaptersList() {
  const { bookId } = useParams<{ bookId: string }>();
  const { setCurrentBook, setActiveSheet } = useApp();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<'all' | 'pending'>('all');
  const [sortOption, setSortOption] = useState('num_asc');

  useEffect(() => {
    if (bookId) {
      fetchChapters(1);
    }
  }, [bookId, filterState, sortOption]);

  const fetchChapters = async (page: number) => {
    if (!bookId) return;

    setLoading(true);
    let sortBy = 'chapterNumber';
    let sortOrder: 'ASC' | 'DESC' = 'ASC';

    if (sortOption === 'num_desc') sortOrder = 'DESC';
    else if (sortOption === 'time_new') {
      sortBy = 'updatedAt';
      sortOrder = 'DESC';
    } else if (sortOption === 'time_old') {
      sortBy = 'updatedAt';
      sortOrder = 'ASC';
    }

    const data = await api.getChapters(
      bookId,
      page,
      500,
      sortBy,
      sortOrder,
      filterState === 'pending' ? 'PENDING' : undefined
    );
    setLoading(false);

    if (data && data.chapters.length > 0) {
      setChapters(data.chapters);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);

      // Set current book
      const firstChapter = data.chapters[0];
      setCurrentBook({
        bookId: firstChapter.bookId,
        bookName: firstChapter.bookName,
        chapterCount: 0,
        totalTranslated: 0,
        totalPending: 0,
        createdAt: '',
      });

      // Update page title
      document.title = `${firstChapter.bookName} - Mục lục`;
    } else {
      setChapters([]);
      setTotalPages(1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchChapters(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManagePending = () => {
    setActiveSheet('translation');
    // TODO: Switch to batch_chapter tab
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-[800px] mx-auto px-3 pb-8 min-h-[90vh]">
      <div className="pt-8 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      <div className="flex items-center justify-between px-1 mb-2">
         <div className="text-text-sub text-xs font-bold uppercase tracking-wider">Danh sách chương</div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 sticky top-[60px] z-20 bg-bg-app/95 backdrop-blur py-2 -mx-2 px-2 transition-all border-b border-white/5">
        {/* Segmented Control */}
        <div className="flex bg-[var(--color-bg-surface)] p-1 rounded-2xl flex-1 shadow-inner h-12 items-center border border-white/5">
          <div
            onClick={() => setFilterState('all')}
            className={`flex-1 text-center h-10 flex items-center justify-center text-[0.9rem] font-bold rounded-xl cursor-pointer transition-all select-none ${
              filterState === 'all'
                ? 'bg-[var(--color-accent)] text-white shadow-md scale-[1.02]'
                : 'text-[var(--color-text-sub)] active:bg-white/5'
            }`}
          >
            Tất cả
          </div>
          <div
            onClick={() => setFilterState('pending')}
             className={`flex-1 text-center h-10 flex items-center justify-center text-[0.9rem] font-bold rounded-xl cursor-pointer transition-all select-none ${
               filterState === 'pending'
                 ? 'bg-[var(--color-warning)] text-[#443200] shadow-md scale-[1.02]'
                 : 'text-[var(--color-text-sub)] active:bg-white/5'
             }`}
          >
            Chưa dịch
          </div>
        </div>

        {/* Sort Button */}
        <div className="relative w-12 h-12 bg-[var(--color-bg-surface)] rounded-2xl flex items-center justify-center border border-white/5 text-[var(--color-text-sub)] flex-shrink-0 active:scale-95 transition-transform shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M7 12h10M10 18h4" />
          </svg>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="num_asc">Chương: Thấp → Cao</option>
            <option value="num_desc">Chương: Cao → Thấp</option>
            <option value="time_new">Ngày: Mới nhất</option>
            <option value="time_old">Ngày: Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Batch Action Bar */}
      {filterState === 'pending' && chapters.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-warning/10 border border-warning/30 py-4 px-4 rounded-2xl mb-4 text-warning shadow-sm"
        >
          <span className="text-sm font-bold">⚠️ Có {chapters.length} chương chưa dịch</span>
          <button
            onClick={handleManagePending}
            className="bg-warning text-[#443200] border-none font-extrabold px-5 py-2.5 rounded-xl text-xs active:scale-95 transition-transform shadow-sm"
          >
            DỊCH NHANH
          </button>
        </motion.div>
      )}

      {/* Chapter List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-sub gap-3">
             <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
             <span className="text-sm font-medium">Đang tải danh sách...</span>
          </div>
      ) : chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-sub gap-4">
           <span>Không tìm thấy chương nào.</span>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-1 pb-16"
        >
          {chapters.map((chapter) => (
            <motion.div key={chapter.chapterId} variants={item}>
              <ChapterRow chapter={chapter} bookId={bookId!} />
            </motion.div>
          ))}
          
          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
