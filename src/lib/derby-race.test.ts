import {
  finishingOrder,
  rollCrash,
  stepWheel,
  raceAnnouncement,
  raceSpeeds,
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

// The homepage track's gate-to-finish distance.
const DISTANCE = 528;

describe('raceSpeeds', () => {
  test('it maps race times onto real track speeds', () => {
    const [fastest, slowest] = simulateRace(
      [
        { accel: 420, topSpeed: 540 },
        { accel: 260, topSpeed: 400 },
      ],
      DISTANCE
    );
    // 2.38s and 2.55s on the real track.
    expect(raceSpeeds([fastest, slowest], DISTANCE)).toEqual([251, 234]);
  });

  test('a faster race time is a higher speed', () => {
    const [a, b] = raceSpeeds([1.7, 1.9], DISTANCE);
    expect(a).toBeGreaterThan(b);
  });
});

describe('raceSummary', () => {
  test('it names the winner and their speed', () => {
    expect(raceSummary(['27', '2'], [1.9, 1.75], DISTANCE)).toMatch(
      /^Car #2 wins at \d{3} mph!$/
    );
  });

  test('it invites a lone car to race others', () => {
    expect(raceSummary(['72'], [1.84], DISTANCE)).toMatch(
      /^Car #72 hits \d{3} mph! Tap two or more cars to race them!$/
    );
  });

  test('it calls a photo finish', () => {
    expect(raceSummary(['27', '2'], [1.8, 1.801], DISTANCE)).toMatch(
      /^Photo finish! Car #27 wins at \d{3} mph\.$/
    );
  });
});

describe('raceAnnouncement', () => {
  test('it says the top speed in words the robot voice reads well', () => {
    expect(raceAnnouncement(['27', '2'], [1.75, 1.9], DISTANCE)).toMatch(
      /^Car 27 wins with a top speed of \d{3} miles per hour!$/
    );
    expect(raceAnnouncement(['72'], [1.84], DISTANCE)).toMatch(
      /^Car 72 hits a top speed of \d{3} miles per hour!$/
    );
  });
});

describe('crashes', () => {
  test('a crashed car is a DNF and the others still win', () => {
    expect(raceSummary(['27', '2'], [Infinity, 1.8], DISTANCE)).toMatch(
      /^Car #2 wins at \d{3} mph! Car #27 lost its wheels!$/
    );
    expect(raceAnnouncement(['27', '2'], [Infinity, 1.8], DISTANCE)).toMatch(
      /^Car 2 wins with a top speed of \d{3} miles per hour! Car 27 lost its wheels!$/
    );
  });

  test('a lone car can crash out', () => {
    expect(raceSummary(['72'], [Infinity], DISTANCE)).toBe(
      'Wheels off! Car #72 is out of the race.'
    );
    expect(raceAnnouncement(['72'], [Infinity], DISTANCE)).toBe(
      'Oh no! Car 72 lost its wheels!'
    );
  });

  test('about one race in three has a crash, popping before the finish', () => {
    let seed = 1;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const crashes = Array.from({ length: 3000 }, () =>
      rollCrash(3, DISTANCE, random)
    ).filter((crash) => crash !== null);
    expect(crashes.length / 3000).toBeGreaterThan(0.3);
    expect(crashes.length / 3000).toBeLessThan(0.37);
    for (const crash of crashes) {
      expect(crash.racer).toBeGreaterThanOrEqual(0);
      expect(crash.racer).toBeLessThan(3);
      expect(crash.popAt).toBeLessThan(DISTANCE * 0.7);
    }
  });

  test('a popped wheel bounces at most twice', () => {
    let wheel = { x: 0, y: 0, vx: 200, vy: -200, angle: 0, bounces: 0, age: 0 };
    for (let i = 0; i < 600; i++) {
      wheel = stepWheel(wheel, 1 / 120, () => 20);
    }
    expect(wheel.bounces).toBe(2);
    expect(wheel.y).toBeGreaterThan(20);
    expect(wheel.angle).toBeGreaterThan(0);
  });
});
