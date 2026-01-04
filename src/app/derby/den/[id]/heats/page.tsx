'use client';

import { DenHeatsData, fetchDenHeatsData } from '@/client-biz/heat';
import BackButton from '@/components/back-button';
import { Cars } from '@/components/cars';
import { Heat } from '@/components/heat';
import { get, keyBy } from 'lodash';
import React, { use, useEffect, useState } from 'react';
import { car } from '../../../../../../prisma/generated/prisma/client';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Derby({ params }: Props) {
  const resolvedParams = use(params);
  const [heatsData, setHeatsData] = useState<DenHeatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let loadedOnce = false;
    async function loadData() {
      while (mounted) {
        try {
          const data = await fetchDenHeatsData(resolvedParams.id);
          setHeatsData(data);
        } catch (err: unknown) {
          if (!loadedOnce) {
            setError(`Oh no! Error loading heats: ${get(err, 'message')}`);
          }
        } finally {
          loadedOnce = true;
          setLoading(false);
        }
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [resolvedParams.id]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1
          className="text-2xl font-bold text-center sm:text-left"
          style={{ paddingLeft: '0.75rem' }}
        >
          {loading && 'Loading...'}
          {!loading && !error && !heatsData && 'Derby not found'}
          {error && 'Error loading derby'}
          {!loading && heatsData && `Den ${heatsData.den.name}`}
        </h1>
        <div className="mb-4">
          {!loading &&
            heatsData &&
            heatsData.groups.map((group, i) => (
              <HeatGroup
                key={i}
                group={group}
                groupNumber={i + 1}
                carsById={keyBy(heatsData.cars, 'id')}
              />
            ))}
        </div>
      </main>
      <BackButton></BackButton>
    </div>
  );
}

interface HeatGroupProps {
  group: DenHeatsData['groups'][number];
  groupNumber: number;
  carsById: { [carId: number]: car };
}

function HeatGroup({ group, groupNumber, carsById }: HeatGroupProps) {
  return (
    <React.Fragment>
      <div className="mb-4" style={{ padding: '0.75rem' }}>
        <h2 className="text-2xl font-bold mb-2 mt-4">Group {groupNumber}</h2>
        {<Cars cars={group.cars} />}
      </div>
      {group.heats.map((heat, heatIndex) => (
        <Heat
          key={heat.id}
          heat={heat}
          carsById={carsById}
          heatNumber={heatIndex + 1}
        />
      ))}
    </React.Fragment>
  );
}
