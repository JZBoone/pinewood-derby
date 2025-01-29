'use client';

import { car } from '@prisma/client';

interface CarsListProps {
  cars: car[];
}

export function CarsList({ cars }: CarsListProps) {
  return (
    <ul className="cars-list list-none p-0 text-2xl">
      {cars.map((car) => (
        <li key={car.id} className="car flex">
          <span className="car-number w-16">{`#${car.number}`}</span>
          <span className="car-owner flex-1">{car.owner}</span>
          <span className="superlative w-48 text-xl">
            {car.superlative || ''}
          </span>
        </li>
      ))}
    </ul>
  );
}
