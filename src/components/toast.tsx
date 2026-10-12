'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

type ToastAction = { label: string; onClick: () => void };

type Toast = { id: number; message: string; action?: ToastAction };

type ShowToast = (message: string, action?: ToastAction) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

let nextToastId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ShowToast>(
    (message, action) => {
      const id = nextToastId++;
      setToasts((current) => [...current, { id, message, action }]);
      setTimeout(() => dismiss(id), action ? 8_000 : 4_000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex flex-col items-center gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-4 rounded-md border border-l-4 border-accent/35 border-l-cs-yellow bg-surface py-2.5 pr-2.5 pl-3.5 text-sm text-ink shadow-[0_10px_28px_color-mix(in_srgb,#0c1638_30%,transparent)] dark:bg-[#26407f] dark:shadow-[0_10px_28px_rgb(0_0_0/45%)]"
          >
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="btn btn-primary px-3 py-1.5"
                onClick={() => {
                  dismiss(toast.id);
                  toast.action?.onClick();
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
