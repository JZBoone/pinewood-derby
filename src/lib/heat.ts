import { car, den, heat } from '@prisma/client';

export type GetDenHeatsResponse = {
  heats: heat[];
  den: den;
  cars: car[];
};

export type GetDerbyHeatsResponse = {
  heats: heat[];
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

export function averageTimeForCar(carId: number, heats: heat[]): number | null {
  const carTimes = heats
    .map((heat) => carTime(heat, carId))
    .filter((time): time is number => time !== null);
  if (carTimes.length === 0) {
    return null;
  }
  return carTimes.reduce((sum, time) => sum + time, 0) / carTimes.length;
}
