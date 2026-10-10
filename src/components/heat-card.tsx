'use client';

import { activateHeat } from '@/client-biz/heat';
import { formatRaceTime } from '@/client-biz/time';
import { scaleMph } from '@/lib/car';
import { HeatProgress } from '@/lib/heat';
import { car, heat } from '@generated/client';
import { Timer, Trophy } from 'lucide-react';
import { useState } from 'react';
import Button from './button';

const LANES = [1, 2, 3, 4, 5, 6] as const;

const TAGS: Record<HeatProgress, { label: string; className: string }> = {
  final: { label: 'Final', className: 'border border-divider text-ink/65' },
  next: { label: 'Up next', className: 'border border-accent text-accent' },
  scheduled: { label: 'Scheduled', className: 'text-ink/55' },
};

interface HeatCardProps {
  heat: heat;
  heatNumber: number;
  progress: HeatProgress;
  carsById: Record<number, car>;
  isAdminUser?: boolean;
  onActivated?: (heatId: heat['id']) => void;
}

export default function HeatCard({
  heat,
  heatNumber,
  progress,
  carsById,
  isAdminUser = false,
  onActivated,
}: HeatCardProps) {
  const [activating, setActivating] = useState(false);
  const lanes = LANES.map((lane) => ({
    lane,
    carId: heat[`lane_${lane}_car_id`],
    time: heat[`lane_${lane}_car_time`],
  })).filter((lane) => lane.carId !== null);
  const times = lanes
    .map((lane) => lane.time)
    .filter((time): time is number => time !== null);
  const winningTime =
    progress === 'final' && times.length > 0 ? Math.min(...times) : null;
  const tag = TAGS[progress];

  async function handleActivate() {
    if (!window.confirm(`Activate heat ${heatNumber}?`)) {
      return;
    }
    setActivating(true);
    try {
      await activateHeat(heat.derby_id, heat.id);
      onActivated?.(heat.id);
    } finally {
      setActivating(false);
    }
  }

  return (
    <article
      className={`overflow-hidden rounded-md border border-divider bg-surface ${
        progress === 'next' ? 'border-t-0' : ''
      }`}
      aria-label={`Heat ${heatNumber}`}
    >
      {progress === 'next' && (
        <div className="h-1.5 bg-[repeating-linear-gradient(90deg,var(--cs-yellow)_0_24px,transparent_24px_34px)]" />
      )}
      <header className="flex items-center justify-between gap-3 border-b border-divider px-[18px] py-3.5">
        <h3 className="text-xl font-semibold tabular-nums">
          Heat {heatNumber}
        </h3>
        <div className="flex items-center gap-2">
          {isAdminUser && progress !== 'final' && heat.status !== 'active' && (
            <Button
              variant="ghost"
              icon={Timer}
              className="px-2.5 py-1.5"
              onClick={handleActivate}
              disabled={activating}
            >
              {activating ? 'Activating…' : 'Activate heat'}
            </Button>
          )}
          <span
            className={`rounded-[3px] px-2 py-[3px] text-[11px] font-bold tracking-[.1em] uppercase ${tag.className}`}
          >
            {tag.label}
          </span>
        </div>
      </header>
      <table className="w-full border-collapse text-base">
        <thead className="sr-only sm:not-sr-only">
          <tr className="text-left text-[11px] tracking-[.1em] text-ink/55 uppercase">
            <th className="px-[18px] pt-2.5 pb-1 font-bold">Lane</th>
            <th className="px-2 pt-2.5 pb-1 font-bold">Car and scout</th>
            <th className="px-2 pt-2.5 pb-1 text-right font-bold">Time</th>
            <th className="hidden px-2 pt-2.5 pb-1 text-right font-bold sm:table-cell">
              Speed
            </th>
            <th className="w-6 pr-[18px]">
              <span className="sr-only">Winner</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {lanes.map(({ lane, carId, time }) => {
            const car = carId !== null ? carsById[carId] : undefined;
            const winner = winningTime !== null && time === winningTime;
            return (
              <tr
                key={lane}
                className={`border-b border-divider last:border-b-0 ${
                  winner
                    ? 'bg-[color-mix(in_srgb,var(--cs-yellow)_12%,transparent)]'
                    : ''
                }`}
              >
                <td className="py-2.5 pr-2 pl-[18px]">
                  <span className="inline-flex size-[26px] items-center justify-center rounded-full border-[1.5px] border-divider font-(family-name:--font-heading) text-sm font-semibold tabular-nums">
                    {lane}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <span className="inline-block min-w-14 font-(family-name:--font-heading) font-semibold tabular-nums">
                    #{car?.number}
                  </span>
                  {car?.owner}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums">
                  {time !== null ? (
                    <span className="text-cs-time">{formatRaceTime(time)}</span>
                  ) : (
                    <span className="text-ink/45">—</span>
                  )}
                </td>
                <td className="hidden px-2 py-2.5 text-right text-cs-mph tabular-nums sm:table-cell">
                  {time !== null
                    ? scaleMph(time)
                    : progress === 'final' && (
                        <span className="text-[11px] text-ink/55">No time</span>
                      )}
                </td>
                <td className="w-6 py-2.5 pr-[18px]">
                  {winner && (
                    <Trophy
                      size={16}
                      strokeWidth={1.75}
                      className="text-accent"
                      aria-label="Heat winner"
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}
