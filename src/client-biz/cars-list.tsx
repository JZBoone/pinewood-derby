'use client';

import { CarWithAverageTime } from '@/lib/car';
import { formatRaceTime } from './time';
import { den } from '@prisma/client';

interface CarsListProps {
  cars: CarWithAverageTime[];
  dens?: den[];
}

export function CarsList({ cars, dens }: CarsListProps) {
  return (
    <ul className="cars-list list-none p-0 text-2xl">
      {cars.map((car) => (
        <li key={car.id} className="car flex">
          <span className="car-number w-16">{`#${car.number}`}</span>
          <span className="car-owner flex-1" style={{ marginLeft: '8px' }}>
            {car.owner}{' '}
            {dens && `(den ${dens.find((den) => den.id === car.den_id)?.name})`}
          </span>
          <span
            className="average-time w-24 text-xl text-red-500"
            style={{ marginLeft: '8px' }}
          >
            {car.average_time && formatRaceTime(car.average_time)}
          </span>
          <span className="name w-48 text-xl">{car.name || ''}</span>
          {dens && <span className="w-48 text-xl"></span>}
        </li>
      ))}
    </ul>
  );
}
