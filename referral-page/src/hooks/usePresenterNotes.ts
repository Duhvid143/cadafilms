import { useState, useCallback, useEffect, useRef } from 'react';

export interface PresenterNote {
  id: string;
  slideId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const DEBOUNCE_MS = 500;
const STORAGE_KEY = 'slideforge.presenter-notes.v1';

/**
 * Presenter notes are stored in localStorage rather than a backend.
 *
 * This deck ships as a zero-dependency static page, so the editor deliberately
 * carries no backend either. Notes are authoring aids, scoped to the machine
 * doing the authoring. If the deck ever needs shared notes across devices,
 * swap this store for Lovable Cloud.
 */
type NoteStore = Record<string, PresenterNote>;

function readStore(): NoteStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NoteStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: NoteStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to persist presenter notes:', err);
  }
}

export function usePresenterNotes(slideId: string | null) {
  const [note, setNote] = useState<PresenterNote | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);

  const fetchNote = useCallback(async () => {
    if (!slideId) {
      setNote(null);
      setContent('');
      return;
    }

    setLoading(true);
    const existing = readStore()[slideId] ?? null;
    setNote(existing);
    setContent(existing?.content ?? '');
    setLoading(false);
  }, [slideId]);

  useEffect(() => {
    fetchNote();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchNote]);

  const persistNote = useCallback(
    async (contentToSave: string) => {
      if (!slideId) return;

      setSaving(true);
      setSaveStatus('saving');

      try {
        const store = readStore();
        const now = new Date().toISOString();
        const next: PresenterNote = {
          id: store[slideId]?.id ?? slideId,
          slideId,
          content: contentToSave,
          createdAt: store[slideId]?.createdAt ?? now,
          updatedAt: now,
        };
        store[slideId] = next;
        writeStore(store);
        setNote(next);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Failed to save presenter note:', err);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setSaving(false);
      }
    },
    [slideId],
  );

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);
      pendingContentRef.current = newContent;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (pendingContentRef.current !== null) {
          persistNote(pendingContentRef.current);
          pendingContentRef.current = null;
        }
      }, DEBOUNCE_MS);
    },
    [persistNote],
  );

  const deleteNote = async (): Promise<boolean> => {
    if (!slideId) return false;

    try {
      const store = readStore();
      delete store[slideId];
      writeStore(store);
      setNote(null);
      setContent('');
      return true;
    } catch (err) {
      console.error('Failed to delete presenter note:', err);
      return false;
    }
  };

  return {
    note,
    content,
    loading,
    saving,
    saveStatus,
    updateContent,
    deleteNote,
    refetch: fetchNote,
  };
}
