'use client';

import { useEffect } from 'react';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'tent-scout': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

/**
 * The blue footer tent. Knocking on its door brings out a Cub Scout with a
 * slingshot. The custom element only loads in the browser, so the static
 * tent shows until it takes over.
 */
export default function TentScout({ className }: { className?: string }) {
  useEffect(() => {
    import('./tent-scout.js');
  }, []);

  return (
    <tent-scout
      className={className}
      style={{ '--tent-width': '190px' } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/campsite/tent-blue.svg"
        alt=""
        width={190}
        height={129}
        className="h-auto w-full"
      />
    </tent-scout>
  );
}
