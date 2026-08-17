import { ref } from 'vue';

const THEME_KEY = 'theme';
const theme = ref('light');
let initialized = false;

function readPreferred() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function apply(next) {
  theme.value = next;
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
}

export function useTheme() {
  if (!initialized) {
    initialized = true;
    apply(document.documentElement.dataset.theme || readPreferred());
  }

  function toggleTheme() {
    apply(theme.value === 'dark' ? 'light' : 'dark');
  }

  return { theme, toggleTheme };
}
