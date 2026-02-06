'use client';

import { signIn, signOut, useSession } from '@/client-biz/auth';
import { createDerby, fetchDerbies, uploadDerbyCsv } from '@/client-biz/derby';
import { postFakeTimes } from '@/client-biz/heat';
import { isAdmin } from '@/lib/user';
import { derby } from '@generated/client';
import { get } from 'lodash';
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

  const handleLogin = async () =>
    signIn.social({ provider: 'google', callbackURL: '/' });

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

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {session ? (
          <div className="flex flex-wrap items-center gap-3">
            <div>Welcome {session.user.name}</div>
            <button type="button" onClick={() => signOut()} className="text-sm underline">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin}>Sign in with Google</button>
        )}
        <h1 className="text-4xl font-bold text-center sm:text-left">
          Pinewood Derbies
        </h1>
        {isAdminUser && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                setCreateError(null);
                setUploadError(null);
              }}
              className="h-10 w-10 rounded-full border border-blue-500 text-blue-600 text-2xl leading-none flex items-center justify-center hover:bg-blue-50"
              aria-label="Create a new derby"
            >
              +
            </button>
            <span className="text-sm text-gray-600">Create a new derby</span>
          </div>
        )}
        {isAdminUser && showCreateForm && (
          <div className="w-full max-w-xl border border-gray-200 rounded-lg p-4">
            {!createdDerbyId ? (
              <form className="flex flex-col gap-4" onSubmit={handleCreateDerbySubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="derby-name">
                    Derby name
                  </label>
                  <input
                    id="derby-name"
                    name="derby-name"
                    type="text"
                    value={derbyName}
                    onChange={(event) => setDerbyName(event.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                    placeholder="Pack 123 Pinewood"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="derby-date">
                    Derby date
                  </label>
                  <input
                    id="derby-date"
                    name="derby-date"
                    type="date"
                    value={derbyDate}
                    onChange={(event) => setDerbyDate(event.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:[color-scheme:dark]"
                  />
                </div>
                {createError && <div className="text-red-500">{createError}</div>}
                <button
                  type="submit"
                  disabled={creating}
                  className="self-start px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create derby'}
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleCsvUpload}>
                <div className="text-sm text-gray-700">
                  Upload the CSV for this derby.
                </div>
                <input
                  type="file"
                  name="csv"
                  accept=".csv,text/csv"
                  className="text-sm"
                />
                {uploadError && <div className="text-red-500">{uploadError}</div>}
                <button
                  type="submit"
                  disabled={uploading}
                  className="self-start px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                >
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
              </form>
            )}
          </div>
        )}
        <ul className="list-inside text-lg text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          {derbies.map((derby) => (
            <li key={derby.id}>
              <Link href={`/derby/${derby.id}`} className="text-2xl underline">
                {formatDate(derby.time.toString())} {derby.location_name}
              </Link>
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
