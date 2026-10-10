'use client';

import { useRef, useState } from 'react';
import { useToast } from './toast';

const SECRET_CLICKS = 5;

// The red pack-number patch. The dashed outline is the stitching. Five quick
// clicks unlock a secret patch.
export default function PackPatch() {
  const clicks = useRef<number[]>([]);
  const [spins, setSpins] = useState(0);
  const showToast = useToast();

  function handleClick() {
    const now = Date.now();
    clicks.current = [...clicks.current, now].filter((t) => now - t < 2_500);
    if (clicks.current.length >= SECRET_CLICKS) {
      clicks.current = [];
      setSpins((n) => n + 1);
      showToast('Secret patch unlocked: Pack 272 Speed Demon');
    }
  }

  return (
    <span
      key={spins}
      onClick={handleClick}
      className={`shrink-0 rounded-[3px] bg-cs-red px-2.5 py-1.5 font-(family-name:--font-heading) text-[15px] leading-none font-bold text-white tabular-nums outline-[1.5px] -outline-offset-4 outline-white/75 outline-dashed ${
        spins > 0 ? 'motion-safe:animate-[patch-spin_.9s_ease-in-out]' : ''
      }`}
    >
      272
    </span>
  );
}
