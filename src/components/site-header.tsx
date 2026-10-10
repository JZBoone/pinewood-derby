'use client';

import { signIn, signOut, useSession } from '@/client-biz/auth';
import Link from 'next/link';
import PackPatch from './pack-patch';
import ThemeToggle from './theme-toggle';

export default function SiteHeader() {
  const { data: session } = useSession();

  const handleLogin = async () =>
    signIn.social({ provider: 'google', callbackURL: '/' });

  return (
    <header>
      <div className="h-2 bg-cs-yellow" />
      <nav className="flex items-center gap-2 border-b border-divider px-4 py-4 sm:gap-[18px] sm:px-10">
        <Link
          href="/"
          className="mr-auto flex min-w-0 items-center gap-2 text-inherit no-underline hover:text-inherit sm:gap-3"
        >
          <PackPatch />
          <span className="truncate font-(family-name:--font-heading) text-base font-semibold font-stretch-112% sm:text-lg">
            Pinewood Derby
          </span>
        </Link>
        <ThemeToggle />
        {session ? (
          <>
            <span className="hidden sm:inline">{session.user.name}</span>
            <button
              type="button"
              className="btn-outline"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </>
        ) : (
          <button type="button" className="btn-outline" onClick={handleLogin}>
            <span>
              Sign in<span className="hidden sm:inline"> with Google</span>
            </span>
          </button>
        )}
      </nav>
    </header>
  );
}
