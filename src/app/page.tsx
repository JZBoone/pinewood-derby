'use client';

import { useEffect, useState } from 'react';
import { derby } from '@prisma/client';
import { fetchDerbies } from '@/client-biz/derby';
import { get } from 'lodash';

export default function Home() {
  const [derbies, setDerbies] = useState<derby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDerbies() {
      try {
        const data = await fetchDerbies();
        console.log(data);
        setDerbies(data);
      } catch (err: unknown) {
        setError(`Failed to fetch derbies: ${get(err, 'message')}`);
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
              <a href={`/derby/${derby.id}`} className="text-white underline">
                {formatDate(derby.time.toString())} {derby.location_name}
              </a>
            </li>
          ))}
          {loading && <li>Loading...</li>}
          {error && <li className="text-red-600">{error}</li>}
        </ul>
      </main>
    </div>
  );
}
