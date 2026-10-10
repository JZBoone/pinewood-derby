import {
  finishingOrder,
  raceSummary,
  simulateRace,
  stepRacer,
} from './derby-race';

describe('stepRacer', () => {
  test('it accelerates up to top speed', () => {
    const racer = { accel: 100, topSpeed: 50 };
    const state = stepRacer(
      racer,
      { position: 0, speed: 0, finishedAt: null },
      1,
      0,
      1000
    );
    expect(state.speed).toBe(50);
    expect(state.finishedAt).toBeNull();
  });

  test('it records when the car crosses the finish line', () => {
    const racer = { accel: 0, topSpeed: 100 };
    const state = stepRacer(
      racer,
      { position: 90, speed: 100, finishedAt: null },
      0.2,
      1,
      100
    );
    expect(state.finishedAt).toBeCloseTo(1.1);
  });
});

describe('simulateRace', () => {
  test('a car with a higher top speed overtakes a quicker launcher', () => {
    const launcher = { accel: 600, topSpeed: 300 };
    const cruiser = { accel: 200, topSpeed: 600 };
    const short = simulateRace([launcher, cruiser], 60);
    const long = simulateRace([launcher, cruiser], 1200);
    expect(finishingOrder(short)).toEqual([0, 1]);
    expect(finishingOrder(long)).toEqual([1, 0]);
  });
});

describe('raceSummary', () => {
  test('it names the winner and the margin', () => {
    expect(raceSummary(['27', '2'], [1.9, 1.75])).toBe('Car #2 wins by 0.15s!');
  });

  test('it invites a lone car to race others', () => {
    expect(raceSummary(['72'], [1.84])).toBe(
      'Car #72 finishes in 1.84s. Tap two or more cars to race them!'
    );
  });

  test('it calls a photo finish', () => {
    expect(raceSummary(['27', '2'], [1.8, 1.801])).toBe(
      'Photo finish! Car #27 wins by a nose.'
    );
  });
});
