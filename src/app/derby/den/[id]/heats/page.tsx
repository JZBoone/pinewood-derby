'use client';

import { useEffect, useState, use } from 'react';
import { get, keyBy } from 'lodash';
import { fetchDenHeatsData, DenHeatsData } from '@/client-biz/heat';
import { CarsList } from '@/client-biz/cars-list';
import BackButton from '@/client-biz/back-button';
import { car } from '@prisma/client';
import { formatRaceTime } from '@/client-biz/time';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Derby({ params }: Props) {
  const resolvedParams = use(params);
  const [heatsData, setHeatsData] = useState<DenHeatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDenHeatsData(resolvedParams.id);
        setHeatsData(data);
      } catch (err: unknown) {
        setError(`Oh no! Error loading heats: ${get(err, 'message')}`);
      } finally {
        setLoading(false);
      }
    }

    const interval = setInterval(async () => {
      await loadData();
    }, 1_000);

    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          {loading && 'Loading...'}
          {!loading && !error && !heatsData && 'Derby not found'}
          {error && 'Error loading derby'}
          {!loading && heatsData && `Den ${heatsData.den.name}`}
        </h1>
        {!loading &&
          heatsData &&
          heatsData.groups.map((group, i) => (
            <HeatGroup
              key={i}
              group={group}
              groupNumber={i + 1}
              carsById={keyBy(heatsData.cars, 'id')}
            />
          ))}
      </main>
      <BackButton></BackButton>
    </div>
  );
}

interface HeatGroupProps {
  group: DenHeatsData['groups'][number];
  groupNumber: number;
  carsById: { [carId: number]: car };
}

function HeatGroup({ group, groupNumber, carsById }: HeatGroupProps) {
  return (
    <div className="mb-4">
      <h2 className="den-name text-2xl font-bold mb-2 mt-4">
        Group {groupNumber}
      </h2>
      <ul className="list-none p-0 text-2xl">
        {<CarsList cars={group.cars} />}
      </ul>
      {group.heats.map((heat, heatIndex) => (
        <Heat
          key={heat.id}
          heat={heat}
          carsById={carsById}
          heatNumber={heatIndex + 1}
        />
      ))}
    </div>
  );
}

interface HeatProps {
  heat: DenHeatsData['groups'][number]['heats'][number];
  heatNumber: number;
  carsById: { [carId: number]: car };
}

function Heat({ heat, carsById, heatNumber }: HeatProps) {
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

  return (
    <div className="text-2xl">
      <h2
        className="den-name font-bold mb-2 mt-4 cursor-pointer"
        onClick={() => navigator.clipboard.writeText(heat.id.toString())}
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
