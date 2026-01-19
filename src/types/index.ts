// API Response Types
export interface Book {
  bookId: string;
  bookName: string;
  chapterCount: number;
  totalTranslated: number;
  totalPending: number;
  createdAt: string;
}

export interface Chapter {
  chapterId: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  title: string;
  state: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  content?: string[];
  updatedAt?: string;
}

export interface ChapterDetail extends Chapter {
  content: string[];
  navigation?: {
    prev?: { chapterId: string };
    next?: { chapterId: string };
  };
}

export interface Replacement {
  id: string;
  original: string;
  replacement: string;
  scope: 'chapter' | 'book' | 'global';
  bookId: string;
  chapterId?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface BooksResponse {
  data: Book[];
  pagination: Pagination;
}

export interface ChaptersResponse {
  chapters: Chapter[];
  pagination: Pagination;
}

export interface ChapterResponse {
  chapter: ChapterDetail;
  navigation?: {
    prev?: { chapterId: string; chapterNumber: number; title: string };
    next?: { chapterId: string; chapterNumber: number; title: string };
  };
}

export interface TranslateResponse {
  [chapterId: string]: {
    chapter: {
      state: 'PENDING' | 'SUCCEEDED' | 'FAILED';
      totalTokens?: number;
    };
  };
}

// Settings Types
export interface Settings {
  fontSize: number;
  fontFamily: string;
  lazyLoad: boolean;
  groupLines: number;
  wordSpacing: number;
  isEnabledReplaceToggle: boolean;
  lineHeight: number;
  textAlign: 'left' | 'justify';
}

export interface TranslationOptions {
  model: string;
  minWords: number;
  maxWords: number;
  temperature: number;
  scope: boolean;
}

export interface ReadProgress {
  [chapterId: string]: number;
}

export interface HistoryItem {
  bid: string;
  bname: string;
  cid: string;
  cnum: number;
  scrollPos: number;
}

// Translation Payload Types
export interface TranslationPayload {
  mode: 'current' | 'batch_chapter' | 'story';
  model: string;
  minWords: number;
  maxWords: number;
  temperature: number;
  retryTranslate: boolean;
  bookId?: string | string[];
  chapterId?: string[];
  currentChapterId?: string;
}

export interface ReportPayload {
  originalText: string;
  newText: string;
  chapterId: string;
  errorType: string;
}
