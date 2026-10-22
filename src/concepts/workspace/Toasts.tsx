import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { IconButton } from './Primitives';
import './workspace.css';

// Two kinds of toast, one of each shown at a time: functional toasts are the result of the user's own action
// (optionally with Undo) and sit top right; notifications are background events (a finished update) and sit bottom right.

export type ToastOptions = { kind?: 'action' | 'notification'; action?: { label: string; run: () => void } };
export type Notify = (text: string, options?: ToastOptions) => void;
type Toast = { text: string; action?: ToastOptions['action'] };

/** Toast state, auto-dismiss timers and the `notify` callback to hand to pages and jobs. */
export function useToasts() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [notification, setNotification] = useState<Toast | null>(null);
  const notify = useCallback<Notify>((text, options) => options?.kind === 'notification' ? setNotification({ text, action: options.action }) : setToast({ text, action: options?.action }), []);
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(null), toast.action ? 6000 : 2450); return () => clearTimeout(timeout); }, [toast]);
  useEffect(() => { if (!notification) return; const timeout = setTimeout(() => setNotification(null), 6000); return () => clearTimeout(timeout); }, [notification]);
  return { toast, notification, notify, dismissToast: () => setToast(null), dismissNotification: () => setNotification(null) };
}
export type ToastState = ReturnType<typeof useToasts>;

/** Renders both toasts; place it inside the positioned window root. */
export function ToastRegion({ toasts }: { toasts: ToastState }) {
  const { toast, notification, dismissToast, dismissNotification } = toasts;
  return <>
    {toast && <div className="dt-toast functional" role="status"><Check size={15} />{toast.text}{toast.action && <button className="dt-toast-action" onClick={() => { toast.action?.run(); dismissToast(); }}>{toast.action.label}</button>}<IconButton label="Dismiss" onClick={dismissToast}><X size={13} /></IconButton></div>}
    {notification && <div className="dt-toast notification" role="status"><Bell size={15} />{notification.text}{notification.action && <button className="dt-toast-action" onClick={() => { notification.action?.run(); dismissNotification(); }}>{notification.action.label}</button>}<IconButton label="Dismiss notification" onClick={dismissNotification}><X size={13} /></IconButton></div>}
  </>;
}
