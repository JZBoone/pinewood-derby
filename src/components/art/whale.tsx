interface WhaleProps {
  className?: string;
  // Puff a water spout from the blowhole.
  spouting?: boolean;
}

/**
 * A friendly whale for the Williams Whales, drawn facing right.
 */
export default function Whale({ className, spouting }: WhaleProps) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden>
      {spouting && (
        <g
          className="motion-safe:animate-[whale-spout_1.2s_ease-out_infinite]"
          style={{ transformOrigin: '104px 34px', transformBox: 'view-box' }}
        >
          <path
            d="M104 34 C100 22 92 16 86 18 M104 34 C104 20 104 12 104 8 M104 34 C108 22 116 16 122 18"
            fill="none"
            stroke="#7fb5de"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <circle cx={84} cy={16} r={3.5} fill="#7fb5de" />
          <circle cx={104} cy={6} r={3.5} fill="#7fb5de" />
          <circle cx={124} cy={16} r={3.5} fill="#7fb5de" />
        </g>
      )}
      {/* Tail. */}
      <path
        d="M30 60 C20 56 12 44 4 40 C10 52 10 60 6 70 C16 66 24 66 32 68 Z"
        fill="#3b6fd1"
        stroke="#15214a"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* Body with a pale belly. */}
      <path
        d="M28 62 C34 40 62 30 96 32 C132 34 154 50 154 68 C154 84 136 92 104 92 C70 92 40 86 28 62 Z"
        fill="#3b6fd1"
        stroke="#15214a"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M60 80 C80 90 120 92 146 78 C140 88 124 92 104 92 C84 92 70 88 60 80 Z"
        fill="#bfe3f2"
      />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${88 + i * 12} 84 L${92 + i * 12} 91`}
          stroke="#7fb5de"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
      {/* Flipper, eye, smile and a rosy cheek. */}
      <path
        d="M92 74 C88 84 80 88 74 86 C78 80 84 74 92 74 Z"
        fill="#2a56aa"
        stroke="#15214a"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={130} cy={58} r={4} fill="#15214a" />
      <circle cx={131.5} cy={56.5} r={1.4} fill="#fff" />
      <path
        d="M120 70 C128 76 138 76 146 70"
        fill="none"
        stroke="#15214a"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={140} cy={66} r={4} fill="#c62232" fillOpacity={0.35} />
    </svg>
  );
}
