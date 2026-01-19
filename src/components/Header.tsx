import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  onHistoryClick: () => void;
  onSettingsClick: () => void;
}

export default function Header({ onHistoryClick, onSettingsClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBook } = useApp();
  const [hide, setHide] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isHome = location.pathname === '/';
  const isChapters = location.pathname.includes('/chapters') && !location.pathname.match(/\/chapters\/[^/]+$/);
  const isReader = location.pathname.match(/\/chapters\/[^/]+$/);

  const getTitle = () => {
    if (isHome) return 'NovelReader';
    if (isChapters) return currentBook?.bookName || 'Mục lục';
    if (isReader && currentBook) {
      const chapterNum = location.pathname.split('/').pop();
      // Only show "Chương X" if possible, or truncate
      return `Chương ${chapterNum}`;
    }
    return 'NovelReader';
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isReader) {
        setHide(currentScrollY > lastScrollY && currentScrollY > 100);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isReader]);

  const handleBack = () => {
    if (isReader && currentBook) {
      navigate(`/books/${currentBook.bookId}/chapters`);
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[90] transition-transform duration-300 ${
        hide ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{
        height: 'calc(var(--header-h) + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="absolute inset-0 bg-[#0b1121]/92 backdrop-blur-md border-b border-white/5 shadow-lg" 
           style={{ transition: 'all var(--transition-base)' }} />
      
      <div className="relative w-full max-w-[800px] mx-auto h-full flex justify-between items-center px-4">
        <div className="flex items-center flex-1 min-w-0 gap-2">
          {!isHome && (
            <button
              onClick={handleBack}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-sub active:text-white active:bg-white/5 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          
          {isHome && (
             <div className="w-2" />
          )}

          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col cursor-pointer overflow-hidden"
          >
             <span className="text-sm font-bold text-gray-200 truncate max-w-[60vw]">
                {getTitle()}
             </span>
             {isReader && currentBook && (
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  {currentBook.bookName}
                </span>
             )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isReader && (
            <button
              onClick={onSettingsClick}
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-sub active:text-white active:bg-white/5 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M3 12h18" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}

          <button
            onClick={onHistoryClick}
             className="w-10 h-10 rounded-full flex items-center justify-center text-text-sub active:text-white active:bg-white/5 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
