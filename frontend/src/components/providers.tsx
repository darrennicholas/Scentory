'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';

type Alert = { kind: 'success' | 'error'; title: string; message: string };
type Notice = { message: string; kind: 'success' | 'error' };
type SaveFeedback = <T>(request: () => Promise<T>, successMessage: string) => Promise<T>;
const SaveFeedbackContext = createContext<SaveFeedback | null>(null);

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function useSaveFeedback() {
  const saveFeedback = useContext(SaveFeedbackContext);
  if (!saveFeedback) throw new Error('useSaveFeedback must be used within Providers.');
  return saveFeedback;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [client] = useState(() => new QueryClient({ mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.feedbackHandled !== true) setNotice({ message: 'Changes saved successfully.', kind: 'success' });
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.feedbackHandled !== true) setNotice({ message: error instanceof Error ? error.message : 'The request failed. Please try again.', kind: 'error' });
    },
  }) }));
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const resolveAlert = useRef<(() => void) | null>(null);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 4000); return () => clearTimeout(timer); }, [notice]);

  const showAlert = useCallback((nextAlert: Alert) => new Promise<void>(resolve => {
    resolveAlert.current = resolve;
    setAlert(nextAlert);
  }), []);

  const runSave = useCallback(async <T,>(request: () => Promise<T>, successMessage: string) => {
    const startedAt = Date.now();
    setSaving(true);
    try {
      const result = await request();
      await wait(Math.max(0, 1000 - (Date.now() - startedAt)));
      setSaving(false);
      await wait(50);
      await showAlert({ kind: 'success', title: 'Saved successfully', message: successMessage });
      return result;
    } catch (error) {
      await wait(Math.max(0, 1000 - (Date.now() - startedAt)));
      setSaving(false);
      await wait(50);
      await showAlert({
        kind: 'error',
        title: 'Could not save changes',
        message: error instanceof Error ? error.message : 'The server could not save your changes. Please try again.',
      });
      throw error;
    }
  }, [showAlert]);

  const dismissAlert = () => {
    setAlert(null);
    resolveAlert.current?.();
    resolveAlert.current = null;
  };

  return <SaveFeedbackContext.Provider value={runSave}>
    <QueryClientProvider client={client}>
      {children}
      {saving && <div className="save-loading-backdrop">
        <section className="save-loading" role="status" aria-live="polite" aria-busy="true">
          <span className="save-spinner" aria-hidden="true" />
          <div><strong>Saving your changes</strong><span>Please wait while Scentory updates your archive.</span></div>
        </section>
      </div>}
      {alert && <div className="sweet-alert-backdrop">
        <section className="sweet-alert" role="alertdialog" aria-modal="true" aria-labelledby="save-alert-title" aria-describedby="save-alert-message" onKeyDown={event => { if (event.key === 'Escape') dismissAlert(); if (event.key === 'Tab') { event.preventDefault(); event.currentTarget.querySelector('button')?.focus(); } }}>
          <div className={`sweet-alert-icon sweet-alert-icon--${alert.kind}`} aria-hidden="true">
            {alert.kind === 'success' ? <Check size={28} strokeWidth={2.2} /> : <X size={28} strokeWidth={2.2} />}
          </div>
          <h2 id="save-alert-title">{alert.title}</h2>
          <p id="save-alert-message">{alert.message}</p>
          <button className="btn sweet-alert-confirm" autoFocus onClick={dismissAlert}>Continue</button>
        </section>
      </div>}
      {notice && <div className={`toast ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.message}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button></div>}
    </QueryClientProvider>
  </SaveFeedbackContext.Provider>;
}
