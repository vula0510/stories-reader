import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

export default function SelectionTooltip() {
  const { setActiveSheet, activeChapterId, currentBook, showToast } = useApp();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setPosition(null);
        return;
      }

      // Check if selection is within reader-text check is complicated if layers vary.
      // But we can just check if the anchor node is within a .reader-text element.
      const anchorNode = selection.anchorNode;
      const parentElement = anchorNode?.parentElement;
      if (!parentElement?.closest('.reader-text')) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const scrollTop = window.scrollY;

      // Position tooltip above the selection
      setPosition({
        top: rect.top + scrollTop - 45, // 45px above
        left: rect.left + rect.width / 2,
      });
      setSelectedText(text);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    // Also Close on scroll to prevent floating weirdly? 
    // Usually mobile browsers handle selection handles on scroll, but custom tooltip might lag.
    // Let's hide on scroll.
    const handleScroll = () => {
        if (position) setPosition(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [position]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveSheet('editWord', { selectedText });
    setPosition(null);
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const type = prompt('Loại lỗi:\n1: Chính tả\n2: Dịch sai\n3: Thiếu nội dung', '1');
    if (!type || !currentBook || !activeChapterId) return;

    try {
      await api.reportUpdate(currentBook.bookId, {
        originalText: selectedText,
        newText: '', // Not needed for report only? Original app used it. 
        // Original logic: originalText: o, newText: n (empty?), chapterId, errorType.
        // Wait, original app passed 'newText' only if user edited it? 
        // Logic: submitReport(original, newText, type)
        // If it's a report (not replacement), replacement might be N/A.
        // Let's pass empty for now.
        chapterId: activeChapterId,
        errorType: type
      });
      showToast('Đã gửi báo cáo lỗi');
      setPosition(null);
      window.dispatchEvent(new CustomEvent('refresh-chapter'));
    } catch (e) {
      showToast('Lỗi khi gửi báo cáo');
    }
  };

  if (!position) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] flex gap-1 bg-[#1e293b] rounded-lg shadow-xl p-1 border border-white/10 transform -translate-x-1/2 animate-popIn"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <button
        onClick={handleEdit}
        className="px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
      >
        Sửa từ
      </button>
      <div className="w-[1px] bg-white/10 my-1" />
      <button
        onClick={handleReport}
        className="px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent/10 rounded-md transition-colors whitespace-nowrap"
      >
        Báo lỗi
      </button>
    </div>
  );
}
