'use client';

import Button from '@/components/button';
import ErrorMessage from '@/components/error-message';
import Modal from '@/components/modal';
import { Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface DeleteDerbyModalProps {
  open: boolean;
  year: number;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteDerbyModal({
  open,
  year,
  deleting,
  error,
  onConfirm,
  onClose,
}: DeleteDerbyModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const confirmed = confirmText.trim() === String(year);

  function handleClose() {
    setConfirmText('');
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmed && !deleting) {
      onConfirm();
    }
  }

  return (
    <Modal
      open={open}
      title={`Delete the ${year} derby?`}
      onClose={handleClose}
    >
      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <p className="text-sm text-ink/78">
          This removes every heat, time and result for {year}. It can&apos;t be
          undone.
        </p>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="delete-derby-confirm" className="text-sm font-bold">
            Type {year} to confirm
          </label>
          <input
            id="delete-derby-confirm"
            inputMode="numeric"
            autoComplete="off"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            className="rounded-sm border border-divider bg-bg px-3 py-2 text-ink tabular-nums"
          />
        </div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" data-autofocus onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            icon={Trash2}
            className="border-cs-danger"
            disabled={!confirmed || deleting}
          >
            {deleting ? 'Deleting…' : 'Delete derby'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
