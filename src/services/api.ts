import type {
  BooksResponse,
  ChaptersResponse,
  ChapterResponse,
  Replacement,
  TranslationPayload,
  ReportPayload,
  TranslateResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://armorplated-thersa-unstained.ngrok-free.dev';

const headers = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export const api = {
  // Books
  getBooks: (page = 1, limit = 1000, search = '') =>
    fetchAPI<BooksResponse>(`/api/books?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),

  // Chapters
  getChapters: (
    bookId: string,
    page = 1,
    limit = 500,
    sortBy = 'chapterNumber',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    state?: 'PENDING'
  ) => {
    let url = `/api/books/${bookId}/chapters?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    if (state) url += `&state=${state}`;
    return fetchAPI<ChaptersResponse>(url);
  },

  // Chapter Detail
  getChapter: (chapterId: string, groupLines = 1, isEnabledReplace = false) =>
    fetchAPI<ChapterResponse>(
      `/api/chapters/${chapterId}/?groupLines=${groupLines}&isEnabledReplace=${isEnabledReplace}`
    ).then(data => {
        console.log('[API] getChapter response:', data);
        return data;
    }),

  // Replacements
  getReplacements: (bookId: string, chapterId?: string, scope?: string, search?: string) => {
    let url = `/api/replacements?bookId=${bookId}`;
    if (chapterId) url += `&chapterId=${chapterId}`;
    if (scope) url += `&scope=${scope}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchAPI<Replacement[]>(url);
  },

  createReplacement: (data: Omit<Replacement, 'id'>) =>
    fetchAPI<Replacement>('/api/replacements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateReplacement: (id: string, data: Partial<Replacement>) =>
    fetchAPI<Replacement>(`/api/replacements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteReplacement: (id: string) =>
    fetch(`${API_BASE}/api/replacements/${id}`, {
      method: 'DELETE',
      headers,
    }),

  // Translation
  translate: (payload: TranslationPayload) =>
    fetchAPI<TranslateResponse>('/stories/gemini-ai/translate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Report
  reportUpdate: (bookId: string, payload: ReportPayload) =>
    fetch(`${API_BASE}/api/book/update/${bookId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
};
