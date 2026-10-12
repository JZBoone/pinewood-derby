// Scale speeds top out around 250 mph, so the dial runs to 300.
const DIAL_MAX = 300;

interface SpeedBadgeProps {
  mph: number;
  // Adds speed streaks for the fastest car in a table or heat.
  fastest?: boolean;
  className?: string;
}

/**
 * A car's scale speed as a tiny speedometer, whose needle sweeps up to the
 * speed when it first appears, plus the number in mph.
 */
export default function SpeedBadge({
  mph,
  fastest,
  className,
}: SpeedBadgeProps) {
  const fraction = Math.min(Math.max(mph / DIAL_MAX, 0), 1);
  const theta = Math.PI * (1 - fraction);
  const arcEnd = { x: 12 + 10 * Math.cos(theta), y: 13 - 10 * Math.sin(theta) };
  const needle = -90 + 180 * fraction;
  const rounded = Math.round(mph);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-cs-mph ${className ?? ''}`}
      title={fastest ? 'Top speed' : undefined}
    >
      {fastest && (
        <svg viewBox="0 0 14 12" className="h-3 w-3.5" aria-hidden>
          {[2, 6, 10].map((y, i) => (
            <line
              key={y}
              x1={i === 1 ? 0 : 4}
              y1={y}
              x2={13}
              y2={y}
              stroke="var(--cs-yellow)"
              strokeWidth={2}
              strokeLinecap="round"
              className="motion-safe:animate-[speed-streak_.9s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </svg>
      )}
      <svg viewBox="0 0 24 15" className="h-[15px] w-6 shrink-0" aria-hidden>
        <path
          d="M2 13 A10 10 0 0 1 22 13"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path
          d={`M2 13 A10 10 0 0 1 ${arcEnd.x.toFixed(2)} ${arcEnd.y.toFixed(2)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={12}
          y1={13}
          x2={12}
          y2={5}
          stroke="var(--cs-red)"
          strokeWidth={1.8}
          strokeLinecap="round"
          className="motion-safe:animate-[needle-sweep_.9s_cubic-bezier(.3,1.4,.5,1)]"
          style={{
            transform: `rotate(${needle}deg)`,
            transformOrigin: '12px 13px',
            transformBox: 'view-box',
          }}
        />
        <circle cx={12} cy={13} r={1.8} fill="currentColor" />
      </svg>
      <span className="font-(family-name:--font-heading) text-[1.05em] leading-none font-bold tabular-nums">
        {rounded}
      </span>
      <span className="text-[10px] leading-none font-bold tracking-[.08em] uppercase opacity-80">
        mph
      </span>
    </span>
  );
}
