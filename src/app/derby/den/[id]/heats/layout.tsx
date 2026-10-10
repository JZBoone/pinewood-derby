import { getDenById } from '@/api-biz/den';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const den = await getDenById(Number((await params).id)).catch(() => null);
  return { title: den ? `Den ${den.name} heats` : 'Heats' };
}

export default function DenHeatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
