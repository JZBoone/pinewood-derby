'use client';

import { useSession } from '@/client-biz/auth';
import { createDerby, fetchDerbies, uploadDerbyCsv } from '@/client-biz/derby';
import { postFakeTimes } from '@/client-biz/heat';
import SiteHeader from '@/components/site-header';
import Button from '@/components/button';
import ErrorMessage from '@/components/error-message';
import TrackScene from '@/components/art/track-scene';
import RankBand from '@/components/rank-band';
import { formatRaceDay } from '@/lib/derby';
import { isAdmin } from '@/lib/user';
import { derby } from '@generated/client';
import { get, orderBy } from 'lodash';
import { ArrowRight, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const isAdminUser = !!session && isAdmin(session.user.role);
  const authToken = session?.session?.token;
  const [derbies, setDerbies] = useState<derby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [derbyName, setDerbyName] = useState('');
  const [derbyDate, setDerbyDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdDerbyId, setCreatedDerbyId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleMakeFakeTimesClick(derbyId: derby['id']) {
    postFakeTimes(derbyId)
      .then(() => {
        alert('Fake times created successfully!');
      })
      .catch((err: unknown) => {
        alert(`Error creating fake times: ${get(err, 'message')}`);
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

  async function handleCreateDerbySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!derbyName.trim() || !derbyDate) {
      setCreateError('Please enter a derby name and date.');
      return;
    }

    if (!authToken) {
      setCreateError('Missing authorization token. Please sign in again.');
      return;
    }

    setCreating(true);
    setCreateError(null);
    setUploadError(null);

    try {
      const derby = await createDerby({
        location_name: derbyName.trim(),
        time: new Date(derbyDate).toISOString(),
      }, authToken);
      setCreatedDerbyId(derby.id);
    } catch (err: unknown) {
      setCreateError(
        get(err, 'message', 'Failed to create derby. Please try again.')
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleCsvUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createdDerbyId) {
      setUploadError('Missing derby id for CSV upload.');
      return;
    }

    if (!authToken) {
      setUploadError('Missing authorization token. Please sign in again.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const file = formData.get('csv');
    if (!(file instanceof File) || !file.size) {
      setUploadError('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const csvText = await file.text();
      await uploadDerbyCsv(createdDerbyId, csvText, authToken);
      const data = await fetchDerbies();
      setDerbies(data);
      setShowCreateForm(false);
      setCreatedDerbyId(null);
      setDerbyName('');
      setDerbyDate('');
    } catch (err: unknown) {
      setUploadError(
        get(err, 'message', 'Failed to upload CSV. Please try again.')
      );
    } finally {
      setUploading(false);
    }
  }

  const sortedDerbies = orderBy(
    derbies,
    (derby) => new Date(derby.time).getTime(),
    'desc'
  );

  const inputClassName =
    'rounded-sm border border-divider bg-bg px-3 py-2 text-ink placeholder:text-ink/50';

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pt-12 sm:px-10 sm:pt-16">
        <div className="text-xs font-bold tracking-[.14em] text-accent uppercase">
          Cub Scouts
        </div>
        <h1 className="mt-3 mb-[22px] text-[clamp(40px,9vw,64px)] leading-none font-bold tracking-[-.025em] font-stretch-118%">
          Pack 272
        </h1>
        <RankBand
          size={22}
          caption="Lions through Arrow of Light, every den races"
        />
        <TrackScene className="mt-6 mb-10 block w-full" />
        {isAdminUser && (
          <div className="mb-8 flex flex-col gap-4">
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                setCreateError(null);
                setUploadError(null);
              }}
              className="self-start"
              aria-expanded={showCreateForm}
            >
              New derby
            </Button>
            {showCreateForm && (
              <div className="rounded-(--radius) border border-divider bg-surface p-5">
                {!createdDerbyId ? (
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={handleCreateDerbySubmit}
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold" htmlFor="derby-name">
                        Derby name
                      </label>
                      <input
                        id="derby-name"
                        name="derby-name"
                        type="text"
                        value={derbyName}
                        onChange={(event) => setDerbyName(event.target.value)}
                        className={inputClassName}
                        placeholder="Pack 123 Pinewood"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold" htmlFor="derby-date">
                        Derby date
                      </label>
                      <input
                        id="derby-date"
                        name="derby-date"
                        type="date"
                        value={derbyDate}
                        onChange={(event) => setDerbyDate(event.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    {createError && <ErrorMessage>{createError}</ErrorMessage>}
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={creating}
                      className="self-start"
                    >
                      {creating ? 'Creating…' : 'Create derby'}
                    </Button>
                  </form>
                ) : (
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={handleCsvUpload}
                  >
                    <div className="text-sm">
                      Upload the CSV for this derby.
                    </div>
                    <input
                      type="file"
                      name="csv"
                      accept=".csv,text/csv"
                      className="text-sm"
                    />
                    {uploadError && <ErrorMessage>{uploadError}</ErrorMessage>}
                    <Button
                      type="submit"
                      variant="primary"
                      icon={Upload}
                      disabled={uploading}
                      className="self-start"
                    >
                      {uploading ? 'Uploading…' : 'Upload CSV'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
        <div className="hidden grid-cols-[140px_1fr_1fr_20px] gap-6 border-b-2 border-ink pb-2.5 text-[11px] font-bold tracking-[.1em] text-ink/65 uppercase sm:grid">
          <div>Year</div>
          <div>Race day</div>
          <div>Venue</div>
        </div>
        <ul>
          {sortedDerbies.map((derby) => (
            <li key={derby.id}>
              <Link
                href={`/derby/${derby.id}`}
                className="grid grid-cols-1 gap-1 border-b border-divider py-[22px] text-inherit no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--cs-yellow)_14%,transparent)] hover:text-inherit sm:grid-cols-[140px_1fr_1fr_20px] sm:items-center sm:gap-6"
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-1 bg-cs-yellow" />
                  <span className="font-(family-name:--font-heading) text-[40px] leading-none font-semibold tabular-nums font-stretch-110%">
                    {new Date(derby.time).getFullYear()}
                  </span>
                </div>
                <div className="text-sm sm:hidden">
                  {formatRaceDay(derby.time)}
                  <span className="text-ink/72"> · {derby.location_name}</span>
                </div>
                <div className="hidden text-base sm:block">
                  {formatRaceDay(derby.time)}
                </div>
                <div className="hidden text-base text-ink/72 sm:block">
                  {derby.location_name}
                </div>
                <ArrowRight
                  size={18}
                  strokeWidth={2}
                  className="hidden text-accent sm:block"
                />
              </Link>
              <button
                id={`fake-times-${derby.id}`}
                style={{ display: 'none' }}
                onClick={() => handleMakeFakeTimesClick(derby.id)}
              >
                Fake Times
              </button>
            </li>
          ))}
          {loading && <li className="py-[22px] text-ink/65">Loading...</li>}
        </ul>
        {error && (
          <div className="mt-6">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}
      </main>
    </div>
  );
}
