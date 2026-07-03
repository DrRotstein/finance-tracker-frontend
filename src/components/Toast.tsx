import { useState, useEffect } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

let toastId = 0;

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor = toast.type === 'success' ? '#2e7d32' : '#d32f2f';

  return (
    <div
      role="alert"
      style={{
        backgroundColor: bgColor,
        color: '#fff',
        padding: '0.75rem 1rem',
        borderRadius: '6px',
        fontSize: '0.875rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span>{toast.text}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: '0 0.25rem',
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function createToast(text: string, type: 'success' | 'error'): ToastMessage {
  return { id: ++toastId, text, type };
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error') => {
    setToasts((prev) => [...prev, createToast(text, type)]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismissToast };
}
