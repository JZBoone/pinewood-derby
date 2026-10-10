const PLACE_FILLS: Record<number, string> = {
  1: 'var(--cs-yellow)',
  2: '#c9ccd6',
  3: '#c98a4b',
};

// A diamond for places 1–3. Other places render as a plain number.
export default function PlaceMark({ place }: { place: number }) {
  const fill = PLACE_FILLS[place];
  if (!fill) {
    return <span className="tabular-nums">{place}</span>;
  }
  return (
    <span
      className="inline-flex size-[26px] rotate-45 items-center justify-center rounded-[3px]"
      style={{ background: fill }}
      aria-label={`Place ${place}`}
    >
      <span className="-rotate-45 font-(family-name:--font-heading) text-[13px] leading-none font-bold text-[#15214a] tabular-nums">
        {place}
      </span>
    </span>
  );
}
