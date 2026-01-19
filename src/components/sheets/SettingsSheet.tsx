import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';

export default function SettingsSheet() {
  const { activeSheet, setActiveSheet, settings, updateSettings } = useApp();
  const isOpen = activeSheet === 'settings';

  const fonts = [
    { name: 'Serif', value: "'Merriweather', serif" },
    { name: 'Sans', value: "'Quicksand', sans-serif" },
    { name: 'Viết tay', value: "'Patrick Hand', cursive" },
  ];

  const updateFontSize = (delta: number) => {
    let s = settings.fontSize + delta;
    if (s < 14) s = 14;
    if (s > 28) s = 28;
    updateSettings({ fontSize: s });
  };

  const updateWordSpacing = (delta: number) => {
    let s = settings.wordSpacing + delta;
    if (s < 0) s = 0;
    if (s > 10) s = 10;
    updateSettings({ wordSpacing: s });
  };

  const updateGroupLines = (delta: number) => {
    let s = settings.groupLines + delta;
    if (s < 1) s = 1;
    if (s > 10) s = 10;
    updateSettings({ groupLines: s });
  };

  const updateLineHeight = (delta: number) => {
    let s = (settings.lineHeight || 1.8) + delta;
    if (s < 1.0) s = 1.0;
    if (s > 3.0) s = 3.0;
    updateSettings({ lineHeight: Number(s.toFixed(1)) });
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
            className="fixed bottom-0 left-0 right-0 bg-bg-surface rounded-t-3xl z-[5501] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col pb-[env(safe-area-inset-bottom,20px)]"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <div className="text-lg font-bold">Cài đặt giao diện</div>
              <div onClick={() => setActiveSheet(null)} className="p-2 cursor-pointer text-text-sub text-xl">✕</div>
            </div>

            <div className="p-5 flex flex-col gap-6">
              {/* Lazy Load */}
              <div className="flex justify-between items-center">
                <span>Tự động tải chương</span>
                <div 
                  onClick={() => updateSettings({ lazyLoad: !settings.lazyLoad })}
                  className="relative w-[44px] h-[24px] bg-[#2e3a52] rounded-[12px] cursor-pointer"
                >
                  <div 
                    className="absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all duration-300"
                    style={{ left: settings.lazyLoad ? '22px' : '2px' }}
                  />
                </div>
              </div>

              {/* Font Size */}
              <div className="flex justify-between items-center">
                <span>Font Size</span>
                <div className="flex gap-3 bg-bg-app p-1.5 rounded-[14px] border border-[#2e3a52]">
                  <button onClick={() => updateFontSize(-1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">A-</button>
                  <div className="flex items-center px-2 font-bold min-w-[30px] justify-center">{settings.fontSize}</div>
                  <button onClick={() => updateFontSize(1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">A+</button>
                </div>
              </div>

              {/* Word Spacing */}
              <div className="flex justify-between items-center">
                <span>Word Spacing</span>
                <div className="flex gap-3 bg-bg-app p-1.5 rounded-[14px] border border-[#2e3a52]">
                  <button onClick={() => updateWordSpacing(-1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">A-</button>
                  <div className="flex items-center px-2 font-bold min-w-[30px] justify-center">{settings.wordSpacing}</div>
                  <button onClick={() => updateWordSpacing(1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">A+</button>
                </div>
              </div>

              {/* Group Lines */}
              <div className="flex justify-between items-center">
                <span>Gộp dòng</span>
                <div className="flex gap-3 bg-bg-app p-1.5 rounded-[14px] border border-[#2e3a52]">
                  <button onClick={() => updateGroupLines(-1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">A-</button>
                  <div className="flex items-center px-2 font-bold min-w-[30px] justify-center">{settings.groupLines}</div>
                  <button onClick={() => updateGroupLines(1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">A+</button>
                </div>
              </div>

              {/* Line Height */}
              <div className="flex justify-between items-center">
                <span>Giãn dòng</span>
                <div className="flex gap-3 bg-bg-app p-1.5 rounded-[14px] border border-[#2e3a52]">
                  <button onClick={() => updateLineHeight(-0.1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">-</button>
                  <div className="flex items-center px-2 font-bold min-w-[30px] justify-center">{settings.lineHeight?.toFixed(1) || 1.8}</div>
                  <button onClick={() => updateLineHeight(0.1)} className="w-[44px] h-[44px] rounded-[10px] bg-[#151e32] text-white font-bold active:bg-accent border-none cursor-pointer">+</button>
                </div>
              </div>

              {/* Font Family */}
              <div className="flex flex-col gap-2.5">
                <span>Phông chữ</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {fonts.map((f) => (
                    <div
                      key={f.name}
                      onClick={() => updateSettings({ fontFamily: f.value })}
                      className={`py-2 px-4 rounded-[20px] border border-[#2e3a52] text-sm text-text-sub cursor-pointer text-center transition-all ${
                        settings.fontFamily === f.value ? 'bg-accent text-white border-accent shadow-[0_2px_8px_var(--accent-glow)]' : ''
                      }`}
                    >
                      {f.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-5" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
