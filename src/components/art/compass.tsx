'use client';

import { useEffect, useRef } from 'react';

/**
 * A pocket compass whose needle points at the visitor's cursor.
 */
export default function Compass({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let frame = 0;
    function handlePointerMove(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = ref.current;
        const needle = needleRef.current;
        if (!svg || !needle) {
          return;
        }
        const box = svg.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        needle.style.transform = `rotate(${degrees}deg)`;
      });
    }
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <svg ref={ref} viewBox="0 0 64 64" className={className} aria-hidden>
      <circle
        cx={32}
        cy={32}
        r={29}
        fill="#c9a46a"
        stroke="#7a5230"
        strokeWidth={2}
      />
      <circle
        cx={32}
        cy={32}
        r={23}
        fill="#f3efe4"
        stroke="#7a5230"
        strokeWidth={1.5}
      />
      {['N', 'E', 'S', 'W'].map((letter, i) => (
        <text
          key={letter}
          x={32 + Math.sin((i * Math.PI) / 2) * 17}
          y={32 - Math.cos((i * Math.PI) / 2) * 17 + 3}
          textAnchor="middle"
          fontSize={7}
          fontWeight={700}
          fill="#15214a"
          fontFamily="var(--font-heading), sans-serif"
        >
          {letter}
        </text>
      ))}
      <g
        ref={needleRef}
        style={{
          transformOrigin: '32px 32px',
          transformBox: 'view-box',
          transition: 'transform .25s ease-out',
        }}
      >
        <path d="M32 14 L36 32 L28 32 Z" fill="#c62232" />
        <path d="M32 50 L36 32 L28 32 Z" fill="#15214a" />
      </g>
      <circle cx={32} cy={32} r={2.5} fill="#f5b919" stroke="#15214a" />
    </svg>
  );
}
