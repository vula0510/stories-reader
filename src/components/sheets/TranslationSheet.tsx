import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import ConfirmModal from '../modals/ConfirmModal';
import { useDebounce } from '../../hooks/useLocalStorage';
import type { Book, Chapter } from '../../types';

export default function TranslationSheet() {
  const {
    activeSheet,
    setActiveSheet,
    transOptions,
    updateTransOptions,
    currentBook,
    activeChapterId,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'current' | 'batch_chapter' | 'story'>('current');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  // Selection state
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  
  // Search state
  const [bookSearch, setBookSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  const debouncedBookSearch = useDebounce(bookSearch, 300);
  const debouncedChapterSearch = useDebounce(chapterSearch, 300);

  // Batch loading state
  const [batchMode, setBatchMode] = useState<'all' | 'pending'>('all');
  const [batchLimit, setBatchLimit] = useState(50000);

  // Confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    details: { label: string; value: string }[];
    listItems: string[];
    payload: any;
  } | null>(null);

  const isOpen = activeSheet === 'translation';

  // Load books when tab is story
  useEffect(() => {
    if (activeTab === 'story' && isOpen) {
      loadBooks();
    }
  }, [activeTab, isOpen, debouncedBookSearch]);

  // Load batch chapters
  useEffect(() => {
    if (activeTab === 'batch_chapter' && isOpen && currentBook) {
      loadBatchChapters();
    }
  }, [activeTab, isOpen, batchMode, batchLimit]);

  // Set initial tab based on context
  useEffect(() => {
    if (isOpen) {
      if (currentBook) setActiveTab('current');
      else setActiveTab('story');
    }
  }, [isOpen, currentBook]);

  const loadBooks = async () => {
    const data = await api.getBooks(1, 1000, debouncedBookSearch);
    if (data) setBooks(data.data);
  };

  const loadBatchChapters = async () => {
    if (!currentBook) return;
    const data = await api.getChapters(
      currentBook.bookId,
      1,
      batchLimit,
      'chapterNumber',
      'ASC',
      batchMode === 'pending' ? 'PENDING' : undefined
    );
    if (data) {
      setChapters(data.chapters);
      // Auto-select all by default for convenience
      setSelectedChapters(new Set(data.chapters.map(c => c.chapterId)));
    }
  };

  const handleSubmit = async () => {
    const commonOpts = {
      model: transOptions.model,
      minWords: transOptions.minWords,
      maxWords: transOptions.maxWords,
      temperature: transOptions.temperature,
      retryTranslate: transOptions.scope,
    };

    if (activeTab === 'current') {
      if (!currentBook || !activeChapterId) {
        showToast('Chưa mở chương nào');
        return;
      }

      setLoading(true);
      try {
        const result = await api.translate({
          mode: 'current',
          bookId: currentBook.bookId,
          chapterId: [activeChapterId],
          ...commonOpts,
        });

        if (!result) throw new Error('Không nhận được phản hồi từ server');

        const chapterResult = result[activeChapterId];
        if (chapterResult?.chapter?.state === 'FAILED') {
          throw new Error('Dịch thất bại. Vui lòng thử lại.');
        }

        const tokens = chapterResult?.chapter?.totalTokens || 0;
        showToast(`Dịch thành công: ${tokens} tokens`);
        setActiveSheet(null);
        window.location.reload(); 
      } catch (e) {
        showToast('Lỗi khi dịch: ' + (e as Error).message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Prepare confirmation for batch
    let items: string[] = [];
    let payload: any = { ...commonOpts, mode: activeTab };

    if (activeTab === 'story') {
      if (selectedBooks.size === 0) {
        showToast('Vui lòng chọn ít nhất 1 truyện');
        return;
      }
      const selected = books.filter(b => selectedBooks.has(b.bookId));
      items = selected.map(b => b.bookName);
      payload.bookId = Array.from(selectedBooks);
      payload.currentChapterId = activeChapterId || undefined;
    } else {
      if (selectedChapters.size === 0) {
        showToast('Vui lòng chọn ít nhất 1 chương');
        return;
      }
      const selected = chapters.filter(c => selectedChapters.has(c.chapterId));
      items = selected.map(c => `Chương ${c.chapterNumber}: ${c.title}`);
      payload.bookId = currentBook?.bookId;
      payload.chapterId = Array.from(selectedChapters);
      payload.currentChapterId = activeChapterId || undefined;
    }

    setConfirmData({
      title: activeTab === 'story' ? 'Dịch Truyện (Batch)' : 'Dịch Chương (Batch)',
      details: [
        { label: 'Model', value: transOptions.model },
        { label: 'Phạm vi', value: transOptions.scope ? 'Dịch lại toàn bộ' : 'Chỉ dịch phần lỗi/thiếu' },
        { label: 'Batch Size', value: `${transOptions.minWords} - ${transOptions.maxWords} từ` },
        { label: 'Số lượng', value: `${items.length} mục` },
      ],
      listItems: items,
      payload,
    });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!confirmData) return;
    setLoading(true);
    try {
      const result = await api.translate(confirmData.payload);
      
      if (!result) throw new Error('Không nhận được phản hồi từ server');
      
      // For batch, we implicitly trust success if API returns 200, 
      // as individual failures might not block the whole batch request or depend on async processing?
      // Actually standard API behavior for batch usually returns 200.
      
      showToast('Đã gửi yêu cầu dịch thành công!');
      setShowConfirm(false);
      setActiveSheet(null);
    } catch (e) {
      showToast('Có lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBatchRange = () => {
    const startStr = prompt('Từ chương số:', '1');
    const endStr = prompt('Đến chương số:', '');
    if (!startStr || !endStr) return;
    
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    
    if (!isNaN(start) && !isNaN(end)) {
      const newSelected = new Set(selectedChapters);
      let count = 0;
      chapters.forEach(c => {
        if (c.chapterNumber >= start && c.chapterNumber <= end) {
          newSelected.add(c.chapterId);
          count++;
        }
      });
      setSelectedChapters(newSelected);
      showToast(`Đã chọn ${count} chương`);
    }
  };

  return (
    <>
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-bg-surface rounded-t-3xl z-[5501] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] pb-[env(safe-area-inset-bottom,20px)]"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <div className="text-lg font-bold">Cấu hình Dịch AI</div>
                <div onClick={() => setActiveSheet(null)} className="p-2 cursor-pointer text-text-sub text-xl">✕</div>
              </div>

              <div className="p-5 overflow-y-auto">
                {/* Tabs */}
                <div className="flex bg-bg-app rounded-xl p-1 mb-4 border border-[#2e3a52]">
                  {[
                    { id: 'current', label: 'Hiện tại' },
                    { id: 'batch_chapter', label: 'Nhiều chương' },
                    { id: 'story', label: 'Truyện' },
                  ].map((tab) => (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 text-center py-2.5 px-2 text-sm font-semibold rounded-lg cursor-pointer transition-colors ${
                        activeTab === tab.id ? 'bg-[#2e3a52] text-white' : 'text-text-sub'
                      }`}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'current' && (
                   <div className="text-center py-2.5 text-accent font-semibold mb-2.5">
                     {activeChapterId ? 'Dịch và đọc ngay chương đang mở' : 'Hãy mở một chương để dịch'}
                   </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm text-text-sub mb-2 font-semibold">Chọn Model AI</label>
                  <select
                    value={transOptions.model}
                    onChange={(e) => updateTransOptions({ model: e.target.value })}
                    className="w-full bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent"
                  >
                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  </select>
                </div>

                {activeTab === 'batch_chapter' && (
                  <div className="mb-4">
                     <label className="block text-sm text-text-sub mb-2 font-semibold">Cấu hình tải danh sách</label>
                     <div className="flex gap-2.5 mb-4">
                        <select 
                          value={batchMode}
                          onChange={(e) => setBatchMode(e.target.value as any)}
                          className="flex-1 bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent"
                        >
                          <option value="all">Tất cả chương</option>
                          <option value="pending">Chương chưa dịch</option>
                        </select>
                        <input 
                          type="number" 
                          value={batchLimit}
                          onChange={(e) => setBatchLimit(Number(e.target.value))}
                          className="w-20 bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent text-center"
                        />
                     </div>

                     <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-text-sub font-semibold">Danh sách chương</label>
                        <div className="flex gap-2">
                           <span onClick={() => setSelectedChapters(new Set(chapters.map(c => c.chapterId)))} className="bg-accent/15 text-accent px-2 py-0.5 rounded-md text-[0.7rem] font-bold cursor-pointer">Tất cả</span>
                           <span onClick={handleSelectBatchRange} className="bg-[#2ecc71]/15 text-[#2ecc71] px-2 py-0.5 rounded-md text-[0.7rem] font-bold cursor-pointer">Phạm vi</span>
                           <span onClick={() => setSelectedChapters(new Set())} className="bg-white/10 text-[#ccc] px-2 py-0.5 rounded-md text-[0.7rem] font-bold cursor-pointer">Bỏ</span>
                        </div>
                     </div>

                     <div className="bg-bg-app border border-[#2e3a52] rounded-xl overflow-hidden max-h-[250px] flex flex-col">
                        <input 
                          type="text"
                          placeholder="Lọc trong danh sách..."
                          value={chapterSearch}
                          onChange={(e) => setChapterSearch(e.target.value)}
                          className="w-full bg-[#0f1629] border-none border-b border-[#2e3a52] p-3 text-white outline-none text-sm"
                        />
                        <div className="overflow-y-auto flex-1 p-2">
                           {chapters
                             .filter(c => c.title.toLowerCase().includes(debouncedChapterSearch.toLowerCase()))
                             .map(c => (
                             <label key={c.chapterId} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={selectedChapters.has(c.chapterId)}
                                  onChange={(e) => {
                                    const newSet = new Set(selectedChapters);
                                    if(e.target.checked) newSet.add(c.chapterId);
                                    else newSet.delete(c.chapterId);
                                    setSelectedChapters(newSet);
                                  }}
                                  className="w-[18px] h-[18px] accent-accent"
                                />
                                <span className="text-sm text-[#e2e8f0] flex-1 truncate">
                                  Chương {c.chapterNumber}: {c.title}
                                </span>
                                {c.state === 'PENDING' && <span className="text-[0.65rem] text-warning italic">Pending</span>}
                             </label>
                           ))}
                           {chapters.length === 0 && <div className="text-center text-[#888] py-2">Không có dữ liệu</div>}
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'story' && (
                  <div className="mb-4">
                     <label className="block text-sm text-text-sub mb-2 font-semibold">Chọn truyện cần dịch</label>
                     <div className="bg-bg-app border border-[#2e3a52] rounded-xl overflow-hidden max-h-[250px] flex flex-col">
                        <input 
                          type="text"
                          placeholder="Tìm tên truyện..."
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          className="w-full bg-[#0f1629] border-none border-b border-[#2e3a52] p-3 text-white outline-none text-sm"
                        />
                        <div className="overflow-y-auto flex-1 p-2">
                           {books.map(b => (
                             <label key={b.bookId} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={selectedBooks.has(b.bookId)}
                                  onChange={(e) => {
                                    const newSet = new Set(selectedBooks);
                                    if(e.target.checked) newSet.add(b.bookId);
                                    else newSet.delete(b.bookId);
                                    setSelectedBooks(newSet);
                                  }}
                                  className="w-[18px] h-[18px] accent-accent"
                                />
                                <span className="text-sm text-[#e2e8f0] flex-1 truncate">{b.bookName}</span>
                             </label>
                           ))}
                           {books.length === 0 && <div className="text-center text-[#888] py-2">Đang tải...</div>}
                        </div>
                     </div>
                  </div>
                )}

                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm text-text-sub mb-2 font-semibold">Min Words</label>
                    <input 
                      type="number"
                      value={transOptions.minWords}
                      onChange={(e) => updateTransOptions({ minWords: Number(e.target.value) })}
                      className="w-full bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-text-sub mb-2 font-semibold">Max Words</label>
                    <input 
                      type="number"
                      value={transOptions.maxWords}
                      onChange={(e) => updateTransOptions({ maxWords: Number(e.target.value) })}
                      className="w-full bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-text-sub mb-2 font-semibold">Temp</label>
                    <input 
                      type="number" step="0.1" min="0" max="1"
                      value={transOptions.temperature}
                      onChange={(e) => updateTransOptions({ temperature: Number(e.target.value) })}
                      className="w-full bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <label className="text-sm text-text-sub font-semibold">Dịch lại tất cả (kể cả đã thành công)</label>
                  <div className="relative inline-block w-[50px] h-[28px]">
                    <input 
                      type="checkbox" 
                      className="opacity-0 w-0 h-0 peer"
                      checked={transOptions.scope}
                      onChange={(e) => updateTransOptions({ scope: e.target.checked })}
                    />
                    <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#2e3a52] transition-all duration-400 rounded-[34px] peer-checked:bg-accent before:absolute before:content-[''] before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-[22px]" />
                  </div>
                </div>
                <div className="text-xs text-[#64748b] -mt-1 mb-5">Tắt: Chỉ dịch phần thất bại • Bật: Dịch lại toàn bộ</div>

                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full bg-accent text-white p-4 border-none rounded-[14px] text-base font-bold cursor-pointer shadow-[0_4px_15px_var(--accent-glow)] active:scale-[0.98] transition-transform disabled:opacity-70"
                >
                  {loading ? 'Đang xử lý...' : activeTab === 'current' ? 'Bắt đầu dịch' : 'Tiếp tục'}
                </button>
                <div className="h-5" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        isLoading={loading}
        title={confirmData?.title || ''}
        details={confirmData?.details || []}
        listItems={confirmData?.listItems || []}
      />
    </>
  );
}
