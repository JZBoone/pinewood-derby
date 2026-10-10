import { CarWithBestTime } from '@/lib/car';
import { formatRaceDay } from '@/lib/derby';
import { heatProgress } from '@/lib/heat';
import { car, den, derby, heat } from '@generated/client';
import { keyBy } from 'lodash';
import type { ReactNode } from 'react';
import BackLink from './back-link';
import HeatCard from './heat-card';
import ResultsTable from './results-table';

interface HeatsViewProps {
  derby: derby;
  title: string;
  backHref: string;
  standings: CarWithBestTime[];
  dens: den[];
  heats: heat[];
  cars: car[];
  isAdminUser: boolean;
  adminActions?: ReactNode;
  onHeatActivated?: (heatId: heat['id']) => void;
}

export default function HeatsView({
  derby,
  title,
  backHref,
  standings,
  dens,
  heats,
  cars,
  isAdminUser,
  adminActions,
  onHeatActivated,
}: HeatsViewProps) {
  const progress = heatProgress(heats);
  const done = progress.filter((p) => p === 'final').length;
  const carsById = keyBy(cars, 'id');

  return (
    <>
      <BackLink href={backHref}>
        {new Date(derby.time).getFullYear()} derby
      </BackLink>
      <div className="text-xs font-bold tracking-[.14em] text-accent uppercase">
        {formatRaceDay(derby.time)} · {derby.location_name}
      </div>
      <h1 className="mt-2.5 text-[clamp(40px,7vw,64px)] leading-none font-bold tracking-[-.025em] font-stretch-118%">
        {title}
      </h1>
      <div className="mt-3.5 flex items-center gap-3 text-[15px] text-ink/72">
        <span className="tabular-nums">
          {done} of {heats.length} heats run
        </span>
        <span
          className="h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-divider"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={heats.length}
          aria-valuenow={done}
          aria-label="Heats run"
        >
          <span
            className="block h-full rounded-[3px] bg-cs-yellow"
            style={{
              width: `${heats.length ? (done / heats.length) * 100 : 0}%`,
            }}
          />
        </span>
      </div>

      <hr className="mt-10 mb-6 border-divider" />
      <h2 className="mb-3 text-[28px] font-semibold">Standings</h2>
      <ResultsTable cars={standings} dens={dens} />

      <hr className="mt-14 mb-6 border-divider" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[28px] font-semibold">Heats</h2>
        {adminActions}
      </div>
      {heats.length === 0 ? (
        <p className="text-ink/65">Heats haven&apos;t been generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(440px,1fr))]">
          {heats.map((heat, index) => (
            <HeatCard
              key={heat.id}
              heat={heat}
              heatNumber={index + 1}
              progress={progress[index]}
              carsById={carsById}
              isAdminUser={isAdminUser}
              onActivated={onHeatActivated}
            />
          ))}
        </div>
      )}
    </>
  );
}
