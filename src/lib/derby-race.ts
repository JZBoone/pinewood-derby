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

export function randomRacer(random: () => number = Math.random): Racer {
  return {
    accel: 260 + random() * 160,
    topSpeed: 400 + random() * 140,
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

export function raceSummary(numbers: string[], finishTimes: number[]): string {
  const order = finishingOrder(finishTimes);
  const winner = numbers[order[0]];
  if (order.length === 1) {
    return `Car #${winner} finishes in ${finishTimes[order[0]].toFixed(2)}s. Tap two or more cars to race them!`;
  }
  const margin = finishTimes[order[1]] - finishTimes[order[0]];
  return margin < 0.005
    ? `Photo finish! Car #${winner} wins by a nose.`
    : `Car #${winner} wins by ${margin.toFixed(2)}s!`;
}

/**
 * The race result as the robot announcer should say it: no "#" or "s"
 * abbreviations, which speech engines read out literally.
 */
export function raceAnnouncement(
  numbers: string[],
  finishTimes: number[]
): string {
  const order = finishingOrder(finishTimes);
  const winner = numbers[order[0]];
  if (order.length === 1) {
    return `Car ${winner} finishes in ${finishTimes[order[0]].toFixed(2)} seconds!`;
  }
  const margin = finishTimes[order[1]] - finishTimes[order[0]];
  return margin < 0.005
    ? `Photo finish! Car ${winner} wins by a nose!`
    : `Car ${winner} wins, by ${margin.toFixed(2)} seconds!`;
}
