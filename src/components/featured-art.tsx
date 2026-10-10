import { FeaturedArt as FeaturedArtData } from '@/lib/derby-art';
import Image from 'next/image';

interface FeaturedArtProps {
  art: FeaturedArtData;
  year: number;
}

export default function FeaturedArt({ art, year }: FeaturedArtProps) {
  const credit = [art.artist && `by ${art.artist}`, art.den]
    .filter(Boolean)
    .join(' · ');

  return (
    <figure className="m-0">
      <div
        className="rounded-[18px] border-[3px] border-cs-mark p-[22px] outline-[1.5px] -outline-offset-10 outline-[color-mix(in_srgb,var(--cs-mark)_70%,transparent)] outline-dashed"
        style={{ background: art.bgColor ?? 'var(--surface)' }}
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={art.imageUrl}
            alt={
              art.title
                ? `${art.title}, featured artwork for ${year}`
                : `Featured artwork for ${year}`
            }
            fill
            sizes="(max-width: 800px) 100vw, 560px"
            className="object-contain"
            priority
          />
        </div>
      </div>
      <figcaption className="mt-3.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <div className="text-[11px] font-bold tracking-[.12em] text-accent uppercase">
            Featured artwork
          </div>
          {art.title && (
            <div className="font-(family-name:--font-heading) text-xl font-semibold font-stretch-112%">
              {art.title}
            </div>
          )}
        </div>
        {credit && <div className="text-sm text-ink/72">{credit}</div>}
      </figcaption>
    </figure>
  );
}
