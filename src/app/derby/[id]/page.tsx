'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, use, Fragment } from 'react';
import { get } from 'lodash';
import { fetchDerbyData, DerbyData } from './derby-data';
import { Cars } from '@/components/cars';
import BackButton from '@/components/back-button';

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
        {!loading && derbyData?.championshipCreated && (
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-500 text-white gap-2 hover:bg-red-700 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href={`/derby/${resolvedParams.id}/championship`}
          >
            Championship
          </Link>
        )}
        {!loading && derbyData && <DensList dens={derbyData.dens} />}
      </main>
    </div>
  );
}

interface DensListProps {
  dens: DerbyData['dens'];
}

function DensList({ dens }: DensListProps) {
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
      </div>
    </Fragment>
  ));
}
