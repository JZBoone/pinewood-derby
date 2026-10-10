'use client';

import { useSession } from '@/client-biz/auth';
import { buildAuthHeaders } from '@/client-biz/auth-headers';
import { makeChampionship } from '@/client-biz/championship';
import { deleteDerby } from '@/client-biz/derby';
import BackLink from '@/components/back-link';
import Button, { ButtonLink, ButtonSeparator } from '@/components/button';
import ErrorMessage from '@/components/error-message';
import FeaturedArt from '@/components/featured-art';
import FeaturedArtForm from '@/components/featured-art-form';
import RankBand from '@/components/rank-band';
import ResultsTable from '@/components/results-table';
import SiteHeader from '@/components/site-header';
import SiteQrCode from '@/components/site-qr-code';
import { useToast } from '@/components/toast';
import { formatRaceDay } from '@/lib/derby';
import { isAdmin } from '@/lib/user';
import { get } from 'lodash';
import {
  ArrowRight,
  Flag,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Trophy,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, use, useEffect, useState } from 'react';
import DeleteDerbyModal from './delete-derby-modal';
import RegenerateHeatsModal from './regenerate-heats-modal';
import { DerbyData, fetchDerbyData } from './derby-data';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const CHAMPIONSHIP_TAB = 'championship';

export default function DerbyPage({ params }: Props) {
  const { id } = use(params);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1040px] px-[clamp(20px,4vw,40px)] pt-7 pb-24">
        <BackLink href="/">All derbies</BackLink>
        {/* useSearchParams needs a Suspense boundary. */}
        <Suspense>
          <Derby id={id} />
        </Suspense>
      </main>
    </div>
  );
}

function Derby({ id }: { id: string }) {
  const [derbyData, setDerbyData] = useState<DerbyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingArt, setEditingArt] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [makingChampionship, setMakingChampionship] = useState(false);
  const showToast = useToast();
  const { data: session } = useSession();
  const isAdminUser = !!session && isAdmin(session.user.role);
  const authToken = session?.session?.token;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  async function handleMakeChampionshipClick(derbyId: number) {
    if (!authToken) {
      alert('Missing authorization token. Please sign in again.');
      return;
    }

    setMakingChampionship(true);
    try {
      await makeChampionship(derbyId, authToken);
      setDerbyData(await fetchDerbyData(id));
      showToast('Championship created');
      selectTab(CHAMPIONSHIP_TAB);
    } catch (err: unknown) {
      alert(`Error creating championship: ${get(err, 'message')}`);
    } finally {
      setMakingChampionship(false);
    }
  }

  function handleDeleteDerby(derbyId: number) {
    if (!authToken) {
      alert('Missing authorization token. Please sign in again.');
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    deleteDerby(derbyId, authToken)
      .then(() => {
        router.push('/');
      })
      .catch((err: unknown) => {
        setDeleteError(
          get(err, 'message', 'Failed to delete derby. Please try again.')
        );
      })
      .finally(() => {
        setDeleting(false);
      });
  }

  function selectTab(key: string) {
    const next = new URLSearchParams(searchParams);
    next.set('den', key);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  useEffect(() => {
    let mounted = true;
    let loadedOnce = false;
    async function loadDerby() {
      while (mounted) {
        try {
          const data = await fetchDerbyData(id);
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
  }, [id]);

  if (loading) {
    return <div className="text-ink/65">Loading...</div>;
  }
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  if (!derbyData) {
    return <div>Derby not found</div>;
  }

  const { derby, dens, featuredArt, championship } = derbyData;
  const year = new Date(derby.time).getFullYear();
  const tabs = [
    ...dens.map((den) => ({ key: den.name, label: `Den ${den.name}` })),
    ...(championship ? [{ key: CHAMPIONSHIP_TAB, label: 'Championship' }] : []),
  ];
  const requestedTab = searchParams.get('den');
  const selectedTab =
    tabs.find((tab) => tab.key === requestedTab)?.key ?? tabs[0]?.key;
  const selectedDen = dens.find((den) => den.name === selectedTab);

  const showArtColumn = !!featuredArt || isAdminUser;

  return (
    <>
      <section
        className={`grid items-center gap-12 ${
          showArtColumn
            ? 'min-[800px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
            : ''
        }`}
      >
        <div>
          <div className="text-xs font-bold tracking-[.14em] text-accent uppercase">
            Cub Scout Pack 272
          </div>
          <h1 className="mt-2 text-[clamp(72px,12vw,128px)] leading-[.9] font-bold tracking-[-.03em] tabular-nums font-stretch-118%">
            {year}
          </h1>
          <p className="mt-3 font-(family-name:--font-heading) text-[28px] leading-tight font-semibold font-stretch-112%">
            Pinewood Derby
          </p>
          <p className="mt-3 text-base text-ink/72">
            {formatRaceDay(derby.time)} · {derby.location_name}
          </p>
          <RankBand size={14} className="mt-7" />
          <SiteQrCode path={`/derby/${derby.id}`} className="mt-8" />
        </div>
        {showArtColumn && (
          <div className="order-first min-[800px]:order-none">
            {featuredArt ? (
              <FeaturedArt art={featuredArt} year={year} />
            ) : (
              <a
                href="#featured-art-form"
                onClick={() => setEditingArt(true)}
                className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-divider text-accent no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
              >
                <ImagePlus size={28} strokeWidth={1.75} />
                Add this year&apos;s featured artwork
              </a>
            )}
            {featuredArt && isAdminUser && !editingArt && (
              <button
                type="button"
                className="btn-outline mt-3"
                onClick={() => setEditingArt(true)}
              >
                <Pencil size={16} strokeWidth={1.75} />
                Edit artwork
              </button>
            )}
          </div>
        )}
      </section>
      {isAdminUser && editingArt && (
        <FeaturedArtForm
          derbyId={derby.id}
          art={featuredArt}
          authToken={authToken}
          onSaved={(art) => {
            setDerbyData({ ...derbyData, featuredArt: art });
            setEditingArt(false);
          }}
          onCancel={() => setEditingArt(false)}
        />
      )}
      <hr className="mt-14 mb-7 border-divider" />
      {(championship || isAdminUser) && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {championship && (
            <ButtonLink href={`/derby/${derby.id}/championship`} icon={Trophy}>
              Championship
            </ButtonLink>
          )}
          {isAdminUser && (
            <>
              {championship && <ButtonSeparator />}
              {/* A disabled button shows no tooltip, so the wrapper carries it. */}
              <span
                title={
                  championship ? 'Championship already created' : undefined
                }
              >
                <Button
                  id={`make-championship-${derby.id}`}
                  variant="primary"
                  icon={Flag}
                  onClick={() => handleMakeChampionshipClick(derby.id)}
                  disabled={!!championship || makingChampionship}
                >
                  {makingChampionship ? 'Creating…' : 'Make championship'}
                </Button>
              </span>
              <Button
                id={`delete-derby-${derby.id}`}
                variant="danger"
                icon={Trash2}
                onClick={() => setDeleteOpen(true)}
              >
                Delete derby
              </Button>
              <DeleteDerbyModal
                open={deleteOpen}
                year={year}
                deleting={deleting}
                error={deleteError}
                onConfirm={() => handleDeleteDerby(derby.id)}
                onClose={() => {
                  setDeleteOpen(false);
                  setDeleteError(null);
                }}
              />
            </>
          )}
        </div>
      )}
      <div role="tablist" aria-label="Dens" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const selected = tab.key === selectedTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={selected}
              aria-controls="den-panel"
              onClick={() => selectTab(tab.key)}
              className={`rounded-(--radius) border px-3.5 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? 'border-accent text-accent shadow-[inset_0_-3px_0_var(--cs-yellow)]'
                  : 'border-divider text-ink hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id="den-panel"
        role="tabpanel"
        aria-labelledby={selectedTab ? `tab-${selectedTab}` : undefined}
      >
        {selectedDen && (
          <DenResults
            den={selectedDen}
            isAdminUser={isAdminUser}
            authToken={authToken}
          />
        )}
        {selectedTab === CHAMPIONSHIP_TAB && championship && (
          <>
            <div className="mt-7 mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[28px] font-semibold">Championship</h2>
              <ButtonLink
                href={`/derby/${derby.id}/championship`}
                icon={ArrowRight}
                iconPosition="end"
              >
                Go to heats
              </ButtonLink>
            </div>
            <ResultsTable cars={championship.cars} dens={championship.dens} />
          </>
        )}
        {tabs.length === 0 && (
          <p className="mt-7 text-ink/65">No dens have been added yet.</p>
        )}
      </div>
    </>
  );
}

interface DenResultsProps {
  den: DerbyData['dens'][number];
  isAdminUser: boolean;
  authToken?: string;
}

function DenResults({ den, isAdminUser, authToken }: DenResultsProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const showToast = useToast();

  async function regenerate() {
    setRegenerateError(null);
    setRegenerating(true);

    try {
      const response = await fetch('/api/den/heat/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && buildAuthHeaders(authToken)),
        },
        body: JSON.stringify({ den_id: den.id }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error ||
          `Failed to regenerate heats (HTTP ${response.status})`;
        throw new Error(message);
      }
      setRegenerateOpen(false);
      showToast('Heats regenerated');
    } catch (err: unknown) {
      setRegenerateError(
        get(err, 'message', 'Failed to regenerate heats. Please try again.')
      );
    } finally {
      setRegenerating(false);
    }
  }

  // Recorded times are only wiped after the admin confirms.
  function requestRegenerate() {
    setRegenerateError(null);
    if (den.timedHeatCount > 0) {
      setRegenerateOpen(true);
    } else {
      regenerate();
    }
  }

  async function handleCreateCar() {
    if (!authToken) {
      setCreateError('Missing authorization token. Please sign in again.');
      return;
    }

    const carNumberRaw = window.prompt(`Enter car number for Den ${den.name}`);
    if (carNumberRaw === null) {
      return;
    }
    const carNumber = Number.parseInt(carNumberRaw.trim(), 10);
    if (!Number.isFinite(carNumber)) {
      alert('Car number must be a valid number.');
      return;
    }

    const ownerRaw = window.prompt(`Enter scout name for Den ${den.name}`);
    if (ownerRaw === null) {
      return;
    }
    const owner = ownerRaw.trim();
    if (!owner) {
      alert('Scout name is required.');
      return;
    }

    const carNameRaw = window.prompt(
      `Optional: Enter car name for Den ${den.name}`
    );
    if (carNameRaw === null) {
      return;
    }
    const carName = carNameRaw.trim();

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch('/api/car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(authToken),
        },
        body: JSON.stringify({
          denId: den.id,
          carNumber,
          carName: carName ? carName : undefined,
          owner,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error || `Failed to create car (HTTP ${response.status})`;
        throw new Error(message);
      }
      showToast(
        `Car #${carNumber} added`,
        den.heatCount > 0
          ? { label: 'Regenerate heats', onClick: requestRegenerate }
          : undefined
      );
    } catch (err: unknown) {
      setCreateError(
        get(err, 'message', 'Failed to create car. Please try again.')
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="mt-7 mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[28px] font-semibold">Den {den.name}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {isAdminUser && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleCreateCar}
              disabled={creating}
            >
              {creating ? 'Adding…' : 'Add car'}
            </Button>
          )}
          <ButtonLink
            href={`/derby/den/${den.id}/heats`}
            icon={ArrowRight}
            iconPosition="end"
            disabled={den.heatCount === 0}
            title={den.heatCount === 0 ? 'Heats not generated yet' : undefined}
          >
            Go to heats
          </ButtonLink>
          {isAdminUser && (
            <>
              <ButtonSeparator />
              <Button
                variant="ghost"
                icon={RefreshCw}
                onClick={requestRegenerate}
                disabled={regenerating}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate heats'}
              </Button>
              <RegenerateHeatsModal
                open={regenerateOpen}
                timedHeatCount={den.timedHeatCount}
                regenerating={regenerating}
                error={regenerateError}
                onConfirm={regenerate}
                onClose={() => setRegenerateOpen(false)}
              />
            </>
          )}
        </div>
      </div>
      {regenerateError && !regenerateOpen && (
        <div className="mb-3">
          <ErrorMessage>{regenerateError}</ErrorMessage>
        </div>
      )}
      {createError && (
        <div className="mb-3">
          <ErrorMessage>{createError}</ErrorMessage>
        </div>
      )}
      <ResultsTable cars={den.cars} />
    </>
  );
}
