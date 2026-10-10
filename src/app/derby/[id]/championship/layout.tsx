import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Championship' };

export default function ChampionshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
