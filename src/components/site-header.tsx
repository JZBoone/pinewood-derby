'use client';

import { signIn, signOut, useSession } from '@/client-biz/auth';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import PackPatch from './pack-patch';
import Skeleton from './skeleton';
import ThemeToggle from './theme-toggle';

export default function SiteHeader() {
  const { data: session, isPending } = useSession();

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
        {isPending ? (
          <Skeleton className="h-[38px] w-[78px] sm:w-[178px]" />
        ) : session ? (
          <>
            <span className="hidden sm:inline">{session.user.name}</span>
            {/* Phones have no room for the name, so show its initial. */}
            <span
              title={session.user.name}
              aria-label={`Signed in as ${session.user.name}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-divider font-(family-name:--font-heading) text-sm font-semibold sm:hidden"
            >
              {session.user.name.trim().charAt(0).toUpperCase()}
            </span>
            {/* Phones get an icon so the brand name isn't cut off. */}
            <button
              type="button"
              className="btn-outline px-2 sm:px-4"
              aria-label="Sign out"
              title="Sign out"
              onClick={() => signOut()}
            >
              <LogOut size={18} className="sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-outline px-3 sm:px-4"
            onClick={handleLogin}
          >
            <span>
              Sign in<span className="hidden sm:inline"> with Google</span>
            </span>
          </button>
        )}
      </nav>
    </header>
  );
}
