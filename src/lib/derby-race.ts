import { scaleMphValue } from './car';

// Physics for the homepage track race. Distances are in SVG units along the
// track and times are in seconds.

export type Racer = {
  // How hard the car launches off the gate.
  accel: number;
  // The fastest it can roll. A quick launcher can be caught by a car with a
  // higher top speed, so races have lead changes.
  topSpeed: number;
};

export type RacerState = {
  position: number;
  speed: number;
  finishedAt: number | null;
};

const BRAKING = 1800;

// The slowest and fastest cars randomRacer can roll.
const SLOWEST: Racer = { accel: 260, topSpeed: 400 };
const FASTEST: Racer = { accel: 420, topSpeed: 540 };

export function randomRacer(random: () => number = Math.random): Racer {
  return {
    accel: SLOWEST.accel + random() * (FASTEST.accel - SLOWEST.accel),
    topSpeed:
      SLOWEST.topSpeed + random() * (FASTEST.topSpeed - SLOWEST.topSpeed),
  };
}

/**
 * Advances one car by dt seconds. A car finishes when its position reaches
 * finishLine, then brakes to a stop.
 */
export function stepRacer(
  racer: Racer,
  state: RacerState,
  dt: number,
  elapsed: number,
  finishLine: number
): RacerState {
  if (state.finishedAt !== null) {
    const speed = Math.max(0, state.speed - BRAKING * dt);
    return { ...state, speed, position: state.position + speed * dt };
  }
  const speed = Math.min(racer.topSpeed, state.speed + racer.accel * dt);
  const position = state.position + speed * dt;
  if (position < finishLine) {
    return { position, speed, finishedAt: null };
  }
  // Interpolate the crossing time within this step for a fair photo finish.
  const overshoot = (position - finishLine) / Math.max(speed, 1);
  return { position, speed, finishedAt: elapsed + dt - overshoot };
}

export function isStopped(state: RacerState): boolean {
  return state.finishedAt !== null && state.speed === 0;
}

/** Runs a whole race at once and returns each car's finish time. */
export function simulateRace(
  racers: Racer[],
  distance: number,
  dt = 1 / 120
): number[] {
  let states: RacerState[] = racers.map(() => ({
    position: 0,
    speed: 0,
    finishedAt: null,
  }));
  let elapsed = 0;
  while (states.some((state) => state.finishedAt === null) && elapsed < 30) {
    states = states.map((state, i) =>
      stepRacer(racers[i], state, dt, elapsed, distance)
    );
    elapsed += dt;
  }
  return states.map((state) => state.finishedAt ?? Infinity);
}

/** Car indexes in finishing order, fastest first. */
export function finishingOrder(finishTimes: number[]): number[] {
  return finishTimes
    .map((time, index) => ({ time, index }))
    .sort((a, b) => a.time - b.time)
    .map(({ index }) => index);
}

// Real runs on the pack's track, from last year's standings: the winner ran
// about 2.38s (251 mph). The slowest homepage car maps to 2.55s (234 mph).
const REAL_FASTEST_MS = 2380;
const REAL_SLOWEST_MS = 2550;

/**
 * Converts homepage race finish times into scale speeds like the real
 * track's, so a toy winner lands among real cars. The fastest possible car
 * on this track gets REAL_FASTEST_MS and the slowest gets REAL_SLOWEST_MS.
 */
export function raceSpeeds(finishTimes: number[], distance: number): number[] {
  const [fastest, slowest] = simulateRace([FASTEST, SLOWEST], distance);
  return finishTimes.map((time) => {
    const k = Math.min(Math.max((time - fastest) / (slowest - fastest), 0), 1);
    const realMs = REAL_FASTEST_MS + k * (REAL_SLOWEST_MS - REAL_FASTEST_MS);
    return Math.round(scaleMphValue(realMs));
  });
}

function isPhotoFinish(finishTimes: number[], order: number[]) {
  return (
    order.length > 1 && finishTimes[order[1]] - finishTimes[order[0]] < 0.005
  );
}

export function raceSummary(
  numbers: string[],
  finishTimes: number[],
  distance: number
): string {
  const order = finishingOrder(finishTimes);
  const winner = numbers[order[0]];
  const mph = raceSpeeds(finishTimes, distance)[order[0]];
  if (order.length === 1) {
    return `Car #${winner} hits ${mph} mph! Tap two or more cars to race them!`;
  }
  return isPhotoFinish(finishTimes, order)
    ? `Photo finish! Car #${winner} wins at ${mph} mph.`
    : `Car #${winner} wins at ${mph} mph!`;
}

/**
 * The race result as the robot announcer should say it: no "#" or "mph"
 * abbreviations, which speech engines read out literally.
 */
export function raceAnnouncement(
  numbers: string[],
  finishTimes: number[],
  distance: number
): string {
  const order = finishingOrder(finishTimes);
  const winner = numbers[order[0]];
  const mph = raceSpeeds(finishTimes, distance)[order[0]];
  if (order.length === 1) {
    return `Car ${winner} hits a top speed of ${mph} miles per hour!`;
  }
  return isPhotoFinish(finishTimes, order)
    ? `Photo finish! Car ${winner} wins with a top speed of ${mph} miles per hour!`
    : `Car ${winner} wins with a top speed of ${mph} miles per hour!`;
}
