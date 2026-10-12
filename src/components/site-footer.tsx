'use client';

import { isSoundOn, startLoop, stopLoop, subscribeToSound } from '@/lib/sound';
import { useEffect, useState } from 'react';
import Compass from './art/compass';
import TentScout from './campsite/tent-scout';
import SoundToggle from './sound-toggle';
import { useToast } from './toast';

// "Fire Crackling Sound" by SoundReality, from Pixabay:
// https://pixabay.com/sound-effects/search/fire/
const CAMPFIRE_SOUND = '/sounds/campfire.mp3';

// Stars in the night sky. The car constellation sits in open sky between
// the campfire and the blue tent.
const CAR_CONSTELLATION = [
  [680, -10],
  [702, -22],
  [730, -24],
  [746, -12],
  [776, -8],
  [772, 2],
  [686, 2],
  [680, -10],
];
const STARS = [
  [120, 30],
  [210, 54],
  [330, 22],
  [520, 40],
  [640, 18],
  [760, 50],
  [1060, 28],
  [1140, 58],
];

function Pine({ x, height }: { x: number; height: number }) {
  const w = height * 0.4;
  return (
    <path
      d={`M${x} ${140 - height} L${x + w * 0.6} ${140 - height * 0.55} L${x + w * 0.35} ${140 - height * 0.55} L${x + w} 138 L${x - w} 138 L${x - w * 0.35} ${140 - height * 0.55} L${x - w * 0.6} ${140 - height * 0.55} Z`}
      fill="currentColor"
    />
  );
}

/**
 * The campsite at the bottom of every page: a rope with a square knot,
 * pines, two tents and an animated campfire. Tapping the fire starts and
 * stops a looping crackle.
 */
export default function SiteFooter() {
  const showToast = useToast();
  const [fireOn, setFireOn] = useState(false);

  // Muting from the footer toggle also puts the fire out.
  useEffect(
    () =>
      subscribeToSound(() => {
        if (!isSoundOn()) {
          setFireOn(false);
        }
      }),
    []
  );

  function toggleFire() {
    if (fireOn) {
      stopLoop(CAMPFIRE_SOUND);
      setFireOn(false);
      return;
    }
    setFireOn(startLoop(CAMPFIRE_SOUND));
    showToast('S’mores time! Toast your marshmallow golden, not black.');
  }

  return (
    <footer className="mt-16" aria-label="Pack 272 campsite">
      <div className="relative z-10 flex items-center">
        <div className="h-2.5 flex-1 rounded-full bg-[repeating-linear-gradient(-55deg,#c9a46a_0_6px,#a9824a_6px_9px)]" />
        <svg
          viewBox="0 0 64 28"
          className="absolute left-1/2 h-7 w-16 -translate-x-1/2"
          aria-hidden
        >
          <path
            d="M2 14 C14 14 18 4 28 6 C36 8 34 20 42 22 C50 24 54 14 62 14"
            fill="none"
            stroke="#a9824a"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d="M2 14 C14 14 18 24 28 22 C36 20 34 8 42 6 C50 4 54 14 62 14"
            fill="none"
            stroke="#c9a46a"
            strokeWidth={7}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* The scene is taller than the tents so the orange tent's pennant
          tucks under the rope. The ground line sits at y=139. */}
      <div className="relative h-[168px]">
        <svg
          viewBox="0 -28 1200 168"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 block h-full w-full"
          role="img"
          aria-label="A campsite with tents, pine trees and a campfire"
        >
          <g className="hidden dark:inline">
            {STARS.map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={1.5}
                fill="#f3efe4"
                className="motion-safe:animate-[twinkle_4s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
            <polyline
              points={CAR_CONSTELLATION.map((p) => p.join(',')).join(' ')}
              fill="none"
              stroke="#f3efe4"
              strokeOpacity={0.18}
              strokeDasharray="2 3"
            />
            {CAR_CONSTELLATION.slice(0, 7).map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={1.8} fill="#f3efe4" />
            ))}
            <circle cx={696} cy={6} r={2.2} fill="#f5b919" />
            <circle cx={762} cy={6} r={2.2} fill="#f5b919" />
          </g>

          <g className="text-ink/14">
            <Pine x={70} height={96} />
            <Pine x={130} height={70} />
            <Pine x={240} height={110} />
            <Pine x={830} height={84} />
            <Pine x={1010} height={118} />
            <Pine x={1090} height={78} />
            <Pine x={1160} height={100} />
          </g>
        </svg>
        {/* Plain <img> keeps the campfire's built-in CSS animation running,
            which next/image's optimizer could rasterize away. */}
        <div className="absolute inset-x-0 bottom-px flex items-end justify-center gap-[clamp(12px,7vw,110px)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/campsite/tent-orange.svg"
            alt=""
            width={240}
            height={171}
            className="h-auto w-[240px] max-w-[28vw]"
          />
          <button
            type="button"
            aria-label="Campfire sound"
            aria-pressed={fireOn}
            onClick={toggleFire}
            className="-mb-3.5 w-[220px] max-w-[26vw] rounded-full"
          >
            {/* The SVG's own reduced-motion query doesn't reach inside an
                <img>, so the page picks a still copy instead. */}
            <picture>
              <source
                media="(prefers-reduced-motion: reduce)"
                srcSet="/campsite/campfire-still.svg"
              />
              <img
                src="/campsite/campfire.svg"
                alt=""
                width={220}
                height={180}
                className="h-auto w-full"
              />
            </picture>
          </button>
          {/* Knock on the door for a slingshot surprise. */}
          <TentScout className="w-[190px] max-w-[22vw] max-[480px]:hidden" />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-4 px-[clamp(20px,4vw,40px)] pt-5 pb-10">
        <Compass className="size-12 shrink-0" />
        <div className="flex-1">
          <div className="font-(family-name:--font-heading) font-semibold font-stretch-112%">
            Pack 272 · Do your best
          </div>
          <div className="text-sm text-ink/65">
            Built with sawdust, graphite and a little help from a grown-up.
          </div>
        </div>
        <SoundToggle />
      </div>
    </footer>
  );
}
