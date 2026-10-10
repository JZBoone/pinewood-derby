'use client';

import Button from '@/components/button';
import ErrorMessage from '@/components/error-message';
import Modal from '@/components/modal';
import { RefreshCw } from 'lucide-react';

interface RegenerateHeatsModalProps {
  open: boolean;
  timedHeatCount: number;
  regenerating: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RegenerateHeatsModal({
  open,
  timedHeatCount,
  regenerating,
  error,
  onConfirm,
  onClose,
}: RegenerateHeatsModalProps) {
  const heats =
    timedHeatCount === 1
      ? '1 heat already has'
      : `${timedHeatCount} heats already have`;
  return (
    <Modal open={open} title="Regenerate heats?" onClose={onClose}>
      <p className="text-sm text-ink/78">
        {heats} recorded times. Regenerating clears those times and reshuffles
        every lane.
      </p>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div className="flex justify-end gap-2.5">
        <Button variant="ghost" data-autofocus onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          icon={RefreshCw}
          onClick={onConfirm}
          disabled={regenerating}
        >
          {regenerating ? 'Regenerating…' : 'Regenerate'}
        </Button>
      </div>
    </Modal>
  );
}
