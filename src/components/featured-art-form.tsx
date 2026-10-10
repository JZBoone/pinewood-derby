'use client';

import { uploadDerbyArt } from '@/client-biz/derby';
import Button from '@/components/button';
import { DERBY_ART_MAX_BYTES, FeaturedArt } from '@/lib/derby-art';
import { get } from 'lodash';
import { Save } from 'lucide-react';
import Image from 'next/image';
import { type FormEvent, useEffect, useState } from 'react';

interface FeaturedArtFormProps {
  derbyId: number;
  art: FeaturedArt | null;
  authToken?: string;
  onSaved: (art: FeaturedArt | null) => void;
  onCancel: () => void;
}

const inputClassName =
  'rounded-sm border border-divider bg-bg px-3 py-2 text-ink placeholder:text-ink/50';

export default function FeaturedArtForm({
  derbyId,
  art,
  authToken,
  onSaved,
  onCancel,
}: FeaturedArtFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authToken) {
      setError('Missing authorization token. Please sign in again.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const image = form.get('image');
    if (image instanceof File && image.size > DERBY_ART_MAX_BYTES) {
      setError('The image must be 4 MB or smaller.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      onSaved(await uploadDerbyArt(derbyId, form, authToken));
    } catch (err: unknown) {
      setError(get(err, 'message', 'Failed to save artwork.'));
    } finally {
      setSaving(false);
    }
  }

  const shownImage = previewUrl ?? art?.imageUrl;

  return (
    <form
      id="featured-art-form"
      className="mt-6 flex flex-col gap-4 rounded-(--radius) border border-divider bg-surface p-5"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold">Featured artwork</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold" htmlFor="art-image">
          Image {art && '(leave empty to keep the current one)'}
        </label>
        <input
          id="art-image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          required={!art}
          className="text-sm file:mr-3 file:rounded-(--radius) file:border file:border-accent file:bg-transparent file:px-3 file:py-1.5 file:font-(family-name:--font-heading) file:font-semibold file:text-accent hover:file:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreviewUrl(file ? URL.createObjectURL(file) : null);
          }}
        />
        {shownImage && (
          <div className="relative aspect-[16/10] w-full max-w-sm rounded-sm border border-divider">
            <Image
              src={shownImage}
              alt="Artwork preview"
              fill
              sizes="384px"
              className="object-contain"
              unoptimized={!!previewUrl}
            />
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold" htmlFor="art-artist">
            Artist
          </label>
          <input
            id="art-artist"
            name="artist"
            required
            defaultValue={art?.artist ?? ''}
            placeholder="James M."
            className={inputClassName}
          />
          <span className="text-xs text-ink/65">
            First name and last initial only.
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold" htmlFor="art-title">
            Title (optional)
          </label>
          <input
            id="art-title"
            name="title"
            defaultValue={art?.title ?? ''}
            placeholder="Lightning Wagon"
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold" htmlFor="art-den">
            Den (optional)
          </label>
          <input
            id="art-den"
            name="den"
            defaultValue={art?.den ?? ''}
            placeholder="Den 6"
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold" htmlFor="art-bg">
            Mat color (optional)
          </label>
          <input
            id="art-bg"
            name="bgColor"
            defaultValue={art?.bgColor ?? ''}
            placeholder="#132150"
            pattern="#[0-9a-fA-F]{6}"
            className={inputClassName}
          />
        </div>
      </div>
      {error && (
        <div role="alert" className="border-l-4 border-cs-red pl-3">
          {error}
        </div>
      )}
      <div className="flex gap-2.5">
        <Button type="submit" variant="primary" icon={Save} disabled={saving}>
          {saving ? 'Saving…' : 'Save artwork'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
