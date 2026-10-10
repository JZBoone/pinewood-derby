import { heat } from '@generated/client';
import { heatHasTimes, heatProgress } from './heat';

function makeHeat(overrides: Partial<heat> = {}): heat {
  return {
    id: 1,
    created_at: new Date(),
    den_id: 1,
    derby_id: 1,
    lane_1_car_id: 1,
    lane_2_car_id: 2,
    lane_3_car_id: null,
    lane_4_car_id: null,
    lane_5_car_id: null,
    lane_6_car_id: null,
    lane_1_car_time: null,
    lane_2_car_time: null,
    lane_3_car_time: null,
    lane_4_car_time: null,
    lane_5_car_time: null,
    lane_6_car_time: null,
    raced_at: null,
    status: 'inactive',
    ...overrides,
  };
}

describe('heatHasTimes', () => {
  test('it is true when any lane has a time', () => {
    expect(heatHasTimes(makeHeat({ lane_2_car_time: 2430 }))).toBe(true);
    expect(heatHasTimes(makeHeat())).toBe(false);
  });
});

describe('heatProgress', () => {
  test('it marks the first unrun heat as next when none is active', () => {
    const heats = [makeHeat({ lane_1_car_time: 2500 }), makeHeat(), makeHeat()];
    expect(heatProgress(heats)).toEqual(['final', 'next', 'scheduled']);
  });

  test('it prefers the active heat as next', () => {
    const heats = [makeHeat(), makeHeat(), makeHeat({ status: 'active' })];
    expect(heatProgress(heats)).toEqual(['scheduled', 'scheduled', 'next']);
  });

  test('it ignores an active heat that already has times', () => {
    const heats = [
      makeHeat({ status: 'active', lane_1_car_time: 2500 }),
      makeHeat(),
    ];
    expect(heatProgress(heats)).toEqual(['final', 'next']);
  });

  test('it has no next heat once every heat is final', () => {
    const heats = [makeHeat({ lane_1_car_time: 2500 })];
    expect(heatProgress(heats)).toEqual(['final']);
  });
});
