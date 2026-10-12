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

function isPhotoFinish(finishTimes: number[], finishers: number[]) {
  return (
    finishers.length > 1 &&
    finishTimes[finishers[1]] - finishTimes[finishers[0]] < 0.005
  );
}

/** Splits finishing order into cars that finished and cars that crashed. */
function splitResults(finishTimes: number[]) {
  const order = finishingOrder(finishTimes);
  return {
    finishers: order.filter((i) => Number.isFinite(finishTimes[i])),
    crashed: order.filter((i) => !Number.isFinite(finishTimes[i])),
  };
}

/**
 * The race result for the toast. A car that crashed has an infinite finish
 * time.
 */
export function raceSummary(
  numbers: string[],
  finishTimes: number[],
  distance: number
): string {
  const { finishers, crashed } = splitResults(finishTimes);
  const dnf = crashed
    .map((i) => ` Car #${numbers[i]} lost its wheels!`)
    .join('');
  if (finishers.length === 0) {
    return `Wheels off! Car #${numbers[crashed[0]]} is out of the race.`;
  }
  const winner = numbers[finishers[0]];
  const mph = raceSpeeds(finishTimes, distance)[finishers[0]];
  if (numbers.length === 1) {
    return `Car #${winner} hits ${mph} mph! Tap two or more cars to race them!`;
  }
  return isPhotoFinish(finishTimes, finishers)
    ? `Photo finish! Car #${winner} wins at ${mph} mph.${dnf}`
    : `Car #${winner} wins at ${mph} mph!${dnf}`;
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
  const { finishers, crashed } = splitResults(finishTimes);
  const dnf = crashed
    .map((i) => ` Car ${numbers[i]} lost its wheels!`)
    .join('');
  if (finishers.length === 0) {
    return `Oh no! Car ${numbers[crashed[0]]} lost its wheels!`;
  }
  const winner = numbers[finishers[0]];
  const mph = raceSpeeds(finishTimes, distance)[finishers[0]];
  if (numbers.length === 1) {
    return `Car ${winner} hits a top speed of ${mph} miles per hour!`;
  }
  return isPhotoFinish(finishTimes, finishers)
    ? `Photo finish! Car ${winner} wins with a top speed of ${mph} miles per hour!${dnf}`
    : `Car ${winner} wins with a top speed of ${mph} miles per hour!${dnf}`;
}

export type Crash = {
  // Index of the racer that loses its wheels.
  racer: number;
  // How far down the track the wheels pop off, always well before the finish.
  popAt: number;
  // How far the body skids after the wheels pop.
  stopDistance: number;
};

/** One race in three, one random car loses its wheels. */
export function rollCrash(
  racers: number,
  distance: number,
  random: () => number = Math.random
): Crash | null {
  if (racers === 0 || random() >= 1 / 3) {
    return null;
  }
  return {
    racer: Math.floor(random() * racers),
    popAt: distance * (0.3 + random() * 0.35),
    stopDistance: 70 + random() * 70,
  };
}

export type Wheel = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Spin in degrees.
  angle: number;
  bounces: number;
  age: number;
};

const WHEEL_GRAVITY = 720;
const MAX_BOUNCES = 2;
// Degrees of spin per unit traveled, for wheels on and off the car.
export const WHEEL_SPIN = 11.5;
export const WHEEL_FADE_AFTER = 1.2;
export const WHEEL_FADE_TIME = 0.5;

/**
 * Advances a wheel that popped off a car. It falls under gravity, slows
 * from air drag, and bounces off the ground at most twice.
 */
export function stepWheel(
  wheel: Wheel,
  dt: number,
  groundAt: (x: number) => number
): Wheel {
  let { x, y, vx, vy, bounces } = wheel;
  vy += WHEEL_GRAVITY * dt;
  vx *= 1 - 0.5 * dt;
  x += vx * dt;
  y += vy * dt;
  const ground = groundAt(x);
  if (y >= ground && vy > 0 && bounces < MAX_BOUNCES) {
    y = ground;
    vy = -vy * 0.38;
    vx *= 0.75;
    bounces += 1;
  }
  return {
    x,
    y,
    vx,
    vy,
    bounces,
    angle: wheel.angle + vx * dt * WHEEL_SPIN,
    age: wheel.age + dt,
  };
}
