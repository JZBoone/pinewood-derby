// A robot announcer built on the browser's speech synthesis, the same
// system voice Minecraft's narrator uses. A low pitch gives it a robotic
// edge. Speech follows the sound effects mute toggle.

import { isSoundOn } from './sound';

const PREFERRED_VOICES =
  /Microsoft David|Microsoft Mark|Google US English|Fred|Alex|Daniel|Samantha/;

let voice: SpeechSynthesisVoice | null = null;
let primed = false;

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;
}

function pickVoice() {
  const voices = synth()?.getVoices() ?? [];
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  voice =
    english.find((v) => PREFERRED_VOICES.test(v.name)) ?? english[0] ?? null;
}

if (synth()) {
  pickVoice();
  synth()?.addEventListener?.('voiceschanged', pickVoice);
}

export function canSpeak(): boolean {
  return synth() !== null;
}

/**
 * Unlocks speech for later announcements. iOS only allows speech that first
 * started during a tap, so call this from the tap handler.
 */
export function primeRobotVoice() {
  const s = synth();
  if (!s || primed || !isSoundOn()) {
    return;
  }
  primed = true;
  const silent = new SpeechSynthesisUtterance(' ');
  silent.volume = 0;
  s.speak(silent);
}

/**
 * Says text in the robot voice, cutting off anything it was still saying.
 * Does nothing when sound is muted or the browser can't speak.
 */
export function speak(text: string) {
  const s = synth();
  if (!s || !isSoundOn() || !text.trim()) {
    return;
  }
  s.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  utterance.pitch = 0.4;
  utterance.rate = 0.92;
  s.speak(utterance);
}

/** Stops any speech in progress. */
export function stopSpeaking() {
  synth()?.cancel();
}
