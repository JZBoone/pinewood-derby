'use client';

import { useEffect, useState, use } from 'react';
import { get } from 'lodash';
import { fetchHeatsData, HeatsData } from '@/client-biz/heat';
import { CarsList } from '@/client-biz/cars-list';
import BackButton from '@/client-biz/back-button';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Derby({ params }: Props) {
  const resolvedParams = use(params);
  const [heatsData, setHeatsData] = useState<HeatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDerbies() {
      try {
        const data = await fetchHeatsData(resolvedParams.id);
        setHeatsData(data);
      } catch (err: unknown) {
        setError(`Oh no! Error loading heats: ${get(err, 'message')}`);
      } finally {
        setLoading(false);
      }
    }

    loadDerbies();
  }, [resolvedParams.id]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          {loading && 'Loading...'}
          {!loading && !error && !heatsData && 'Derby not found'}
          {error && 'Error loading derby'}
          {!loading && heatsData && `Den ${heatsData.den.name}`}
        </h1>
        {!loading &&
          heatsData &&
          heatsData.groups.map((group, i) => (
            <HeatGroup key={i} group={group} groupNumber={i + 1} />
          ))}
      </main>
      <BackButton></BackButton>
    </div>
  );
}

interface HeatGroupProps {
  group: HeatsData['groups'][number];
  groupNumber: number;
}

function HeatGroup({ group, groupNumber }: HeatGroupProps) {
  return (
    <div className="mb-4">
      <h2 className="den-name text-2xl font-bold mb-2 mt-4">
        Group {groupNumber}
      </h2>
      <ul className="cars-list list-none p-0 text-2xl">
        {<CarsList cars={group.cars} />}
      </ul>
    </div>
  );
}
