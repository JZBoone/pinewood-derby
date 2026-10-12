import { formatRaceTime } from '@/client-biz/time';
import { CarWithBestTime, scaleMphValue } from '@/lib/car';
import { den } from '@generated/client';
import PlaceMark from './place-mark';
import SpeedBadge from './speed-badge';

interface ResultsTableProps {
  cars: CarWithBestTime[];
  // Adds a Den column, for results that span dens.
  dens?: den[];
}

const headerCell = 'px-2 sm:px-3 pb-2.5 font-bold';

export default function ResultsTable({ cars, dens }: ResultsTableProps) {
  const denName = (car: CarWithBestTime) =>
    dens?.find((den) => den.id === car.den_id)?.name;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b-2 border-ink text-left text-[11px] tracking-[.1em] text-ink/65 uppercase">
          <th className={headerCell}>Place</th>
          <th className={headerCell}>Car</th>
          <th className={headerCell}>Scout</th>
          {dens && (
            <th className={`${headerCell} hidden sm:table-cell`}>Den</th>
          )}
          <th className={`${headerCell} text-right`}>Time</th>
          <th className={`${headerCell} hidden text-right sm:table-cell`}>
            Speed
          </th>
          <th className={`${headerCell} hidden sm:table-cell`}>Car name</th>
        </tr>
      </thead>
      <tbody>
        {cars.map((car, index) => {
          const place = car.best_time ? index + 1 : null;
          return (
            <tr
              key={car.id}
              className={`border-b border-divider transition-colors hover:bg-[color-mix(in_srgb,var(--cs-yellow)_10%,transparent)] ${
                place && place <= 3
                  ? 'bg-[color-mix(in_srgb,var(--cs-yellow)_7%,transparent)]'
                  : ''
              }`}
            >
              <td className="px-2 sm:px-3 py-3.5">
                {place ? <PlaceMark place={place} /> : null}
              </td>
              <td className="px-2 sm:px-3 py-3.5 font-(family-name:--font-heading) font-semibold tabular-nums">
                #{car.number}
              </td>
              <td className="px-2 sm:px-3 py-3.5 text-[17px]">
                {car.owner}
                {dens && (
                  <div className="text-[13px] text-ink/72 sm:hidden">
                    Den {denName(car)}
                  </div>
                )}
                {car.name && (
                  <div className="text-sm font-semibold italic sm:hidden">
                    {car.name}
                  </div>
                )}
              </td>
              {dens && (
                <td className="hidden px-2 sm:px-3 py-3.5 text-sm text-ink/72 sm:table-cell">
                  Den {denName(car)}
                </td>
              )}
              <td className="px-2 sm:px-3 py-3.5 text-right text-cs-time tabular-nums">
                {car.best_time ? (
                  <>
                    {formatRaceTime(car.best_time)}
                    {/* Phones have no Speed column, so speed rides under
                        the time. */}
                    <SpeedBadge
                      mph={scaleMphValue(car.best_time)}
                      fastest={place === 1}
                      className="mt-1.5 flex justify-end text-[15px] sm:hidden"
                    />
                  </>
                ) : (
                  <span className="text-ink/45">—</span>
                )}
              </td>
              <td className="hidden px-2 sm:px-3 py-3.5 text-right sm:table-cell">
                {car.best_time && (
                  <SpeedBadge
                    mph={scaleMphValue(car.best_time)}
                    fastest={place === 1}
                  />
                )}
              </td>
              <td className="hidden px-2 sm:px-3 py-3.5 font-semibold italic sm:table-cell">
                {car.name}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
