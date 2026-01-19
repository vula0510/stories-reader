import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useLocalStorage';
import type { Replacement } from '../../types';

export default function EditWordSheet() {
  const { activeSheet, setActiveSheet, currentBook, activeChapterId, settings, updateSettings, showToast, sheetData } = useApp();
  const [words, setWords] = useState<Replacement[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'chapter' | 'book' | 'global'>('all');
  const [formData, setFormData] = useState({ id: '', original: '', replacement: '', scope: 'book' });
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const isOpen = activeSheet === 'editWord';

  useEffect(() => {
    if (isOpen && currentBook) {
      loadWords();
      
      // Auto-populate from selection if provided
      if (sheetData?.selectedText) {
        setFormData(prev => ({ ...prev, original: sheetData.selectedText }));
      }
    }
  }, [isOpen, filter, currentBook, debouncedSearch, sheetData]);

  const loadWords = async () => {
    if (!currentBook) return;
    setLoading(true);
    const data = await api.getReplacements(
      currentBook.bookId,
      activeChapterId || undefined,
      filter === 'all' ? undefined : filter,
      debouncedSearch
    );
    setWords(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.original || !formData.replacement || !currentBook) return;

    try {
      const payload = {
        original: formData.original,
        replacement: formData.replacement,
        scope: formData.scope as any,
        bookId: currentBook.bookId,
        chapterId: activeChapterId || undefined,
      };

      if (formData.id) {
        await api.updateReplacement(formData.id, payload);
        showToast('Đã cập nhật từ thay thế');
      } else {
        await api.createReplacement(payload);
        showToast('Đã thêm từ thay thế');
      }

      setFormData({ id: '', original: '', replacement: '', scope: 'book' });
      loadWords();
      // Trigger reader refresh
      window.dispatchEvent(new CustomEvent('refresh-chapter'));
    } catch (e) {
      showToast('Lỗi khi lưu');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Xóa từ thay thế này?")) return;
    try {
      await api.deleteReplacement(id);
      showToast('Đã xóa');
      loadWords();
    } catch (e) {
      showToast('Lỗi khi xóa');
    }
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-surface rounded-t-3xl z-[5501] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] pb-[env(safe-area-inset-bottom,20px)]"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <div className="text-lg font-bold">Quản lý từ thay thế</div>
              
              <div className="relative inline-block w-[50px] h-[28px] mx-4">
                <input 
                  type="checkbox" 
                  className="opacity-0 w-0 h-0 peer"
                  checked={settings.isEnabledReplaceToggle}
                  onChange={(e) => updateSettings({ isEnabledReplaceToggle: e.target.checked })}
                />
                <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#2e3a52] transition-all duration-400 rounded-[34px] peer-checked:bg-accent before:absolute before:content-[''] before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-[22px]" />
              </div>

              <div onClick={() => setActiveSheet(null)} className="p-2 cursor-pointer text-text-sub text-xl">✕</div>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="flex gap-3 mb-4 h-10">
                <input 
                  type="text" 
                  placeholder="Tìm từ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-bg-app border border-[#2e3a52] px-3 rounded-xl text-white outline-none focus:border-accent"
                />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-24 bg-bg-app border border-[#2e3a52] px-2 rounded-xl text-white outline-none focus:border-accent text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="chapter">Chapter</option>
                  <option value="book">Book</option>
                  <option value="global">Global</option>
                </select>
              </div>

              <div className="border border-[#2e3a52] rounded-xl bg-bg-app h-[200px] overflow-y-auto mb-4 p-2">
                {loading ? (
                  <div className="text-center text-[#888] py-4">Đang tải...</div>
                ) : words.length === 0 ? (
                  <div className="text-center text-[#888] py-4">Chưa có từ thay thế.</div>
                ) : (
                  words.map(w => (
                    <div 
                      key={w.id} 
                      onClick={() => setFormData({ id: w.id, original: w.original, replacement: w.replacement, scope: w.scope })}
                      className="flex justify-between items-center p-3 border-b border-[#eee]/5 last:border-none cursor-pointer hover:bg-white/5"
                    >
                      <div className="flex flex-1">
                        <span className="w-1/2 text-[#e2e8f0] font-semibold truncate pr-2">{w.original}</span>
                        <span className="w-1/2 text-accent truncate">{w.replacement}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded border-l border-accent mr-2 text-xs uppercase text-[#94a3b8]">{w.scope.charAt(0)}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }} className="text-[#94a3b8] hover:text-accent p-1">✕</button>
                    </div>
                  ))
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm text-text-sub mb-2 font-semibold">Phạm vi áp dụng</label>
                <div className="flex bg-[#151e32] p-1 rounded-[14px] border border-white/8">
                  {['chapter', 'book', 'global'].map(scope => (
                    <div
                      key={scope}
                      onClick={() => setFormData({ ...formData, scope })}
                      className={`flex-1 text-center py-2.5 px-4 text-sm font-semibold rounded-[10px] cursor-pointer transition-all capitalize ${
                        formData.scope === scope ? 'bg-accent text-white' : 'text-text-sub'
                      }`}
                    >
                      {scope}
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-t border-white/10 my-4" />

              <div className="mb-4">
                <label className="block text-sm text-text-sub mb-2 font-semibold">Thêm / Sửa từ</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Match"
                    value={formData.original}
                    onChange={(e) => setFormData({...formData, original: e.target.value})}
                    className="flex-1 bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent"
                  />
                  <input 
                    type="text" 
                    placeholder="Replacement"
                    value={formData.replacement}
                    onChange={(e) => setFormData({...formData, replacement: e.target.value})}
                    className="flex-1 bg-bg-app border border-[#2e3a52] p-2 rounded-xl text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-accent text-white p-4 border-none rounded-[14px] text-base font-bold cursor-pointer shadow-[0_4px_15px_var(--accent-glow)] active:scale-[0.98] transition-transform"
              >
                Lưu thay đổi
              </button>
              <div className="h-5" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
