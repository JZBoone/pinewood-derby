import { car, heat } from '@prisma/client';
import { shuffle } from 'lodash';
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

export type Lane = 0 | 1 | 2 | 3 | 4 | 5;

export const lanes: Lane[] = [0, 1, 2, 3, 4, 5];

export type LaneNeighbors = [number | null, number | null];

type LaneNeighborsByLane = {
  [carId: number]: { [lane: number]: LaneNeighbors };
};

type LaneCar = car['id'] | null;

function bothNeighborsMatch(
  neighbors1: LaneNeighbors,
  neighbors2: LaneNeighbors
) {
  if ([...neighbors1, ...neighbors2].includes(null)) {
    return false;
  }
  return neighbors1[0] === neighbors2[0] && neighbors1[1] === neighbors2[1];
}
/**
 * Checks if placing a car in a lane would break a neighbor constraint.
 */
export function breaksNeighborConstraint(params: {
  laneCars: LaneCar[];
  laneIndex: number;
  car: number;
  laneNeighborsByLaneMap: LaneNeighborsByLane;
}): boolean {
  const { laneIndex, car, laneNeighborsByLaneMap } = params;
  const leftNeighbor = laneIndex > 0 ? params.laneCars[laneIndex - 1] : null;
  const rightNeighbor = laneIndex < 5 ? params.laneCars[laneIndex + 1] : null;

  if (leftNeighbor !== null) {
    const leftNeighborLaneNeighborsByLane =
      laneNeighborsByLaneMap[leftNeighbor];
    const updatedLeftLaneNeighbors: LaneNeighbors = [
      leftNeighborLaneNeighborsByLane[laneIndex - 1][0],
      car,
    ];
    if (
      Object.entries(leftNeighborLaneNeighborsByLane).some(
        ([lane, neighbors]) => {
          if (+lane === laneIndex - 1) {
            return false;
          }
          return bothNeighborsMatch(neighbors, updatedLeftLaneNeighbors);
        }
      )
    ) {
      return true;
    }
  }
  if (rightNeighbor !== null) {
    const rightNeighborLaneNeighborsByLane =
      laneNeighborsByLaneMap[rightNeighbor];
    const updatedRightLaneNeighbors: LaneNeighbors = [
      car,
      rightNeighborLaneNeighborsByLane[laneIndex + 1][1],
    ];
    if (
      Object.entries(rightNeighborLaneNeighborsByLane).some(
        ([lane, neighbors]) => {
          if (+lane === laneIndex + 1) {
            return false;
          }
          return bothNeighborsMatch(neighbors, updatedRightLaneNeighbors);
        }
      )
    ) {
      return true;
    }
  }
  return false;
}

function makeHeatLanesWithConstraints(params: {
  laneNeighborsByLaneMap: LaneNeighborsByLane;
  cars: car[];
}): LaneCar[] {
  const { laneNeighborsByLaneMap, cars } = params;
  const laneCars: (number | null)[] = Array.from({ length: 6 }, () => null);

  const shuffledLanes = shuffle(lanes);
  const shuffledCars = shuffle(cars);

  for (
    let shuffledLaneIndex = 0;
    shuffledLaneIndex < lanes.length;
    shuffledLaneIndex++
  ) {
    const laneIndex = shuffledLanes[shuffledLaneIndex];
    const selectedCar = shuffledCars.find((car) => {
      if (laneCars.indexOf(car.id) !== -1) {
        // the car has already been placed in a lane for this heat
        return false;
      }
      const laneNeighborsByLane = laneNeighborsByLaneMap[car.id];
      if (laneNeighborsByLane[laneIndex] !== undefined) {
        return false;
      }
      if (
        breaksNeighborConstraint({
          laneCars,
          laneIndex,
          car: car.id,
          laneNeighborsByLaneMap,
        })
      ) {
        // placing this car would break a neighbor constraint
        return false;
      }
      return true;
    });
    if (!selectedCar) {
      continue;
    }
    const selectedCarLaneNeighborsByLane =
      laneNeighborsByLaneMap[selectedCar.id];
    laneCars[laneIndex] = selectedCar.id;
    const leftNeighbor = laneIndex > 0 ? laneCars[laneIndex - 1] || null : null;
    const rightNeighbor =
      laneIndex < 5 ? laneCars[laneIndex + 1] || null : null;
    selectedCarLaneNeighborsByLane[laneIndex] = [leftNeighbor, rightNeighbor];
    // after placing the selected car we might need to update the neighbors
    // of previously selected cars
    if (leftNeighbor !== null) {
      const leftNeighborLaneNeighbors =
        laneNeighborsByLaneMap[leftNeighbor][laneIndex - 1];
      leftNeighborLaneNeighbors[1] = selectedCar.id;
    }
    if (rightNeighbor !== null) {
      const rightNeighborLaneNeighbors =
        laneNeighborsByLaneMap[rightNeighbor][laneIndex + 1];
      rightNeighborLaneNeighbors[0] = selectedCar.id;
    }
    if (laneCars.filter((laneCar) => laneCar !== null).length === cars.length) {
      break;
    }
  }
  // bad luck, try again
  if (laneCars.filter((laneCar) => laneCar !== null).length !== cars.length) {
    return makeHeatLanesWithConstraints(params);
  }
  return laneCars;
}

async function makeHeatWithContraints(params: {
  laneNeighborsByLaneMap: LaneNeighborsByLane;
  cars: car[];
}): Promise<heat> {
  const laneCars = makeHeatLanesWithConstraints(params);
  const { cars } = params;

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
  return heat;
}

export async function makeHeatsForGroup(cars: car[]): Promise<heat[]> {
  const heats: heat[] = [];
  const laneNeighborsByLaneMap: LaneNeighborsByLane = {};
  cars.forEach((car) => {
    laneNeighborsByLaneMap[car.id] = {};
  });

  for (let i = 0; i < lanes.length; i++) {
    heats.push(await makeHeatWithContraints({ laneNeighborsByLaneMap, cars }));
  }
  return heats;
}
