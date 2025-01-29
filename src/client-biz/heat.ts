import { GetHeatsResponse } from '@/lib/heat';
import axiosClient from './axios';
import { car, heat } from '@prisma/client';
import { isEqual } from 'lodash';

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

export async function fetchHeatsData(denId: string | number) {
  const response = await axiosClient.get<GetHeatsResponse>(
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
  const groupHeats: { cars: car[]; heats: heat[] }[] = [];
  for (const group of groups) {
    const _groupHeats = heats.filter((heat) =>
      isEqual(getHeatCars(heat), group)
    );
    groupHeats.push({
      cars: cars.filter((car) => group.includes(car.id)),
      heats: _groupHeats,
    });
  }
  return { groups: groupHeats, den, cars };
}

export type HeatsData = Awaited<ReturnType<typeof fetchHeatsData>>;
