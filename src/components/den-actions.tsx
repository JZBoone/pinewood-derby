'use client';

import { buildAuthHeaders } from '@/client-biz/auth-headers';
import { get } from 'lodash';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import AddCarModal, { NewCar } from './add-car-modal';
import Button, { ButtonLink, ButtonSeparator } from './button';
import ErrorMessage from './error-message';
import RegenerateHeatsModal from './regenerate-heats-modal';
import { useToast } from './toast';

export type DenActionsDen = {
  id: number;
  name: string;
  heatCount: number;
  timedHeatCount: number;
};

interface DenActionsProps {
  den: DenActionsDen;
  isAdminUser: boolean;
  authToken?: string;
  showGoToHeats: boolean;
}

/**
 * The heats and cars actions for a den: Add car and Regenerate heats for
 * admins, and optionally Go to heats for everyone.
 */
export default function DenActions({
  den,
  isAdminUser,
  authToken,
  showGoToHeats,
}: DenActionsProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [addCarOpen, setAddCarOpen] = useState(false);
  const showToast = useToast();

  async function regenerate() {
    setRegenerateError(null);
    setRegenerating(true);

    try {
      const response = await fetch('/api/den/heat/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && buildAuthHeaders(authToken)),
        },
        body: JSON.stringify({ den_id: den.id }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error ||
          `Failed to regenerate heats (HTTP ${response.status})`;
        throw new Error(message);
      }
      setRegenerateOpen(false);
      showToast('Heats regenerated');
    } catch (err: unknown) {
      setRegenerateError(
        get(err, 'message', 'Failed to regenerate heats. Please try again.')
      );
    } finally {
      setRegenerating(false);
    }
  }

  // Recorded times are only wiped after the admin confirms.
  function requestRegenerate() {
    setRegenerateError(null);
    if (den.timedHeatCount > 0) {
      setRegenerateOpen(true);
    } else {
      regenerate();
    }
  }

  function openAddCar() {
    setCreateError(null);
    setAddCarOpen(true);
  }

  async function handleCreateCar({ carNumber, owner, carName }: NewCar) {
    if (!authToken) {
      setCreateError('Missing authorization token. Please sign in again.');
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch('/api/car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(authToken),
        },
        body: JSON.stringify({ denId: den.id, carNumber, carName, owner }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error || `Failed to create car (HTTP ${response.status})`;
        throw new Error(message);
      }
      setAddCarOpen(false);
      showToast(
        `Car #${carNumber} added`,
        den.heatCount > 0
          ? { label: 'Regenerate heats', onClick: requestRegenerate }
          : undefined
      );
    } catch (err: unknown) {
      setCreateError(
        get(err, 'message', 'Failed to create car. Please try again.')
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {isAdminUser && (
          <>
            <Button variant="primary" icon={Plus} onClick={openAddCar}>
              Add car
            </Button>
            <AddCarModal
              open={addCarOpen}
              denName={den.name}
              adding={creating}
              error={createError}
              onSubmit={handleCreateCar}
              onClose={() => setAddCarOpen(false)}
            />
          </>
        )}
        {showGoToHeats && (
          <ButtonLink
            href={`/derby/den/${den.id}/heats`}
            icon={ArrowRight}
            iconPosition="end"
            disabled={den.heatCount === 0}
            title={den.heatCount === 0 ? 'Heats not generated yet' : undefined}
          >
            Go to heats
          </ButtonLink>
        )}
        {isAdminUser && (
          <>
            <ButtonSeparator />
            <Button
              variant="ghost"
              icon={RefreshCw}
              onClick={requestRegenerate}
              disabled={regenerating}
            >
              {regenerating ? 'Regenerating…' : 'Regenerate heats'}
            </Button>
            <RegenerateHeatsModal
              open={regenerateOpen}
              timedHeatCount={den.timedHeatCount}
              regenerating={regenerating}
              error={regenerateError}
              onConfirm={regenerate}
              onClose={() => setRegenerateOpen(false)}
            />
          </>
        )}
      </div>
      {regenerateError && !regenerateOpen && (
        <ErrorMessage>{regenerateError}</ErrorMessage>
      )}
    </>
  );
}
