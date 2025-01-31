'use client';

import { CarWithAverageTime } from '@/lib/car';
import { formatRaceTime } from './time';

interface CarsListProps {
  cars: CarWithAverageTime[];
}

export function CarsList({ cars }: CarsListProps) {
  return (
    <ul className="cars-list list-none p-0 text-2xl">
      {cars.map((car) => (
        <li key={car.id} className="car flex">
          <span className="car-number w-16">{`#${car.number}`}</span>
          <span className="car-owner flex-1" style={{ marginLeft: '8px' }}>
            {car.owner}
          </span>
          <span
            className="average-time w-24 text-xl text-red-500"
            style={{ marginLeft: '8px' }}
          >
            {car.average_time && formatRaceTime(car.average_time)}
          </span>
          <span className="superlative w-48 text-xl">
            {car.superlative || ''}
          </span>
        </li>
      ))}
    </ul>
  );
}
