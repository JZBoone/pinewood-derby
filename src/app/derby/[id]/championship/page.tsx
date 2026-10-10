'use client';

import { useSession } from '@/client-biz/auth';
import { fetchChampionshipData } from '@/client-biz/championship';
import ErrorMessage from '@/components/error-message';
import HeatsView from '@/components/heats-view';
import SiteHeader from '@/components/site-header';
import { ChampionshipData } from '@/lib/championship';
import { isAdmin } from '@/lib/user';
import { get } from 'lodash';
import { use, useEffect, useState } from 'react';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Championship({ params }: Props) {
  const { id } = use(params);
  const [data, setData] = useState<ChampionshipData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isAdminUser = !!session && isAdmin(session.user.role);

  function handleHeatActivated(heatId: number) {
    setData(
      (prev) =>
        prev && {
          ...prev,
          heats: prev.heats.map((heat) => ({
            ...heat,
            status: heat.id === heatId ? 'active' : 'inactive',
          })),
        }
    );
  }

  useEffect(() => {
    let mounted = true;
    let loadedOnce = false;
    async function loadData() {
      while (mounted) {
        try {
          setData(await fetchChampionshipData(id));
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

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1040px] px-[clamp(20px,4vw,40px)] pt-7 pb-24">
        {loading && <div className="text-ink/65">Loading...</div>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {data && (
          <HeatsView
            derby={data.derby}
            title="Championship"
            backHref={`/derby/${data.derby.id}?den=championship`}
            standings={data.cars}
            dens={data.dens}
            heats={data.heats}
            cars={data.cars}
            isAdminUser={isAdminUser}
            onHeatActivated={handleHeatActivated}
          />
        )}
      </main>
    </div>
  );
}
