import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

interface GlassDockProps {
  onPrevClick: () => void;
  onNextClick: () => void;
  onTranslateClick: () => void;
  onMenuClick: () => void;
  onEditWordClick: () => void;
}

export default function GlassDock({
  onPrevClick,
  onNextClick,
  onTranslateClick,
  onMenuClick,
  onEditWordClick,
}: GlassDockProps) {
  const location = useLocation();
  const { navigation } = useApp();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isReader = location.pathname.match(/\/chapters\/[^/]+$/);

  // Derive disabled state from global context if in reader mode
  const canGoPrev = isReader ? !!navigation.prevId : false;
  const canGoNext = isReader ? !!navigation.nextId : false;
  
  // Debug Log
  // console.log('[GlassDock] Nav State:', { isReader, prev: navigation.prevId, next: navigation.nextId, canGoPrev, canGoNext });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isReader) {
        // Hide when scrolling down significantly, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setVisible(false);
        } else {
            setVisible(true);
        }
      } else {
          setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isReader]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed left-1/2 z-[2200]"
          style={{ 
            bottom: 'max(12px, env(safe-area-inset-bottom, 12px))'
          }}
        >
          {/* Main Dock Container - Compact & Bottom-aligned */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-3 h-[56px] rounded-full backdrop-blur-3xl shadow-2xl relative overflow-visible"
            style={{
              background: 'linear-gradient(135deg, rgba(21, 30, 50, 0.4) 0%, rgba(11, 17, 33, 0.5) 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Animated glow effect */}
            <motion.div 
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-[var(--color-accent)]/15 to-transparent pointer-events-none blur-sm" 
            />

            {/* Prev Button with Ripple */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1, rotate: -5 }}
              onClick={onPrevClick}
              disabled={!canGoPrev}
              className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center overflow-hidden group disabled:opacity-25 disabled:cursor-not-allowed"
            >
              {/* Ripple background */}
              <motion.div 
                className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/15 group-active:bg-[var(--color-accent)]/30 rounded-full"
                whileTap={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Icon with bounce */}
              <motion.svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5 relative z-10 text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors"
                animate={!canGoPrev ? {} : { x: [-1, 1, -1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <path d="M15 18l-6-6 6-6" />
              </motion.svg>
            </motion.button>

            {/* Translate Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1, y: -2 }}
              onClick={onTranslateClick}
              className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center overflow-hidden group"
            >
              <motion.div 
                className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/15 group-active:bg-[var(--color-accent)]/30 rounded-full"
                whileTap={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 0.4 }}
              />
              
              <motion.svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5 relative z-10 text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1" />
              </motion.svg>
            </motion.button>

            {/* Center Menu Button - Premium with Pulse */}
            <motion.button
              whileTap={{ scale: 0.88, rotate: 90 }}
              whileHover={{ scale: 1.12, rotate: 0 }}
              onClick={onMenuClick}
              className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center group mx-0.5"
            >
              {/* Pulsing outer ring */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)]"
              />
              
              {/* Glowing gradient background with red */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-accent-dim)] shadow-2xl"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  boxShadow: '0 6px 24px var(--color-accent-glow), inset 0 2px 2px rgba(255,255,255,0.3), inset 0 -2px 2px rgba(0,0,0,0.2)',
                }} 
              />
              
              {/* Icon with rotation */}
              <motion.div 
                className="relative z-10 text-white"
                whileTap={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 drop-shadow-lg">
                  <rect x="4" y="4" width="6" height="6" rx="2" />
                  <rect x="14" y="4" width="6" height="6" rx="2" />
                  <rect x="14" y="14" width="6" height="6" rx="2" />
                  <rect x="4" y="14" width="6" height="6" rx="2" />
                </svg>
              </motion.div>
            </motion.button>

            {/* Edit Word Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1, y: -2 }}
              onClick={onEditWordClick}
              disabled={!isReader}
              className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center overflow-hidden group disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <motion.div 
                className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/15 group-active:bg-[var(--color-accent)]/30 rounded-full"
                whileTap={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 0.4 }}
              />
              
              <motion.svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5 relative z-10 text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors"
                whileHover={{ rotate: -15 }}
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </motion.svg>
            </motion.button>

            {/* Next Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              onClick={onNextClick}
              disabled={!canGoNext}
              className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center overflow-hidden group disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <motion.div 
                className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/15 group-active:bg-[var(--color-accent)]/30 rounded-full"
                whileTap={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 0.4 }}
              />
              
              <motion.svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5 relative z-10 text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors"
                animate={!canGoNext ? {} : { x: [1, -1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <path d="M9 18l6-6-6-6" />
              </motion.svg>
            </motion.button>
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
