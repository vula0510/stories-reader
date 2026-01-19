export const STORAGE_KEYS = {
  HISTORY: 'novel_history_v3',
  SETTINGS: 'novel_settings_v3',
  PROGRESS: 'novel_progress_v3',
  TRANS_OPTIONS: 'novel_trans_opts_v1',
} as const;

export const DEFAULT_SETTINGS = {
  fontSize: 18,
  fontFamily: "'Merriweather', serif",
  lazyLoad: true,
  groupLines: 1,
  wordSpacing: 0,
  isEnabledReplaceToggle: false,
};

export const DEFAULT_TRANS_OPTIONS = {
  model: 'gemini-2.0-flash-lite',
  minWords: 100,
  maxWords: 500,
  temperature: 0,
  scope: false,
};
