// Sound effects for the easter eggs. They only play in response to a tap or
// key press, and visitors can mute them with the footer toggle.

const STORAGE_KEY = 'pack272-sound';
const CHANGE_EVENT = 'pack272:sound';

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // Without storage the choice lasts until the page reloads.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  if (!on) {
    playing.forEach((audio) => audio.pause());
  }
}

/** Calls onChange when the sound setting changes, for useSyncExternalStore. */
export function subscribeToSound(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

const playing = new Map<string, HTMLAudioElement>();
const primed = new Set<string>();

function audioFor(src: string) {
  let audio = playing.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    playing.set(src, audio);
  }
  return audio;
}

/**
 * Unlocks a sound that will play later, outside the tap that triggered it.
 * iOS Safari only lets an audio element play after it has started once
 * during a user gesture, so call this from the tap handler.
 */
export function primeSound(src: string) {
  if (primed.has(src) || !isSoundOn()) {
    return;
  }
  primed.add(src);
  const audio = audioFor(src);
  audio.muted = true;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
    })
    .catch(() => {})
    .finally(() => {
      audio.muted = false;
    });
}

/**
 * Plays a sound from the start, restarting it if it's already playing. Does
 * nothing when sound is muted.
 */
export function playSound(src: string, volume = 0.7) {
  if (!isSoundOn()) {
    return;
  }
  const audio = audioFor(src);
  audio.muted = false;
  audio.volume = volume;
  audio.currentTime = 0;
  // Browsers may still refuse; a silent failure is fine for an easter egg.
  audio.play().catch(() => {});
}
