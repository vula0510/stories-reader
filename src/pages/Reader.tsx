import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useApp } from '../contexts/AppContext';
import SelectionTooltip from '../components/SelectionTooltip';
import type { ChapterDetail } from '../types';

export default function Reader() {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { settings, saveProgress, getProgress, addHistory, currentBook, setCurrentBook, activeChapterId, setActiveChapterId, setNavigation } = useApp();
  const [chapters, setChapters] = useState<Map<string, ChapterDetail>>(new Map());
  const [loadedChapterIds, setLoadedChapterIds] = useState<string[]>([]);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load initial chapter
  useEffect(() => {
    if (chapterId) {
      loadChapter(chapterId, true);
      setActiveChapterId(chapterId);
    }
  }, [chapterId]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cid = entry.target.getAttribute('data-cid');
            if (cid) {
              setActiveChapterId(cid);
              
              // Update local and global navigation based on active chapter
              const chapterData = chapters.get(cid);
              if (chapterData) {
                 const prev = chapterData.navigation?.prev?.chapterId || null;
                 const next = chapterData.navigation?.next?.chapterId || null;
                 
                 setPrevChapterId(prev);
                 setNextChapterId(next);
                 
                 setNavigation({ prevId: prev, nextId: next });

                  // Update URL silently to match scroll position
                 window.history.replaceState(null, '', `/books/${currentBook?.bookId}/chapters/${cid}`);
                 
                 // Update history
                 if (currentBook) {
                    addHistory({
                      bid: currentBook.bookId,
                      bname: currentBook.bookName,
                      cid: cid,
                      cnum: chapterData.chapterNumber,
                      scrollPos: 0,
                    });
                 }
              }
            }
          }
        });
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [chapters, currentBook]);

  // Listen for navigation events from GlassDock
  useEffect(() => {
    const onPrev = () => handlePrevChapter();
    const onNext = () => handleNextChapter();
    
    window.addEventListener('nav-prev-chapter', onPrev);
    window.addEventListener('nav-next-chapter', onNext);
    
    return () => {
      window.removeEventListener('nav-prev-chapter', onPrev);
      window.removeEventListener('nav-next-chapter', onNext);
    };
  }, [prevChapterId, nextChapterId]);

  const loadChapter = useCallback(async (cid: string, isInitial: boolean, force = false) => {
    if ((loadedChapterIds.includes(cid) && !force) || loading) return;

    setLoading(true);
    // console.log('Loading chapter:', cid);
    const data = await api.getChapter(cid, settings.groupLines, settings.isEnabledReplaceToggle);
    setLoading(false);

    if (data && data.chapter) {
      const chapter = data.chapter;
      // Merge navigation from response root into chapter object
      if (data.navigation) {
        chapter.navigation = data.navigation;
      }

      console.log(`[Reader] Loaded '${chapter.title}' (ID: ${cid})`);
      console.log(`[Reader] Nav Info:`, chapter.navigation);
      
      setChapters((prev) => new Map(prev).set(cid, chapter));
      
      if (isInitial) {
        // If initial load (navigation), replace the view
        setLoadedChapterIds([cid]);
        
        const prevId = chapter.navigation?.prev?.chapterId || null;
        const nextId = chapter.navigation?.next?.chapterId || null;
        
        console.log(`[Reader] Initial Set Navigation: Prev=${prevId}, Next=${nextId}`);
        setPrevChapterId(prevId);
        setNextChapterId(nextId);
        
        // Update global navigation state
        setNavigation({ prevId, nextId });
        
        // Restore scroll position
        setTimeout(() => {
          const savedOffset = getProgress(cid);
          const chapterEl = document.getElementById(`chap-${cid}`);
          if (chapterEl && savedOffset > 0) {
            window.scrollTo({ top: chapterEl.offsetTop + savedOffset, behavior: 'auto' });
          } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        }, 100);

        // Update document title
        document.title = `${chapter.bookName} - C${chapter.chapterNumber}`;

        // Ensure currentBook is set
        setCurrentBook({
          bookId: chapter.bookId,
          bookName: chapter.bookName,
          chapterCount: 0,
          totalTranslated: 0,
          totalPending: 0,
          createdAt: new Date().toISOString()
        });
      } else {
        // If lazy load, append with limit
        setLoadedChapterIds((prev) => {
             if (prev.includes(cid)) return prev;
             
             // Max 3 chapters if lazy load is on, otherwise 1
             const limit = settings.lazyLoad ? 3 : 1;
             
             const newList = [...prev, cid];
             if (newList.length > limit) {
                 // Warning: removing from top might cause scroll jumps. 
                 // Simple implementation as requested.
                 return newList.slice(newList.length - limit);
             }
             return newList;
        });

        // Update next chapter ID from the LATEST loaded chapter
        if (chapter.navigation?.next?.chapterId) {
             // We don't forcefully setNextChapterId for the GLOBAL state here,
             // because the user might still be reading the previous one.
             // But we allow lazy load chain.
             // If we just loaded the "Next" chapter, we probably want to ensure 
             // we know what comes after IT for subsequent lazy loads.
        }
      }

      // Observe the chapter element
      setTimeout(() => {
        const el = document.getElementById(`chap-${cid}`);
        if (el && observerRef.current) {
          observerRef.current.observe(el);
        }
      }, 100);
    }
  }, [loadedChapterIds, loading, settings, getProgress, setCurrentBook, setNavigation]);

  // Listen for refresh requests
  useEffect(() => {
    const handleRefresh = () => {
      if (activeChapterId) loadChapter(activeChapterId, false, true);
    };
    window.addEventListener('refresh-chapter', handleRefresh);
    return () => window.removeEventListener('refresh-chapter', handleRefresh);
  }, [activeChapterId, loadChapter]);

  // Reload when groupLines setting changes
  useEffect(() => {
    if (activeChapterId) {
      // 1. Reset loaded chapters list to just the current one to force others to re-fetch
      setLoadedChapterIds([activeChapterId]);
      
      // 2. Clear current chapter data from map to ensure fresh fetch (optional but safer)
      setChapters(prev => {
          const newMap = new Map(prev);
          newMap.delete(activeChapterId);
          return newMap;
      });

      // 3. Force reload
      loadChapter(activeChapterId, true, true);
    }
  }, [settings.groupLines]);

  // Handle scroll for progress tracking and lazy loading
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Update progress bar
      const progressBar = document.getElementById('readProgress');
      if (progressBar) {
        progressBar.style.width = totalHeight > 0 ? `${(scrollY / totalHeight) * 100}%` : '0%';
      }

      // Save progress for active chapter
      if (chapterId) {
        const chapterEl = document.getElementById(`chap-${chapterId}`);
        if (chapterEl) {
          const offset = scrollY - chapterEl.offsetTop;
          saveProgress(chapterId, offset);
        }
      }

      // Lazy load next chapter
      if (settings.lazyLoad && !loading && nextChapterId && totalHeight - scrollY < 1500) {
        loadChapter(nextChapterId, false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadChapter, nextChapterId, loading, settings.lazyLoad]); // Included loadChapter

  const handlePrevChapter = () => {
    if (prevChapterId) {
        // Always navigate for prev to clear view
        navigate(`/books/${bookId}/chapters/${prevChapterId}`);
    }
  };

  const handleNextChapter = () => {
    if (nextChapterId) {
       // Always navigate for next to clear view
       navigate(`/books/${bookId}/chapters/${nextChapterId}`);
    }
  };

  return (
    <div className="reader-view bg-bg-app min-h-screen">
      <SelectionTooltip />
      <div ref={containerRef} className="max-w-[700px] mx-auto px-0 relative">
        {loadedChapterIds.map((cid, index) => {
          const chapter = chapters.get(cid);
          if (!chapter) return null;

          const isFirst = index === 0;
          const content = chapter.content.filter((t) => t.trim()).map((t, i) => (
            <section key={i} dangerouslySetInnerHTML={{ __html: t }} />
          ));

          return (
            <div
              key={cid}
              id={`chap-${cid}`}
              data-cid={cid}
              className="chapter-block px-6 py-6 min-h-[60vh] relative animate-fadeIn max-w-[800px] mx-auto"
            >
              {isFirst ? (
                <div className="text-center mb-4">
                  <h5 className="font-serif text-accent mb-1 font-bold text-lg">{chapter.title}</h5>
                </div>
              ) : (
                <div className="my-12 py-4 border-t border-b border-accent/20 text-accent font-bold text-xs text-center font-sans uppercase tracking-wider">
                  Chương {chapter.chapterNumber}: {chapter.title}
                </div>
              )}
              <div className="reader-content text-[var(--color-text-main)]" style={{
                  fontFamily: settings.fontFamily || 'var(--font-serif)',
                  fontSize: `${settings.fontSize || 18}px`,
                  lineHeight: settings.lineHeight || 1.8,
                  textAlign: settings.textAlign as any || 'justify',
                  wordSpacing: `${settings.wordSpacing}px`
              }}>
                 {content}
              </div>
            </div>
          );
        })}

        <style>{`
          .reader-content p {
            margin-bottom: 1.5em;
            text-align: justify;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          .reader-content p:empty {
            display: none;
          }
        `}</style>

        {loading && (
          <div className="text-center py-12 text-accent animate-fadeIn">
            <div>✦ Đang tải chương tiếp...</div>
          </div>
        )}
      </div>
    </div>
  );
}
