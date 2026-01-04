import { GetDenHeatsResponse, GetDerbyHeatsResponse } from '@/lib/heat';
import { isEqual } from 'lodash';
import { car, heat } from '../../prisma/generated/prisma/client';
import axiosClient from './axios';

function getHeatCars(heat: heat) {
  return [
    heat.lane_1_car_id,
    heat.lane_2_car_id,
    heat.lane_3_car_id,
    heat.lane_4_car_id,
    heat.lane_5_car_id,
    heat.lane_6_car_id,
  ]
    .filter((id) => id !== null)
    .sort();
}

function heatWinner(heat: heat): car['id'] | null {
  let winner: car['id'] | null = null;
  let bestTime = Infinity;
  if (heat.lane_1_car_time && heat.lane_1_car_time < bestTime) {
    winner = heat.lane_1_car_id;
    bestTime = heat.lane_1_car_time;
  }
  if (heat.lane_2_car_time && heat.lane_2_car_time < bestTime) {
    winner = heat.lane_2_car_id;
    bestTime = heat.lane_2_car_time;
  }
  if (heat.lane_3_car_time && heat.lane_3_car_time < bestTime) {
    winner = heat.lane_3_car_id;
    bestTime = heat.lane_3_car_time;
  }
  if (heat.lane_4_car_time && heat.lane_4_car_time < bestTime) {
    winner = heat.lane_4_car_id;
    bestTime = heat.lane_4_car_time;
  }
  if (heat.lane_5_car_time && heat.lane_5_car_time < bestTime) {
    winner = heat.lane_5_car_id;
    bestTime = heat.lane_5_car_time;
  }
  if (heat.lane_6_car_time && heat.lane_6_car_time < bestTime) {
    winner = heat.lane_6_car_id;
    bestTime = heat.lane_6_car_time;
  }
  return winner;
}

export async function fetchDenHeatsData(denId: string | number) {
  const response = await axiosClient.get<GetDenHeatsResponse>(
    `/api/den/heat?den_id=${denId}`
  );
  const { heats, cars, den } = response.data;
  const groups: car['id'][][] = [];
  for (const heat of heats) {
    const heatCars = getHeatCars(heat);
    if (!groups.some((g) => isEqual(g, heatCars))) {
      groups.push(heatCars);
    }
  }
  const groupHeats: {
    cars: car[];
    heats: (heat & { winner?: car['id'] | null })[];
  }[] = [];
  for (const group of groups) {
    const _groupHeats = heats.filter((heat) =>
      isEqual(getHeatCars(heat), group)
    );
    groupHeats.push({
      cars: cars.filter((car) => group.includes(car.id)),
      heats: _groupHeats.map((heat) => ({ ...heat, winner: heatWinner(heat) })),
    });
  }
  return { groups: groupHeats, den, cars };
}

export type DenHeatsData = Awaited<ReturnType<typeof fetchDenHeatsData>>;

export async function fetchDerbyHeats(derbyId: string | number) {
  const response = await axiosClient.get<GetDerbyHeatsResponse>(
    `/api/derby/heat?derby_id=${derbyId}`
  );

  const { heats } = response.data;
  return heats;
}

export function activateHeat(
  derbyId: string | number,
  heatId: string | number
) {
  return axiosClient.post(`/api/heat/activate`, {
    id: heatId,
    derby_id: derbyId,
  });
}

const randomTime = () => Number((Math.random() * 5 + 2).toFixed(3)) * 1000;

export async function postFakeTimes(derbyId: string | number) {
  const heats = await fetchDerbyHeats(derbyId);
  for (const heat of heats) {
    await activateHeat(derbyId, heat.id);
    const times: (number | null)[] = [];
    times.push(heat.lane_1_car_id ? randomTime() : null);
    times.push(heat.lane_2_car_id ? randomTime() : null);
    times.push(heat.lane_3_car_id ? randomTime() : null);
    times.push(heat.lane_4_car_id ? randomTime() : null);
    times.push(heat.lane_5_car_id ? randomTime() : null);
    times.push(heat.lane_6_car_id ? randomTime() : null);
    await axiosClient.post(`/api/heat`, {
      derby_id: derbyId,
      times,
    });
  }
}
