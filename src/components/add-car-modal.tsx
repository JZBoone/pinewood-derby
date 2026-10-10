'use client';

import { Plus } from 'lucide-react';
import { type FormEvent } from 'react';
import Button from './button';
import ErrorMessage from './error-message';
import Modal from './modal';

export type NewCar = {
  carNumber: number;
  owner: string;
  carName?: string;
};

interface AddCarModalProps {
  open: boolean;
  denName: string;
  adding: boolean;
  error: string | null;
  onSubmit: (car: NewCar) => void;
  onClose: () => void;
}

const inputClassName =
  'rounded-sm border border-divider bg-bg px-3 py-2 text-ink placeholder:text-ink/50';

export default function AddCarModal({
  open,
  denName,
  adding,
  error,
  onSubmit,
  onClose,
}: AddCarModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const carName = String(form.get('carName') ?? '').trim();
    onSubmit({
      carNumber: Number.parseInt(String(form.get('carNumber')), 10),
      owner: String(form.get('owner') ?? '').trim(),
      carName: carName || undefined,
    });
  }

  return (
    <Modal open={open} title={`Add a car to Den ${denName}`} onClose={onClose}>
      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-[96px_1fr] gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-car-number" className="text-sm font-bold">
              Car #
            </label>
            <input
              id="add-car-number"
              name="carNumber"
              type="number"
              inputMode="numeric"
              min={0}
              max={32767}
              required
              data-autofocus
              className={`${inputClassName} font-(family-name:--font-heading) font-semibold tabular-nums`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-car-owner" className="text-sm font-bold">
              Scout name
            </label>
            <input
              id="add-car-owner"
              name="owner"
              required
              autoComplete="off"
              className={inputClassName}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="add-car-name" className="text-sm font-bold">
            Car name <span className="font-normal text-ink/65">(optional)</span>
          </label>
          <input
            id="add-car-name"
            name="carName"
            autoComplete="off"
            placeholder="Lightning Wagon"
            className={inputClassName}
          />
        </div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Plus} disabled={adding}>
            {adding ? 'Adding…' : 'Add car'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
