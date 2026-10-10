import { RANKS } from '@/lib/ranks';

interface RankBandProps {
  size: number;
  caption?: string;
  className?: string;
}

export default function RankBand({ size, caption, className }: RankBandProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3.5 ${className ?? ''}`}>
      {RANKS.map((rank) => (
        <span
          key={rank.name}
          title={rank.name}
          className="rotate-45 rounded-[2px]"
          style={{
            width: size,
            height: size,
            background: rank.fill,
            boxShadow: `0 0 0 2px var(--bg), 0 0 0 3px ${rank.edge}`,
          }}
        />
      ))}
      {caption && <span className="text-[13px] text-ink/65">{caption}</span>}
    </div>
  );
}
