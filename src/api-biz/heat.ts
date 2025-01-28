import { car, heat } from '@prisma/client';
import { db } from './db';

/**
 * Groups an array of cars into sub-arrays, each containing up to 6 cars.
 * The cars are distributed evenly across the groups.
 *
 * @param cars - An array of car objects to be grouped.
 * @returns An array of car arrays, where each sub-array represents a group of cars.
 */
export function groupCars(cars: car[]): car[][] {
  const numberOfGroups = Math.ceil(cars.length / 6);
  const groups: car[][] = [];
  for (let i = 0; i < numberOfGroups; i++) {
    groups.push([]);
  }
  let groupCursor = 0;
  for (const car of cars) {
    groups[groupCursor].push(car);
    groupCursor = (groupCursor + 1) % numberOfGroups;
  }
  return groups;
}

type Lane = 0 | 1 | 2 | 3 | 4 | 5;

const lanes: Lane[] = [0, 1, 2, 3, 4, 5];

type ConstraintsByCarId = Record<
  number,
  { lanes: Lane[]; laneNeighbors: [null | number, null | number][] }
>;

async function makeHeatWithContraints(params: {
  constraints: ConstraintsByCarId;
  cars: car[];
}): Promise<heat> {
  const { constraints, cars } = params;
  const laneCars: (null | number)[] = Array.from({ length: 6 }, () => null);
  for (const car of cars) {
    const carConstraints = constraints[car.id]!;
    const laneCandidates = lanes.filter(
      (lane) => !carConstraints.lanes.includes(lane) && laneCars[lane] === null
    );
    for (const laneCandidate of laneCandidates) {
      const laneCandidateNeighbors = [
        laneCars[laneCandidate - 1],
        laneCars[laneCandidate + 1],
      ];
      if (
        carConstraints.laneNeighbors.some(
          ([leftNeighbor, rightNeighbor]) =>
            leftNeighbor === laneCandidateNeighbors[0] &&
            rightNeighbor === laneCandidateNeighbors[1]
        )
      ) {
        continue;
      }
      laneCars[laneCandidate] = car.id;
    }
  }

  const heat = await db.heat.create({
    data: {
      created_at: new Date(),
      den_id: cars[0]!.den_id,
      lane_1_car_id: laneCars[0],
      lane_2_car_id: laneCars[1],
      lane_3_car_id: laneCars[2],
      lane_4_car_id: laneCars[3],
      lane_5_car_id: laneCars[4],
      lane_6_car_id: laneCars[5],
    },
  });
  cars.forEach((car) => {
    const carLane = laneCars.indexOf(car.id) as Lane;
    constraints[car.id]!.lanes.push(carLane);
    constraints[car.id]!.laneNeighbors.push([carLane - 1, carLane + 1]);
  });
  return heat;
}

export async function makeHeatsForGroup(cars: car[]): Promise<heat[]> {
  const heats: heat[] = [];
  const contraints: ConstraintsByCarId = {};
  cars.forEach((car) => {
    contraints[car.id] = { lanes: [], laneNeighbors: [] };
  });

  for (let i = 0; i < lanes.length; i++) {
    heats.push(await makeHeatWithContraints({ constraints: contraints, cars }));
  }
  return heats;
}
