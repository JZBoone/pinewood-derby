import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-7 inline-flex items-center gap-1.5 text-sm no-underline hover:underline"
    >
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
