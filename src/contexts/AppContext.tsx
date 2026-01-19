import { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_TRANS_OPTIONS } from '../utils/constants';
import type { Settings, TranslationOptions, ReadProgress, HistoryItem, Book } from '../types';

interface AppContextType {
  // Current state
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;
  activeChapterId: string | null;
  setActiveChapterId: (id: string | null) => void;
  
  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Translation options
  transOptions: TranslationOptions;
  updateTransOptions: (options: Partial<TranslationOptions>) => void;
  
  // Progress
  progress: ReadProgress;
  saveProgress: (chapterId: string, offset: number) => void;
  getProgress: (chapterId: string) => number;
  
  // History
  history: HistoryItem[];
  addHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  
  // UI State
  toast: { message: string; show: boolean };
  showToast: (message: string) => void;
  hideToast: () => void;
  
  activeSheet: string | null;
  sheetData: any;
  setActiveSheet: (sheet: string | null, data?: any) => void;
  
  // Navigation State
  navigation: { prevId: string | null; nextId: string | null };
  setNavigation: (nav: { prevId: string | null; nextId: string | null }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const [transOptions, setTransOptions] = useLocalStorage<TranslationOptions>(
    STORAGE_KEYS.TRANS_OPTIONS,
    DEFAULT_TRANS_OPTIONS
  );
  const [progress, setProgress] = useLocalStorage<ReadProgress>(STORAGE_KEYS.PROGRESS, {});
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  const [toast, setToast] = useState({ message: '', show: false });
  const [activeSheet, setActiveSheetState] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any>(null);
  const [navigation, setNavigation] = useState<{ prevId: string | null; nextId: string | null }>({ prevId: null, nextId: null });

  const setActiveSheet = (sheet: string | null, data: any = null) => {
    setActiveSheetState(sheet);
    setSheetData(data);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings });
    
    // Apply CSS variables
    const root = document.documentElement;
    if (newSettings.fontSize !== undefined) {
      root.style.setProperty('--reader-font-size', `${newSettings.fontSize / 16}rem`);
    }
    if (newSettings.fontFamily !== undefined) {
      root.style.setProperty('--reader-font-family', newSettings.fontFamily);
    }
    if (newSettings.wordSpacing !== undefined) {
      root.style.setProperty('--reader-word-spacing', `${newSettings.wordSpacing}px`);
    }
  };

  const updateTransOptions = (options: Partial<TranslationOptions>) => {
    setTransOptions({ ...transOptions, ...options });
  };

  const saveProgress = (chapterId: string, offset: number) => {
    const newProgress = { ...progress, [chapterId]: Math.max(0, Math.floor(offset)) };
    const keys = Object.keys(newProgress);
    if (keys.length > 50) {
      delete newProgress[keys[0]];
    }
    setProgress(newProgress);
  };

  const getProgress = (chapterId: string): number => {
    return progress[chapterId] || 0;
  };

  const addHistory = (item: HistoryItem) => {
    const filtered = history.filter((h) => h.bid !== item.bid);
    const newHistory = [item, ...filtered].slice(0, 20);
    setHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const hideToast = () => {
    setToast({ message: '', show: false });
  };

  return (
    <AppContext.Provider
      value={{
        currentBook,
        setCurrentBook,
        activeChapterId,
        setActiveChapterId,
        settings,
        updateSettings,
        transOptions,
        updateTransOptions,
        progress,
        saveProgress,
        getProgress,
        history,
        addHistory,
        clearHistory,
        toast,
        showToast,
        hideToast,
        activeSheet,
        sheetData,
        setActiveSheet,
        navigation,
        setNavigation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
