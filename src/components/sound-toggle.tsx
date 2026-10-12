'use client';

import { isSoundOn, setSoundOn, subscribeToSound } from '@/lib/sound';
import { Volume2, VolumeX } from 'lucide-react';
import { useSyncExternalStore } from 'react';

export default function SoundToggle() {
  const on = useSyncExternalStore(subscribeToSound, isSoundOn, () => true);
  const Icon = on ? Volume2 : VolumeX;
  return (
    <button
      type="button"
      className="btn-icon"
      aria-pressed={on}
      aria-label="Sound effects"
      title={on ? 'Sound effects on' : 'Sound effects off'}
      onClick={() => setSoundOn(!on)}
    >
      <Icon size={18} />
    </button>
  );
}
