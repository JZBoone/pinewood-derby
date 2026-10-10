interface PinewoodCarProps {
  color: string;
  // Position and size when nested inside another SVG.
  x?: number;
  y?: number;
  width?: number;
  number?: string;
  // Spin the wheels, for cars that are moving.
  rolling?: boolean;
  className?: string;
}

/**
 * A side-on pinewood derby car, drawn in a 120x48 box facing right.
 */
export default function PinewoodCar({
  color,
  number,
  rolling,
  className,
  x,
  y,
  width,
}: PinewoodCarProps) {
  const wheel = (cx: number) => (
    <g
      className={
        rolling ? 'motion-safe:animate-[wheel-spin_.4s_linear_infinite]' : ''
      }
      style={{ transformOrigin: `${cx}px 38px`, transformBox: 'view-box' }}
    >
      <circle cx={cx} cy={38} r={9} fill="#15214a" />
      <circle cx={cx} cy={38} r={4} fill="#c9ccd6" />
      <rect x={cx - 0.75} y={30} width={1.5} height={5} fill="#c9ccd6" />
    </g>
  );
  return (
    <svg
      viewBox="0 0 120 48"
      x={x}
      y={y}
      width={width}
      height={width && (width * 48) / 120}
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* Wedge body with a raised cockpit, like a block cut on a band saw. */}
      <path
        d="M6 34 L8 24 Q10 20 16 20 L44 18 L52 9 Q54 7 58 7 L74 7 Q78 7 80 10 L86 18 L110 22 Q116 23 116 29 L115 34 Z"
        fill={color}
        stroke="#15214a"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M56 10 L72 10 Q75 10 76 12 L80 18 L50 18 Z"
        fill="#bfe3f2"
        stroke="#15214a"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M14 27 L104 27"
        stroke="#fff"
        strokeOpacity={0.55}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="10 6"
      />
      {number && (
        <g>
          <circle
            cx={32}
            cy={26}
            r={7.5}
            fill="#fff"
            stroke="#15214a"
            strokeWidth={1.5}
          />
          <text
            x={32}
            y={29.2}
            textAnchor="middle"
            fontSize={number.length > 2 ? 7 : 9}
            fontWeight={700}
            fontFamily="var(--font-heading), sans-serif"
            fill="#15214a"
          >
            {number}
          </text>
        </g>
      )}
      {wheel(24)}
      {wheel(98)}
    </svg>
  );
}
