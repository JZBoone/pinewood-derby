'use client';

import BackButton from '@/components/back-button';
import { Cars } from '@/components/cars';
import { makeChampionship } from '@/client-biz/championship';
import { useSession } from '@/client-biz/auth';
import { isAdmin } from '@/lib/user';
import { get } from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, use, useEffect, useState } from 'react';
import { DerbyData, fetchDerbyData } from './derby-data';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Derby({ params }: Props) {
  const resolvedParams = use(params);
  const [derbyData, setDerbyData] = useState<DerbyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isAdminUser = !!session && isAdmin(session.user.role);

  function handleMakeChampionshipClick(derbyId: number) {
    makeChampionship(derbyId)
      .then(() => {
        alert('Let the championship begin!');
      })
      .catch((err: unknown) => {
        alert(`Error creating championship: ${get(err, 'message')}`);
      });
  }

  useEffect(() => {
    let mounted = true;
    let loadedOnce = false;
    async function loadDerby() {
      while (mounted) {
        try {
          const data = await fetchDerbyData(resolvedParams.id);
          setDerbyData(data);
        } catch (err: unknown) {
          if (!loadedOnce) {
            setError(`Oh no! Error loading derby: ${get(err, 'message')}`);
          }
        } finally {
          loadedOnce = true;
          setLoading(false);
        }
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
    }

    loadDerby();

    return () => {
      mounted = false;
    };
  }, [resolvedParams.id]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <BackButton></BackButton>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:center">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          {loading && 'Loading...'}
          {!loading && !error && !derbyData && 'Derby not found'}
          {error && <div className="text-red-500">{error}</div>}
        </h1>
        {!loading && derbyData && (
          <Image
            src={`/logo-${derbyData.derby.id}.png`}
            alt="Derby logo"
            width={332}
            height={272}
            priority
          />
        )}
        {!loading && derbyData && (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {derbyData.championshipCreated && (
              <Link
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-500 text-white gap-2 hover:bg-red-700 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href={`/derby/${resolvedParams.id}/championship`}
              >
                Championship
              </Link>
            )}
            {isAdminUser && (
              <button
                id={`make-championship-${derbyData.derby.id}`}
                onClick={() =>
                  handleMakeChampionshipClick(derbyData.derby.id)
                }
                className="mt-4 sm:mt-0 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded font-semibold hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Make Championship 🏁
              </button>
            )}
          </div>
        )}
        {!loading && derbyData && (
          <DensList dens={derbyData.dens} isAdminUser={isAdminUser} />
        )}
      </main>
    </div>
  );
}

interface DensListProps {
  dens: DerbyData['dens'];
  isAdminUser: boolean;
}

function DensList({ dens, isAdminUser }: DensListProps) {
  const [regeneratingDenId, setRegeneratingDenId] = useState<number | null>(
    null
  );
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  async function handleRegenerate(denId: number) {
    setRegenerateError(null);
    setRegeneratingDenId(denId);

    try {
      const response = await fetch('/api/den/heat/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ den_id: denId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error ||
          `Failed to regenerate heats (HTTP ${response.status})`;
        throw new Error(message);
      }
    } catch (err: unknown) {
      setRegenerateError(
        get(err, 'message', 'Failed to regenerate heats. Please try again.')
      );
    } finally {
      setRegeneratingDenId(null);
    }
  }

  return dens.map((den) => (
    <Fragment key={den.id}>
      <div key={den.id} className="mb-4">
        <h2 className="text-2xl font-bold mb-2 mt-4">Den {den.name}</h2>
        {<Cars cars={den.cars} />}
      </div>
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <Link
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          href={`/derby/den/${den.id}/heats`}
        >
          Go to Heats
        </Link>
        {isAdminUser && (
          <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            onClick={() => handleRegenerate(den.id)}
            disabled={regeneratingDenId === den.id}
          >
            {regeneratingDenId === den.id
              ? 'Regenerating...'
              : 'Regenerate Heats'}
          </button>
        )}
      </div>
      {regenerateError && (
        <div className="text-red-500 text-sm mt-2">{regenerateError}</div>
      )}
    </Fragment>
  ));
}
