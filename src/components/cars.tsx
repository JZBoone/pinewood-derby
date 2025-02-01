'use client';

import { CarWithBestTime } from '@/lib/car';
import { formatRaceTime } from '@/client-biz/time';
import { den } from '@prisma/client';

interface CarsProps {
  cars: CarWithBestTime[];
  dens?: den[];
}

export function Cars({ cars, dens }: CarsProps) {
  return (
    <ul className="list-none p-0 text-2xl">
      {cars.map((car) => (
        <li key={car.id} className="flex">
          <span className="w-16">{`#${car.number}`}</span>
          <span className="flex-1" style={{ marginLeft: '8px' }}>
            {car.owner}{' '}
            {dens && `(den ${dens.find((den) => den.id === car.den_id)?.name})`}
          </span>
          <span
            className="w-24 text-xl text-red-500"
            style={{ marginLeft: '8px' }}
          >
            {car.best_time && formatRaceTime(car.best_time)}
          </span>
          <span
            className="w-24 text-xl text-blue-400"
            style={{ marginLeft: '8px' }}
          >
            {car.scale_mph && car.scale_mph}
          </span>
          <span className="name w-48 text-xl">{car.name || ''}</span>
          {dens && <span className="w-48 text-xl"></span>}
        </li>
      ))}
    </ul>
  );
}
