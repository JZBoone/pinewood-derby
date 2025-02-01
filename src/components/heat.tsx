'use client';

import { car, heat } from '@prisma/client';
import { formatRaceTime } from '@/client-biz/time';
import { activateHeat } from '@/client-biz/heat';
import { scaleMph } from '@/lib/car';
import React from 'react';

interface HeatProps {
  heat: heat;
  heatNumber: number;
  carsById: { [carId: number]: car };
}

interface LaneProps {
  laneNumber: number;
  carId: number | null;
  carTime: number | null;
  carsById: { [carId: number]: car };
  getWinnerEmoji: (time: number | null) => string;
}

const Lane: React.FC<LaneProps> = ({
  laneNumber,
  carId,
  carTime,
  carsById,
  getWinnerEmoji,
}) => (
  <li className="flex">
    <span className="w-24">Lane {laneNumber}</span>
    <span className="flex-1" style={{ marginLeft: '8px' }}>
      {carId && `#${carsById[carId]?.number} - ${carsById[carId]?.owner}`}
    </span>
    <span className="w-24 text-xl text-red-500" style={{ marginLeft: '8px' }}>
      {carTime && formatRaceTime(carTime)}
    </span>
    <span className="w-24 text-xl text-blue-400" style={{ marginLeft: '8px' }}>
      {carTime && scaleMph(carTime)}
    </span>
    <span className="w-16">{getWinnerEmoji(carTime)}</span>
  </li>
);

export function Heat({ heat, carsById, heatNumber }: HeatProps) {
  const getWinnerEmoji = (time: number | null) => {
    return time ===
      Math.min(
        heat.lane_1_car_time || Infinity,
        heat.lane_2_car_time || Infinity,
        heat.lane_3_car_time || Infinity,
        heat.lane_4_car_time || Infinity,
        heat.lane_5_car_time || Infinity,
        heat.lane_6_car_time || Infinity
      )
      ? ' 🏆'
      : '';
  };

  async function handleActivateHeatClick(
    event: React.MouseEvent<HTMLHeadingElement>
  ) {
    if (!event.shiftKey) {
      return;
    }
    await activateHeat(heat.derby_id, heat.id);
  }

  return (
    <div
      className={`${heat.status === 'active' ? 'active-heat' : ''}`}
      style={{ padding: '0.75rem' }}
    >
      <h2
        className="text-2xl font-bold mb-2 mt-4"
        onClick={(e) => handleActivateHeatClick(e)}
      >
        Heat #{heatNumber}
      </h2>
      {[1, 2, 3, 4, 5, 6].map((laneNumber) => (
        <ul className="list-none p-0 text-2xl" key={laneNumber}>
          <Lane
            key={laneNumber}
            laneNumber={laneNumber}
            carId={
              heat[`lane_${laneNumber}_car_id` as keyof heat] as number | null
            }
            carTime={
              heat[`lane_${laneNumber}_car_time` as keyof heat] as number | null
            }
            carsById={carsById}
            getWinnerEmoji={getWinnerEmoji}
          />
        </ul>
      ))}
    </div>
  );
}
