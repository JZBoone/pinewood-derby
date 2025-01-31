'use client';

import BackButton from '@/client-biz/back-button';
import { CarsList } from '@/client-biz/cars-list';
import { fetchChampionshipsData } from '@/client-biz/championships';
import { ChampionshipsData } from '@/lib/championships';
import { get } from 'lodash';
import { use, useEffect, useState } from 'react';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Derby({ params }: Props) {
  const resolvedParams = use(params);
  const [championshipsData, setChampionshipsData] =
    useState<ChampionshipsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDerby() {
      try {
        const data = await fetchChampionshipsData(resolvedParams.id);
        setChampionshipsData(data);
      } catch (err: unknown) {
        if (loading) {
          setError(
            `Oh no! Error loading championships: ${get(err, 'message')}`
          );
        }
      } finally {
        setLoading(false);
      }
    }

    const interval = setInterval(async () => {
      await loadDerby();
    }, 1_000);

    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <BackButton></BackButton>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          {loading && 'Loading...'}
          {!loading && !error && !championshipsData && 'Derby not found'}
          {error && <div className="text-red-600">{error}</div>}
          {!loading &&
            championshipsData &&
            `${formatDate(championshipsData.derby.time.toString())} ${championshipsData.derby.location_name}`}
        </h1>
        {!loading && championshipsData && (
          <DenChampions cars={championshipsData.cars} />
        )}
      </main>
    </div>
  );
}

interface DenChampionsProps {
  cars: ChampionshipsData['cars'];
}

function DenChampions({ cars }: DenChampionsProps) {
  return (
    <div>
      <div className="den mb-4">
        <h2 className="den-name text-2xl font-bold mb-2 mt-4">Den Champions</h2>
        <ul className="cars-list list-none p-0 text-2xl">
          {<CarsList cars={cars} />}
        </ul>
      </div>
    </div>
  );
}
