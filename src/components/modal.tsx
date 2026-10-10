'use client';

import { type ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A modal dialog built on <dialog>. The browser makes the page behind it
 * inert, closes it on Escape and returns focus to the trigger. Put
 * `data-autofocus` on the control that should take focus first.
 */
export default function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[420px] rounded-md border border-divider bg-surface p-0 text-ink shadow-[0_24px_60px_color-mix(in_srgb,#0c1638_35%,transparent)] backdrop:bg-[color-mix(in_srgb,#0c1638_55%,transparent)]"
    >
      {open && (
        <div className="flex flex-col gap-3.5 p-6">
          <h2 id="modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
