'use client';

import { car, heat } from '@prisma/client';
import { formatRaceTime } from '@/client-biz/time';
import { activateHeat } from './heat';

interface HeatProps {
  heat: heat;
  heatNumber: number;
  carsById: { [carId: number]: car };
}

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

  async function handleActivateHeatClick(event: React.MouseEvent<HTMLHeadingElement>) {
    if (!event.ctrlKey) {
      return;
    }
    await activateHeat(heat.derby_id, heat.id);
  }

  return (
    <div
      className={`text-2xl ${heat.status === 'active' ? 'active-heat' : ''}`}
      style={{ padding: '1rem' }}
    >
      <div></div>
      <h2
        className="den-name font-bold mb-2 mt-4 cursor-pointer"
        onClick={(e) => handleActivateHeatClick(e)}
      >
        Heat #{heatNumber}
      </h2>
      <div>
        Lane 1:{' '}
        {heat.lane_1_car_id &&
          `#${carsById[heat.lane_1_car_id]?.number} - ${carsById[heat.lane_1_car_id]?.owner}`}
        {heat.lane_1_car_time && (
          <span className="text-red-500">
            {' '}
            - {formatRaceTime(heat.lane_1_car_time)}
            {getWinnerEmoji(heat.lane_1_car_time)}
          </span>
        )}
      </div>
      <div>
        Lane 2:{' '}
        {heat.lane_2_car_id &&
          `#${carsById[heat.lane_2_car_id]?.number} - ${carsById[heat.lane_2_car_id]?.owner}`}
        {heat.lane_2_car_time && (
          <span className="text-red-500">
            {' '}
            - {formatRaceTime(heat.lane_2_car_time)}
            {getWinnerEmoji(heat.lane_2_car_time)}
          </span>
        )}
      </div>
      <div>
        Lane 3:{' '}
        {heat.lane_3_car_id &&
          `#${carsById[heat.lane_3_car_id]?.number} - ${carsById[heat.lane_3_car_id]?.owner}`}
        {heat.lane_3_car_time && (
          <span className="text-red-500">
            {' '}
            - {formatRaceTime(heat.lane_3_car_time)}
            {getWinnerEmoji(heat.lane_3_car_time)}
          </span>
        )}
      </div>
      <div>
        Lane 4:{' '}
        {heat.lane_4_car_id &&
          `#${carsById[heat.lane_4_car_id]?.number} - ${carsById[heat.lane_4_car_id]?.owner}`}
        {heat.lane_4_car_time && (
          <span className="text-red-500">
            {' '}
            - {formatRaceTime(heat.lane_4_car_time)}
            {getWinnerEmoji(heat.lane_4_car_time)}
          </span>
        )}
      </div>
      <div>
        Lane 5:{' '}
        {heat.lane_5_car_id &&
          `#${carsById[heat.lane_5_car_id]?.number} - ${carsById[heat.lane_5_car_id]?.owner}`}
        {heat.lane_5_car_time && (
          <span className="text-red-500">
            {' '}
            - {formatRaceTime(heat.lane_5_car_time)}
            {getWinnerEmoji(heat.lane_5_car_time)}
          </span>
        )}
      </div>
      <div>
        Lane 6:{' '}
        {heat.lane_6_car_id &&
          `#${carsById[heat.lane_6_car_id]?.number} - ${carsById[heat.lane_6_car_id]?.owner}`}
        {heat.lane_6_car_time && (
          <span className="text-red-500">
            {' '}
            - {formatRaceTime(heat.lane_6_car_time)}
            {getWinnerEmoji(heat.lane_6_car_time)}
          </span>
        )}
      </div>
    </div>
  );
}
