import { getDerbyById } from '@/api-biz/derby';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const derby = await getDerbyById(Number((await params).id)).catch(() => null);
  const name = derby ? `${new Date(derby.time).getFullYear()} derby` : 'Derby';
  // A plain string title here would drop the root template for child routes.
  return {
    title: {
      absolute: `${name} · Pack 272 Derby`,
      template: '%s · Pack 272 Derby',
    },
  };
}

export default function DerbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
