import type { TranslationRecord } from '@/types';

const KEY = 'hindisetu_history_v1';
const MAX_ITEMS = 50;

export function loadHistory(): TranslationRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TranslationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: TranslationRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function addToHistory(record: TranslationRecord): TranslationRecord[] {
  const current = loadHistory();
  const updated = [record, ...current].slice(0, MAX_ITEMS);
  saveHistory(updated);
  return updated;
}

export function removeFromHistory(id: string): TranslationRecord[] {
  const current = loadHistory();
  const updated = current.filter((r) => r.id !== id);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): TranslationRecord[] {
  saveHistory([]);
  return [];
}
