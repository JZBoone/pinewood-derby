'use client';

import { makeChampionship } from '@/client-biz/championship';
import { fetchDerbies } from '@/client-biz/derby';
import { postFakeTimes } from '@/client-biz/heat';
import { get } from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { derby } from '../../prisma/generated/prisma/client';

export default function Home() {
  const [derbies, setDerbies] = useState<derby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function handleMakeFakeTimesClick(derbyId: derby['id']) {
    postFakeTimes(derbyId)
      .then(() => {
        alert('Fake times created successfully!');
      })
      .catch((err: unknown) => {
        alert(`Error creating fake times: ${get(err, 'message')}`);
      });
  }

  function handleMakeChampionshipClick(derbyId: derby['id']) {
    makeChampionship(derbyId)
      .then(() => {
        alert('Let the championship begin!');
      })
      .catch((err: unknown) => {
        alert(`Error creating championship: ${get(err, 'message')}`);
      });
  }

  useEffect(() => {
    async function loadDerbies() {
      try {
        const data = await fetchDerbies();
        setDerbies(data);
      } catch (err: unknown) {
        setError(`Oh no! Error loading derbies: ${get(err, 'message')}`);
      } finally {
        setLoading(false);
      }
    }

    loadDerbies();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center sm:text-left">
          Pinewood Derbies
        </h1>
        <ul className="list-inside text-lg text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          {derbies.map((derby) => (
            <li key={derby.id}>
              <Link href={`/derby/${derby.id}`} className="text-2xl underline">
                {formatDate(derby.time.toString())} {derby.location_name}
              </Link>
              <button
                id={`make-championship-${derby.id}`}
                style={{ display: 'none' }}
                onClick={() => handleMakeChampionshipClick(derby.id)}
                className="mt-4 ml-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Make Championship
              </button>
              <button
                id={`fake-times-${derby.id}`}
                style={{ display: 'none' }}
                onClick={() => handleMakeFakeTimesClick(derby.id)}
                className="mt-4 ml-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Fake Times
              </button>
            </li>
          ))}
          {loading && <li>Loading...</li>}
          {error && <div className="text-red-500">{error}</div>}
        </ul>
      </main>
    </div>
  );
}
