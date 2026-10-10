'use client';

import { useSession } from '@/client-biz/auth';
import { fetchDerbyById } from '@/client-biz/derby';
import { fetchDenHeatsData } from '@/client-biz/heat';
import DenActions from '@/components/den-actions';
import ErrorMessage from '@/components/error-message';
import HeatsView from '@/components/heats-view';
import SiteHeader from '@/components/site-header';
import { carsWithTimes } from '@/lib/car';
import { heatHasTimes } from '@/lib/heat';
import { isAdmin } from '@/lib/user';
import { derby } from '@generated/client';
import { get } from 'lodash';
import { use, useEffect, useState } from 'react';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function fetchDenHeatsPageData(denId: string) {
  const { groups, den, cars } = await fetchDenHeatsData(denId);
  const { derby } = await fetchDerbyById(den.derby_id);
  if (!derby) {
    throw new Error('Derby not found');
  }
  // Heats are grouped by the cars that race together. The page runs them in
  // group order as one numbered list.
  const heats = groups.flatMap((group) => group.heats);
  return { den, cars, heats, derby };
}

type DenHeatsPageData = Awaited<ReturnType<typeof fetchDenHeatsPageData>> & {
  derby: derby;
};

export default function DenHeats({ params }: Props) {
  const { id } = use(params);
  const [data, setData] = useState<DenHeatsPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isAdminUser = !!session && isAdmin(session.user.role);
  const authToken = session?.session?.token;

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
          setData(await fetchDenHeatsPageData(id));
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
            title={`Den ${data.den.name} heats`}
            backHref={`/derby/${data.derby.id}?den=${encodeURIComponent(data.den.name)}`}
            standings={carsWithTimes(data.cars, data.heats)}
            dens={[data.den]}
            heats={data.heats}
            cars={data.cars}
            isAdminUser={isAdminUser}
            onHeatActivated={handleHeatActivated}
            adminActions={
              isAdminUser && (
                <DenActions
                  den={{
                    id: data.den.id,
                    name: data.den.name,
                    heatCount: data.heats.length,
                    timedHeatCount: data.heats.filter(heatHasTimes).length,
                  }}
                  isAdminUser
                  authToken={authToken}
                  showGoToHeats={false}
                />
              )
            }
          />
        )}
      </main>
    </div>
  );
}
