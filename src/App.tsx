import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import GlassDock from './components/GlassDock';
import Toast from './components/Toast';
import TranslationSheet from './components/sheets/TranslationSheet';
import EditWordSheet from './components/sheets/EditWordSheet';
import SettingsSheet from './components/sheets/SettingsSheet';
import MenuDrawer from './components/drawers/MenuDrawer';
import HistoryDrawer from './components/drawers/HistoryDrawer';
import Home from './pages/Home';
import ChaptersList from './pages/ChaptersList';
import Reader from './pages/Reader';
import './styles/globals.css';

function Layout() {
  const { setActiveSheet } = useApp();

  const handleTranslate = () => setActiveSheet('translation');
  const handleHistory = () => setActiveSheet('history');
  const handleSettings = () => setActiveSheet('settings');
  const handleMenu = () => setActiveSheet('menu');
  const handleEditWord = () => setActiveSheet('editWord');
  
  const handlePrev = () => {
    window.dispatchEvent(new CustomEvent('nav-prev-chapter'));
  };

  const handleNext = () => {
    window.dispatchEvent(new CustomEvent('nav-next-chapter'));
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-main pt-14 pb-[calc(80px+var(--safe-area-bottom))]">
      <div
        id="readProgress"
        className="fixed top-0 left-0 h-[3px] bg-accent w-0 z-[1100] transition-[width] duration-100"
        aria-hidden="true"
      />

      <Header
        onHistoryClick={handleHistory}
        onSettingsClick={handleSettings}
      />

      <main>
        <Outlet />
      </main>

      <GlassDock
        onPrevClick={handlePrev}
        onNextClick={handleNext}
        onTranslateClick={handleTranslate}
        onMenuClick={handleMenu}
        onEditWordClick={handleEditWord}
      />

      <Toast />
      
      <TranslationSheet />
      <EditWordSheet />
      <SettingsSheet />
      <MenuDrawer />
      <HistoryDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="books/:bookId/chapters" element={<ChaptersList />} />
            <Route path="books/:bookId/chapters/:chapterId" element={<Reader />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
