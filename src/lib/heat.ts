import { car, den, heat } from '@generated/client';

export type GetDenHeatsResponse = {
  heats: heat[];
  den: den;
  cars: car[];
};

export type GetDerbyHeatsResponse = {
  heats: heat[];
};

export type PostHeatRequestBody = {
  id: heat['id'];
  times: (number | null)[];
};

export function carTime(heat: heat, carId: car['id']): number | null {
  if (heat.lane_1_car_id === carId) {
    return heat.lane_1_car_time;
  }
  if (heat.lane_2_car_id === carId) {
    return heat.lane_2_car_time;
  }
  if (heat.lane_3_car_id === carId) {
    return heat.lane_3_car_time;
  }
  if (heat.lane_4_car_id === carId) {
    return heat.lane_4_car_time;
  }
  if (heat.lane_5_car_id === carId) {
    return heat.lane_5_car_time;
  }
  if (heat.lane_6_car_id === carId) {
    return heat.lane_6_car_time;
  }
  return null;
}

export function heatHasTimes(heat: heat): boolean {
  return [
    heat.lane_1_car_time,
    heat.lane_2_car_time,
    heat.lane_3_car_time,
    heat.lane_4_car_time,
    heat.lane_5_car_time,
    heat.lane_6_car_time,
  ].some((time) => time !== null);
}

export type HeatProgress = 'final' | 'next' | 'scheduled';

/**
 * Labels each heat, in race order. A heat with recorded times is final. The
 * active heat is up next, or failing that the first heat without times.
 */
export function heatProgress(heats: heat[]): HeatProgress[] {
  const finals = heats.map(heatHasTimes);
  let nextIndex = heats.findIndex(
    (heat, index) => heat.status === 'active' && !finals[index]
  );
  if (nextIndex === -1) {
    nextIndex = finals.indexOf(false);
  }
  return heats.map((_, index) => {
    if (finals[index]) {
      return 'final';
    }
    return index === nextIndex ? 'next' : 'scheduled';
  });
}

export function bestTimeForCar(carId: number, heats: heat[]): number | null {
  const carTimes = heats
    .map((heat) => carTime(heat, carId))
    .filter((time): time is number => time !== null);
  if (carTimes.length === 0) {
    return null;
  }
  return Math.min(...carTimes);
}

/**
 * Only one heat in a derby should be active at a time.
 */
export type HeatStatus = 'inactive' | 'active';
