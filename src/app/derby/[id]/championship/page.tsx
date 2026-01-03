'use client';

import BackButton from '@/components/back-button';
import { Cars } from '@/components/cars';
import { fetchChampionshipData } from '@/client-biz/championship';
import { Heat } from '@/components/heat';
import { ChampionshipData } from '@/lib/championship';
import { get, keyBy } from 'lodash';
import { use, useEffect, useState } from 'react';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Derby({ params }: Props) {
  const resolvedParams = use(params);
  const [championshipData, setChampionshipData] =
    useState<ChampionshipData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let loadedOnce = false;
    async function loadDerby() {
      while (mounted) {
        try {
          const data = await fetchChampionshipData(resolvedParams.id);
          setChampionshipData(data);
        } catch (err: unknown) {
          if (!loadedOnce) {
            setError(
              `Oh no! Error loading championship: ${get(err, 'message')}`
            );
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

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <BackButton></BackButton>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:center">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          {loading && 'Loading...'}
          {!loading && !error && !championshipData && 'Derby not found'}
          {error && <div className="text-red-500">{error}</div>}
          {!loading &&
            championshipData &&
            `${formatDate(championshipData.derby.time.toString())} ${championshipData.derby.location_name}`}
        </h1>
        {!loading && championshipData && (
          <DenChampions
            cars={championshipData.cars}
            dens={championshipData.dens}
          />
        )}
        {!loading &&
          championshipData &&
          championshipData.heats.map((heat, heatIndex) => (
            <Heat
              key={heat.id}
              heat={heat}
              carsById={keyBy(championshipData.cars, 'id')}
              heatNumber={heatIndex + 1}
            />
          ))}
      </main>
    </div>
  );
}

interface DenChampionsProps {
  cars: ChampionshipData['cars'];
  dens: ChampionshipData['dens'];
}

function DenChampions({ cars, dens }: DenChampionsProps) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-2 mt-4">Den Champions</h2>
      {<Cars cars={cars} dens={dens} />}
    </div>
  );
}
