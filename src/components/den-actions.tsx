'use client';

import { buildAuthHeaders } from '@/client-biz/auth-headers';
import { get } from 'lodash';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
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

  async function handleCreateCar() {
    if (!authToken) {
      setCreateError('Missing authorization token. Please sign in again.');
      return;
    }

    const carNumberRaw = window.prompt(`Enter car number for Den ${den.name}`);
    if (carNumberRaw === null) {
      return;
    }
    const carNumber = Number.parseInt(carNumberRaw.trim(), 10);
    if (!Number.isFinite(carNumber)) {
      alert('Car number must be a valid number.');
      return;
    }

    const ownerRaw = window.prompt(`Enter scout name for Den ${den.name}`);
    if (ownerRaw === null) {
      return;
    }
    const owner = ownerRaw.trim();
    if (!owner) {
      alert('Scout name is required.');
      return;
    }

    const carNameRaw = window.prompt(
      `Optional: Enter car name for Den ${den.name}`
    );
    if (carNameRaw === null) {
      return;
    }
    const carName = carNameRaw.trim();

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch('/api/car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(authToken),
        },
        body: JSON.stringify({
          denId: den.id,
          carNumber,
          carName: carName ? carName : undefined,
          owner,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error || `Failed to create car (HTTP ${response.status})`;
        throw new Error(message);
      }
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
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreateCar}
            disabled={creating}
          >
            {creating ? 'Adding…' : 'Add car'}
          </Button>
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
      {createError && <ErrorMessage>{createError}</ErrorMessage>}
    </>
  );
}
