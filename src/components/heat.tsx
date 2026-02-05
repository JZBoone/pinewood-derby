'use client';

import { activateHeat } from '@/client-biz/heat';
import { formatRaceTime } from '@/client-biz/time';
import { scaleMph } from '@/lib/car';
import { car, heat } from '@generated/client';
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
  const [status, setStatus] = React.useState(heat.status);
  const [isActivating, setIsActivating] = React.useState(false);

  React.useEffect(() => {
    setStatus(heat.status);
  }, [heat.status]);

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
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    if (status === 'active' || isActivating) {
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to activate heat ${heatNumber}?`
    );
    if (!confirmed) {
      return;
    }
    try {
      setIsActivating(true);
      await activateHeat(heat.derby_id, heat.id);
      setStatus('active');
    } finally {
      setIsActivating(false);
    }
  }

  return (
    <div
      className={`${status === 'active' ? 'active-heat' : ''}`}
      style={{ padding: '0.75rem' }}
    >
      <div className="flex items-center gap-3 mb-2 mt-4">
        <h2 className="text-2xl font-bold">Heat #{heatNumber}</h2>
        {status !== 'active' && (
          <button
            type="button"
            className="text-xl text-amber-500 hover:text-amber-600 transition-colors"
            onClick={handleActivateHeatClick}
            disabled={isActivating}
            aria-label={`Activate heat ${heatNumber}`}
            title={`Activate heat ${heatNumber}`}
          >
            {isActivating ? '⏳' : '🚦'}
          </button>
        )}
      </div>
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
